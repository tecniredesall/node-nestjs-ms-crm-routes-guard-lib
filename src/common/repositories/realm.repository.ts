import * as Realm from 'realm';
import ObjectID from 'bson-objectid';
import * as cloneDeep from 'clone-deep';

import { RealmManager } from '../../database/realm.manager';
import { BaseRepository } from './repository';
import { FilterPaginationQuery } from '../middleware/req-filterpaginate.middleware';

export abstract class RealmRepository<T> extends BaseRepository<T> {
  private filtered: Realm.Results<T>;
  protected modelName;

  constructor(modelName: string, private instance: string) {
    super();
    this.modelName = modelName;
  }

  get connection(): Realm {
    return RealmManager.Instance.getInstance(this.instance).getConnection();
  }

  async create(data: T | Partial<T>): Promise<T> {
    try {
      const transactionResponse = await this.connection.write<T>(() => {
        const entity = this.connection.create<T>(
          this.modelName,
          data as RealmInsertionModel<T>,
        );

        return entity;
      });

      return Promise.resolve(transactionResponse);
    } catch (err) {
      console.error(err);

      return Promise.reject(err);
    }
  }

  async findOne(filter: FilterPaginationQuery): Promise<T> {
    const query = filter.realmQuery;
    const sort = filter.realmSort;
    const data = this.connection.objects<T>(this.modelName);

    this.filtered = data;

    if (sort.length > 0) {
      this.filtered = this.filtered.sorted(sort);
    }
    if (this.hasQuery(query)) {
      this.filtered = data.filtered(query);
    }

    return Promise.resolve(this.filtered.length > 0 ? this.filtered[0] : null);
  }

  async findOneAndUpdate(
    filter: FilterPaginationQuery,
    data: Partial<T>,
  ): Promise<T> {
    try {
      const foundElement = await this.findOne(filter);
      if (!foundElement) return null;
      const transactionResponse = this.connection.write<T>(() => {
        return this.connection.create<T>(
          this.modelName,
          {
            ...foundElement,
            ...data,
          },
          Realm.UpdateMode.Modified,
        );
      });

      return Promise.resolve(transactionResponse);
    } catch (err) {
      console.log(err);

      return Promise.reject(err);
    }
  }

  async findByIdAndUpdate(id: ObjectID | string, data: Partial<T>): Promise<T> {
    try {
      const transactionResponse = this.connection.write<T>(() => {
        return this.connection.create<T>(
          this.modelName,
          {
            ...data,
            _id: typeof id === 'string' ? ObjectID(id) : id,
          },
          Realm.UpdateMode.Modified,
        );
      });

      return Promise.resolve(transactionResponse);
    } catch (err) {
      console.log(err);

      return Promise.reject(err);
    }
  }

  async findById(id: ObjectID): Promise<T> {
    try {
      const data = this.connection.objectForPrimaryKey<T>(
        this.modelName,
        Realm.BSON.ObjectId.createFromHexString(id.toHexString()),
      );

      return Promise.resolve(data);
    } catch (err) {
      console.error(err);

      return Promise.reject(err);
    }
  }

  async findByIdAndRemove(id: ObjectID): Promise<T> {
    try {
      const dataObject = this.connection.objectForPrimaryKey<T>(
        this.modelName,
        Realm.BSON.ObjectId.createFromHexString(id.toHexString()),
      );
      let data = dataObject;
      if (data) {
        data = cloneDeep(dataObject.objectSchema());
        await this.connection.write(() => this.connection.delete(dataObject));
      }
      return data;
    } catch (err) {
      console.log(err);

      return Promise.reject(err);
    }
  }

  async find(filter?: FilterPaginationQuery): Promise<T[]> {
    const query = filter?.realmQuery || '';
    const sort = filter?.realmSort;
    const data = this.connection.objects<T>(this.modelName);

    this.filtered = data;

    if (sort && sort.length > 0) {
      this.filtered = this.filtered.sorted(sort);
    }
    if (this.hasQuery(query)) {
      this.filtered = data.filtered(query);
    }

    return Promise.resolve(Array.from(this.filtered)); // Convert iterator to array
  }

  async count(): Promise<number> {
    return Promise.resolve(this.filtered.length);
  }

  async paginate(filter: FilterPaginationQuery): Promise<T[]> {
    const data = await this.find(filter);
    const page = filter.page || 1;

    let list = data.slice((page - 1) * filter.limit, page * filter.limit);

    if (filter.fields.length) {
      list = list.map(this.selectProps(filter.fields.split(',')));
    }

    return list;
  }

  private selectProps(fields: Array<string>) {
    return function (obj) {
      const newObj: T = {} as T;

      fields.forEach((name) => {
        newObj[name] = obj[name];
      });

      return newObj;
    };
  }

  private hasQuery(query) {
    return query !== '';
  }
}
