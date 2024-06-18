/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CustomResponse<T> {}

const parseExceptionErrors = (errors) => {
  const statusCode =
    errors instanceof HttpException
      ? errors.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
  const message =
    errors instanceof HttpException ? errors.message : 'Internal server error';

  const errorResponse: any = {
    timestamp: new Date().toISOString(),
    title: errors?.name,
    internal_code: 'request-error',
    detail: errors?.message,
    statusCode,
  };
  return errorResponse;
};

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, CustomResponse<T>>
{
  private replaceMongoId(item: any) {
    const tmp = {};
    const mongoID = item.hasOwnProperty('_id') ? item._id : null;
    if (mongoID) {
      delete item._id;
      tmp['id'] = mongoID;
      return { ...tmp, ...item };
    }
    return item;
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<CustomResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        const response = context.switchToHttp().getResponse();
        const request = context.switchToHttp().getRequest();

        let responseData = {};
        //if errors, set custom status code received
        if (data?.errors) {
          const customError = parseExceptionErrors(data.errors);
          if (!customError.title) {
            responseData = {
              path: request.url,
              errors: { ...data.errors, method: request.method },
            };
          } else {
            responseData = {
              path: request.url,
              errors: { ...customError, method: request.method },
            };
          }

          data.statusCode = data.statusCode || customError.statusCode || 406;
          response.status(data.statusCode);
        } else if (data) {
          // Creating a new item
          if (typeof data === 'object' && data.hasOwnProperty('location')) {
            response.status(201).location(data.location);
            responseData = { data: [data] };
          }

          // Returning a single item
          else if (typeof data === 'object') {
            if (data.hasOwnProperty('data')) {
              //response contains data, meta and extra properties
              responseData = { ...this.replaceMongoId(data) };
            } else {
              responseData = { data: this.replaceMongoId(data) };
            }
          } else {
            response.status(500);
            responseData = {
              path: request.url,
              errors: [
                {
                  internal_code: 'global-00002',
                  title: 'Internal Server Error',
                  detail: data,
                },
              ],
            };
          }
        } else {
          response.status(404);
          responseData = {
            path: request.url,
            errors: [
              {
                internal_code: 'global-00001',
                title: 'Not Found',
                detail: 'Path or item not found.',
              },
            ],
          };
        }

        return responseData;
      }),
    );
  }
}
