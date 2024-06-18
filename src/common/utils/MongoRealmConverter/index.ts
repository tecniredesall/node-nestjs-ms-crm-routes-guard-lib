import * as parser from 'mongodb-query-parser';
import * as dot from 'dot-object';

type ParamTypes = [string, any];

function isRegexObject(obj: object) {
  return obj instanceof RegExp;
}

function isObject(obj: any) {
  return typeof obj === 'object' && !Array.isArray(obj);
}

function isString(str: any) {
  return typeof str === 'string';
}

function containsCurlyBraces(str: string) {
  return /{|}/.test(str);
}

export function convertObjectToString(obj: object): string {
  if (!Object.keys(obj).length) {
    return '{}';
  }

  if (isString(obj)) return `"${obj}"`;
  return (
    Object.entries(obj)
      .map(([key, value]: ParamTypes) => [
        key,
        value && isObject(value) && !isRegexObject(value)
          ? convertObjectToString(value)
          : value,
      ])
      .reduce((result, [key, value]: ParamTypes) => {
        if (Array.isArray(value)) {
          result += `"${key}": [${value
            .map(convertObjectToString)
            .join(', ')}], `;

          return result;
        }

        if (isString(value) && !containsCurlyBraces(value)) {
          result += `"${key}": "${value}", `;
        }

        if (!isString(value) || containsCurlyBraces(value)) {
          result += `"${key}": ${value}, `;
        }

        return result;
      }, '`{')
      .slice(1, -2) + '}'
  );
}

export function removeEmptyKeyFromQuery(obj: object): object {
  return Object.entries(obj)
    .map(([key, value]: ParamTypes) => [
      key,
      value && isObject(value) && !isRegexObject(value)
        ? removeEmptyKeyFromQuery(value)
        : value,
    ])
    .reduce((prev, [key, value]: ParamTypes) => {
      if (value === '') {
        return prev;
      }

      if (
        isObject(value) &&
        !isRegexObject(value) &&
        !Object.keys(value).length
      ) {
        return prev;
      }

      prev[key] = value;

      return prev;
    }, {});
}

export function parseMongoQuery(query: string) {
  const cleanedQuery = removeEmptyKeyFromQuery(parser.parseFilter(query));
  const convertedToString = convertObjectToString(cleanedQuery);
  const parsedQuery = parser(convertedToString);

  if (parsedQuery === '') {
    throw new SyntaxError('Could not parse query: ' + query);
  }
  return parsedQuery;
}

function parseOperator(parentKey: string, operator: string, items: object[]) {
  parentKey = parentKey.replace('.' + operator, '').replace(operator, '');
  let parsedItems = [];
  if (parentKey) {
    for (const value of items) {
      const output = {};
      for (const key in value) {
        output[`${parentKey}.${key}`] = value[key];
      }
      parsedItems.push(output);
    }
  } else {
    parsedItems = items;
  }
  parsedItems = parsedItems.map(mongoToRealmQuery);
  parsedItems = parsedItems.filter(function (value) {
    return value != null;
  });
  const realmOperator = operator.replace('$', '').toUpperCase();

  if (parsedItems.length > 1)
    return '(' + parsedItems.join(`) ${realmOperator} (`) + ')';

  return parsedItems[0];
}

function neighborPropertiesToAnd(mongoQuery: object): object {
  const mongoQueryKeys = Object.keys(mongoQuery);
  if (mongoQueryKeys.length > 1) {
    if (mongoQueryKeys.includes('$regex')) {
      return {
        $regex: new RegExp(mongoQuery['$regex'], mongoQuery['$options']),
      };
    }

    return {
      $and: Object.entries(mongoQuery).map(([key, value]) => {
        if (isObject(value)) {
          return { [key]: neighborPropertiesToAnd(value) };
        }
        return { [key]: value };
      }),
    };
  } else {
    const queryEntries = Object.entries(mongoQuery);
    if (queryEntries.length === 0) return mongoQuery;
    const [key, value] = queryEntries[0];
    if (isObject(value) && !(value instanceof RegExp)) {
      return { [key]: neighborPropertiesToAnd(value) };
    }
    return mongoQuery;
  }
}

export function mongoToRealmQuery(mongoQuery: object): string {
  const expressions = [];
  mongoQuery = neighborPropertiesToAnd(mongoQuery);
  dot.keepArray = true;
  const dottedEntries = dot.dot(mongoQuery);
  for (const [key, value] of Object.entries(dottedEntries)) {
    if (key.endsWith('$or')) {
      const orExpression = parseOperator(key, '$or', value as object[]);
      expressions.push(orExpression);
    } else if (key.endsWith('$and')) {
      const andExpression = parseOperator(key, '$and', value as object[]);
      expressions.push(andExpression);
    } else if (key.endsWith('$regex')) {
      const newKey = key.replace('.$regex', '');
      if (typeof value === 'string') {
        const transformedValue = (value as string).replace(/\.\*/g, '*');
        expressions.push(`${newKey} LIKE '${transformedValue}'`);
      } else {
        const regexStr = (value as RegExp).toString();
        const lastSlashIndex = regexStr.lastIndexOf('/');
        const regex = regexStr.slice(1, lastSlashIndex);
        const options = regexStr.slice(lastSlashIndex + 1);
        if (options !== 'i') {
          throw Error('"$options" can only have the value "i"');
        }

        const transformedValue = regex.replace(/\.\*/g, '*');
        expressions.push(`${newKey} LIKE[c] '${transformedValue}'`);
      }
    } else if (key.endsWith('$in')) {
      const props = key.replace('.$in', '').split('.');
      const leafKey = props.splice(-1).pop();
      const parentKey = props.join('.');

      const transformedValue = (value as any[]).map((v) => {
        return { [leafKey]: v };
      });
      const orExpression = parseOperator(parentKey, '$or', transformedValue);
      expressions.push(orExpression);
    } else if (value != '') {
      const transformedValue = isString(value) ? `'${value}'` : value;
      expressions.push(`${key} == ${transformedValue}`);
    }
  }

  if (expressions.length > 1) return expressions.join(' AND ');
  return expressions[0];
}

export function allowedQueryCriteria(
  mongoQuery: object,
  allowlist: RegExp[] = [],
  denylist: RegExp[] = [],
): boolean {
  if (allowlist.length + denylist.length === 0) return true;

  const dottedEntries = {};
  dot.keepArray = false;
  dot.dot(mongoQuery, dottedEntries);

  for (const property in dottedEntries) {
    for (const denyRegex of denylist) {
      const isPropertyDenied = property.match(denyRegex);
      if (isPropertyDenied) return false;
    }

    if (allowlist.length > 0) {
      const allowMatches = allowlist.filter((allowRegex) =>
        property.match(allowRegex),
      );
      const isPropertyAllowed = allowMatches.length > 0;
      if (!isPropertyAllowed) return false;
    }
  }
  return true;
}

export function mongoToRealmSort(mongoSort): any[] {
  return Object.entries(mongoSort).map(([key, value]) => [
    key,
    value === 1 ? true : false,
  ]);
}
