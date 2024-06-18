import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import axios from 'axios';
import { CustomError } from '@app/common/utils/ErrorParser';

const fixedPattern = (pattern) => {
  pattern = pattern[0] != '/' ? `/${pattern}/` : `${pattern}`;
  const fixed = pattern.replace(/^\/|\/$/g, '');
  return fixed;
};

@Injectable()
export class MsformsValidatorService {
  private payload = null;
  private context = null;
  private collection = null;
  private httpClient = null;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    this.httpClient = axios.create({
      baseURL: process.env['MSFORMS_URL'],
    });
  }

  /**
   *
   * @param payload
   * Se analiza el payload buscando en extras la property person_type
   * que nos dice las reglas de validacion a aplicar obtenidas del ms forms
   */
  private setContext(payload) {
    if (payload.hasOwnProperty('extras')) {
      const personTypeIndex = payload.extras.findIndex(
        (item) => item.key === 'person_type',
      );
      if (personTypeIndex >= 0) {
        const definedContext = [];
        if (payload.extras[personTypeIndex].values.length > 0) {
          for (const itemContext of payload.extras[personTypeIndex].values) {
            definedContext.push(itemContext.value);
          }
        }
        this.context = definedContext.join(',');
      }
    }
  }

  public async validatePayload(payload: any, collection: string) {
    this.setContext(payload);
    this.payload = payload;
    this.collection = collection;
    return await this.applyValidations();
  }

  // Get rules from form microservice
  private async applyValidations() {
    const { _partitionKey } = this.payload;
    let errorGettingRules = false;
    //@TODO contemplar validacion sin context, hacer pruebas cuando se indique
    const requestUrl = this.context
      ? `?filter={"_partitionKey": "${_partitionKey}","coll_name": "${this.collection}",  "context": "${this.context}"}`
      : `?filter={"_partitionKey": "${_partitionKey}","coll_name": "${this.collection}"}`;

    const keyCache = this.context
      ? `msform-rules.${_partitionKey}.${this.collection}.${this.context}`
      : `msform-rules.${_partitionKey}.${this.collection}`;
    const msFormSections = await this.httpClient
      .get(requestUrl)
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        console.log(JSON.stringify(err, null, 3));
        //error getting rules from msforms
        errorGettingRules = true;
      });

    let rulesToApply = [];
    if (
      !errorGettingRules &&
      msFormSections.data &&
      msFormSections.data.length > 0
    ) {
      for (const section of msFormSections.data) {
        for (const field of section.fields) {
          if (field.rules && field.rules.length > 0) {
            const { path, key, rules } = field;
            const fieldKey = path ? path.replace('*', key) : key;
            //field has rules to apply
            rulesToApply.push({
              full_path: fieldKey,
              key,
              rules,
            });
          }
        }
      }
      //console.log(JSON.stringify(rulesToApply, null, 3));

      //To disable expiration of the cache, set the ttl configuration property to 0:
      // or set a ttl time in seconds
      await this.cacheManager.set(keyCache, rulesToApply, { ttl: 0 });
    } else {
      //Get rules from memory, there are some problems getting rules from msforms api
      rulesToApply = await this.cacheManager.get(keyCache);
      if (!rulesToApply) {
        rulesToApply = [];
      } else {
        // Si hay rules en memory cache
        const cacheData = {
          message: `Getting rules from memory cache on time: ${new Date()}`,
          cacheKey: keyCache,
          rules: rulesToApply,
        };
        console.log(cacheData);
      }
    }

    // are there rules to apply?
    if (rulesToApply.length > 0) {
      return this.validDynamicRules(rulesToApply);
    } else {
      return false;
    }
  }

  private resolveValidation(rule, data, field, fieldProperty, submitEvent) {
    const fieldExistsInPayload = typeof data !== 'undefined';
    let errorsFound = null;
    switch (rule) {
      case 'required':
        if (Array.isArray(data)) {
          const indexItemError = data.findIndex((item) => {
            return typeof item[fieldProperty] === 'undefined';
          });
          if (indexItemError >= 0) {
            errorsFound = this.genericError(field, submitEvent, indexItemError);
          }
        } else {
          if (typeof data === 'undefined') {
            errorsFound = this.genericError(field, submitEvent);
          }
        }
        break;
      case 'pattern':
        if (fieldExistsInPayload) {
          if (Array.isArray(data)) {
            const indexItemError = data.findIndex((item) => {
              const matchPattern = new RegExp(
                fixedPattern(submitEvent.value),
              ).test(item[fieldProperty]);
              return !matchPattern;
            });
            if (indexItemError >= 0) {
              errorsFound = this.genericError(
                field,
                submitEvent,
                indexItemError,
              );
            }
          } else {
            const matchPattern = new RegExp(
              fixedPattern(submitEvent.value),
            ).test(data);
            if (!matchPattern) {
              errorsFound = this.genericError(field, submitEvent);
            }
          }
        }
        break;
      case 'min_length':
        if (fieldExistsInPayload) {
          if (Array.isArray(data)) {
            const indexItemError = data.findIndex((item) => {
              const itemValue = item[fieldProperty];
              return itemValue.length < submitEvent.value;
            });
            if (indexItemError >= 0) {
              errorsFound = this.genericError(
                field,
                submitEvent,
                indexItemError,
              );
            }
          } else {
            if (data.length < submitEvent.value) {
              errorsFound = this.genericError(field, submitEvent);
            }
          }
        }
        break;
      case 'max_length':
        if (fieldExistsInPayload) {
          if (Array.isArray(data)) {
            const indexItemError = data.findIndex((item) => {
              const itemValue = item[fieldProperty];
              return itemValue.length > submitEvent.value;
            });
            if (indexItemError >= 0) {
              errorsFound = this.genericError(
                field,
                submitEvent,
                indexItemError,
              );
            }
          } else {
            if (data.length > submitEvent.value) {
              errorsFound = this.genericError(field, submitEvent);
            }
          }
        }
        break;
    }

    return errorsFound;
  }

  private validDynamicRules(rulesToApply) {
    for (const field of rulesToApply) {
      const fieldsPath = field.full_path.split('.');
      let foundPayloadValue = this.searchPayloadValue(
        this.payload,
        fieldsPath,
        0,
      );

      const isExtras = fieldsPath[0] === 'extras';
      if (isExtras && foundPayloadValue.length > 0) {
        foundPayloadValue = foundPayloadValue.find(
          (item) => item.key === field.key,
        );
        foundPayloadValue = foundPayloadValue?.values;
      }

      //const fieldExistsInPayload = typeof foundPayloadValue !== 'undefined';
      for (const ruleField of field.rules) {
        //check only submit events
        const submitEvent = ruleField.events.find(
          (event) => event.event_name == 'submit',
        );

        let errorsFound = null;
        //Apply validations only for rules with event validation name equal to submit
        if (typeof submitEvent !== 'undefined') {
          errorsFound = this.resolveValidation(
            ruleField.rule,
            foundPayloadValue,
            field,
            isExtras ? 'value' : field.key,
            submitEvent,
          );
        }

        if (errorsFound) {
          return errorsFound;
        }
      }
    }

    return false;
  }

  private genericError(field, submitEvent, itemIndex = -1) {
    const context = this.context;
    const fieldError =
      itemIndex < 0
        ? `${field.full_path}`
        : field.full_path.replace('.', `.${itemIndex}.`);

    const parsedErrors = Object.entries(submitEvent.errors).map((errorMsg) =>
      errorMsg[1].toString().replace('{{value}}', `'${submitEvent.value}'`),
    );
    return CustomError('msforms-0001', 'Validation Field', {
      message: `Error validating field '${fieldError}'`,
      context,
      field_error: fieldError,
      related_errors: parsedErrors,
    });
  }

  private searchPayloadValue(currentPayload, fieldsPath, index) {
    //Llegamos al final del recorrido
    //fieldsPath example ['emails', 'id'] => emails.id
    if (
      index + 1 >= fieldsPath.length ||
      typeof currentPayload[fieldsPath[index]] === 'undefined' //
    ) {
      return Array.isArray(currentPayload)
        ? currentPayload
        : currentPayload[fieldsPath[index]];
    }
    //Go to the next depth level
    return this.searchPayloadValue(
      currentPayload[fieldsPath[index]],
      fieldsPath,
      index + 1,
    );
  }
}
