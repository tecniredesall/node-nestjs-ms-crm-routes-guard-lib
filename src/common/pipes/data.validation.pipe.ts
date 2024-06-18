import { MsformsValidatorService } from '@app/validations/msforms-validator.service';
import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  NotAcceptableException,
} from '@nestjs/common';

@Injectable()
export class DataValidationPipe implements PipeTransform<any> {
  constructor(private readonly msformsValidator: MsformsValidatorService) {}

  /* eslint-disable @typescript-eslint/no-unused-vars */
  async transform(payload, metadata?: ArgumentMetadata) {
    //check not empty payload
    if (!payload) {
      throw new BadRequestException('No data submitted');
    }

    //Validate payload using msforms validator with people collection
    const errors = await this.msformsValidator.validatePayload(
      payload,
      'people',
    );

    // Errors in msforms
    if (errors) {
      throw new NotAcceptableException(errors);
    }

    /****
     * APPLY ANOTHER VALIDATION TYPES FOR PAYLOAD RECEIVED IF NEEDED
     */
    //pass payload to the next step
    return payload;
  }
}
