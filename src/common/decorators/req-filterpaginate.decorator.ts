import {
  createParamDecorator,
  ExecutionContext,
  NotAcceptableException,
} from '@nestjs/common';
import {
  FilterPaginationQuery,
  FilterValidation,
} from '../middleware/req-filterpaginate.middleware';

export const FilterPaginate = createParamDecorator(
  (data: FilterValidation = null, ctx: ExecutionContext) => {
    const res = ctx.switchToHttp().getResponse();
    const filterPaginationQuery: FilterPaginationQuery =
      res.locals.filterPaginationQuery;
    if (data) {
      if (!filterPaginationQuery.isQueryAllowed(data))
        throw new NotAcceptableException({
          message: 'Filter query parameter has an unacceptable search criteria',
          filter: filterPaginationQuery.mongoQuery,
        });
    }

    return res.locals.filterPaginationQuery;
  },
);
