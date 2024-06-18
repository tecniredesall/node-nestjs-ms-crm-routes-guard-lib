import ObjectID from 'bson-objectid';
import * as cloneDeep from 'clone-deep';

export abstract class MemoryRepository {
  public data = [];

  async findByIdAndUpdate(id: any, body: any) {
    if (!this.data[id]) {
      throw new Error('Not found');
    }

    this.data[id] = cloneDeep({
      ...this.data[id],
      ...body,
    });

    return Promise.resolve(this.data[id]);
  }

  async create(body: any = {}) {
    if (body._id) {
      if (this.data[body._id]) {
        throw new Error('Already exist');
      }
    } else {
      body._id = this.findNextId();
    }

    this.data[body._id] = cloneDeep(body);

    return cloneDeep(this.data[body._id]);
  }

  async find() {
    return Promise.resolve(cloneDeep(Object.values(this.data)));
  }

  async findById(id: string) {
    if (!this.data[id]) {
      throw new Error('Not found');
    }

    return cloneDeep(this.data[id]);
  }

  public async count() {
    return Promise.resolve(this.data.length);
  }

  async paginate() {
    const data = await this.find();

    return data;
  }

  private findNextId() {
    return ObjectID().toHexString();
  }
}
