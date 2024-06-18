import ObjectID from 'bson-objectid';
import { Document, Model } from 'mongoose';
import { FilterPaginationQuery } from '../middleware/req-filterpaginate.middleware';
import { BaseRepository } from './repository';

export abstract class MongoRepository<
  T extends Document,
> extends BaseRepository<T> {
  constructor(protected entityModel: Model<T>) {
    super();
  }

  async create(data: T | Partial<T>): Promise<T> {
    const entity = new this.entityModel(data);

    return entity.save();
  }

  async findOne(filter: FilterPaginationQuery): Promise<T> {
    return this.entityModel.findOne(filter.mongoQuery);
  }

  async findOneAndUpdate(
    filter: FilterPaginationQuery,
    data: Partial<T>,
  ): Promise<T> {
    return this.entityModel.findOneAndUpdate(filter.mongoQuery, data, {
      new: true,
    });
  }

  async findByIdAndUpdate(id: ObjectID, data: Partial<T>): Promise<T> {
    return this.entityModel.findByIdAndUpdate(id, data, { new: true });
  }

  async findById(id: ObjectID): Promise<T> {
    return this.entityModel.findById(id);
  }

  async findByIdAndRemove(id: ObjectID): Promise<T> {
    return this.entityModel.findByIdAndRemove(id);
  }

  async find(filter: FilterPaginationQuery): Promise<T[]> {
    return this.entityModel.find(filter.mongoQuery).exec();
  }

  async count(filter: FilterPaginationQuery): Promise<number> {
    return this.entityModel.countDocuments(filter.mongoQuery);
  }

  async paginate(filter: FilterPaginationQuery): Promise<T[]> {
    filter.page = filter.page > 0 ? filter.page : 1;
    try {
      const fields = filter.fields.length
        ? filter.fields.replace(/\s/g, '').replace(/,/g, ' ')
        : '';
      return this.entityModel
        .find(filter.mongoQuery, fields)
        .skip((filter.page - 1) * filter.limit)
        .limit(filter.limit)
        .sort(filter.sort)
        .exec();
    } catch (err) {
      console.log(err);
    }
  }
}
