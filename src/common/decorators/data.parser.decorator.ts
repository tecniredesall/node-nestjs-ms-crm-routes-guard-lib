import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import UserDto from '@app/auth0/dto/user.dto';
import ObjectID from 'bson-objectid';
import { isValidObjectId } from 'mongoose';

const clearNulls = (payload) => {
  for (const key in payload) {
    if (Array.isArray(payload[key])) {
      for (const keySubitem in payload[key]) {
        payload[key][keySubitem] = clearNulls(payload[key][keySubitem]);
      }
    } else {
      if (payload[key] === null) {
        delete payload[key];
        console.log('is null:', key);
      }
    }
  }
  return payload;
};
/**
 * Parser for person payload,
 * set created by value and whatever you want
 */
export const DataParser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    if (request.params?.id) {
      if (!isValidObjectId(request.params.id)) {
        throw new BadRequestException('id param is not valid');
      }

      if (request.method == 'PUT') {
        request.body._id = ObjectID(request.params.id);
        request.body = clearNulls(request.body); // clear all null values
      }
    }

    if (request.user) {
      const user = <UserDto>request.user;
      request.body.created_by = ObjectID(user.getAuthId());
    }

    //Apply transformations in the payload or any transformation
    //for example:
    //transform to lower emails
    request.body.emails?.map(
      (item?) => (item.value = item?.value?.toLowerCase()?.trim()),
    );
    return request.body;
  },
);
