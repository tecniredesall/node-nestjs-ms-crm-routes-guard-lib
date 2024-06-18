import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SortOrder } from 'mongoose';
import {
  allowedQueryCriteria,
  parseMongoQuery,
  mongoToRealmQuery,
  mongoToRealmSort,
} from './../../common/utils/MongoRealmConverter/index';

interface IFilterRequest extends Request {
  query: {
    filter: string | undefined;
    sort: any | undefined;
    page: string | undefined;
    limit: string | undefined;
    fields: string | undefined;
  };
}

type FilterPaginationQueryOptions = {
  mongoQueryString: string;
  sort: any;
  page: number;
  limit: number;
  fields: string;
};

export interface FilterValidation {
  allowlist?: RegExp[];
  denylist?: RegExp[];
}
export type sorOrder =
  | { [key: string]: SortOrder | { $meta: 'textScore' } }
  | string;
export class FilterPaginationQuery {
  mongoQuery: object;
  sort: sorOrder;
  page: number;
  limit: number;
  fields: string;

  constructor(filter: FilterPaginationQueryOptions) {
    this.mongoQuery = parseMongoQuery(filter.mongoQueryString);
    this.sort = this.parseSort(filter.sort);
    this.page = filter.page;
    this.limit = filter.limit;
    this.fields = filter.fields;
  }

  get realmQuery(): string {
    if (Object.keys(this.mongoQuery).length === 0) return '';

    return mongoToRealmQuery(this.mongoQuery);
  }

  get realmSort() {
    return mongoToRealmSort(this.sort);
  }

  get skip(): number {
    return (this.page - 1) * this.limit;
  }

  public isQueryAllowed({ allowlist = [], denylist = [] }: FilterValidation) {
    return allowedQueryCriteria(this.mongoQuery, allowlist, denylist);
  }

  private parseSort(sort): sorOrder {
    const sortAsJSON =
      typeof sort === 'string' ? this.parseSortToJSON(sort) : sort;
    const sortParsed = {};

    for (const key of Object.keys(sortAsJSON)) {
      const oldValue = sortAsJSON[key];

      if (![-1, 1, '-1', '1'].includes(sortAsJSON[key])) {
        throw new SyntaxError('Unexpected sort value: ' + oldValue);
      }

      sortParsed[key] = parseInt(oldValue);
    }

    return sortParsed;
  }

  private parseSortToJSON(sort) {
    if (!Object.keys(sort).length) {
      return sort;
    }

    try {
      return JSON.parse(sort);
    } catch (error) {
      throw new Error('Couldn`t parse sort to JSON');
    }
  }
}

@Injectable()
export class FilterPaginateMiddleware implements NestMiddleware {
  use(req: IFilterRequest, res: Response, next: NextFunction) {
    try {
      res.locals.filterPaginationQuery = new FilterPaginationQuery({
        mongoQueryString: req.query.filter || '{}',
        sort: req.query.sort || {},
        page: Math.max(0, parseInt(req.query.page || '0')),
        limit: req.query.limit ? parseInt(req.query.limit) : 10,
        fields: req.query.fields ? req.query.fields : '',
      });

      return next();
    } catch (e) {
      throw new BadRequestException({
        message: 'Incorrect filter syntax',
        error: e.message,
      });
    }
  }
}
