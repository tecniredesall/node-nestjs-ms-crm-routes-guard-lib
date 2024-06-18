import { Document, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

import { MongoRepository } from '@app/common/repositories/mongo.repository';
import { IExample } from '../interfaces';
import { IRepository } from '../interfaces/repository';

export type ExampleDocument = IExample & Document;

@Injectable()
export class ExampleMongoRepository
  extends MongoRepository<ExampleDocument>
  implements IRepository
{
  constructor(
    @InjectModel('Example')
    private exampleModel: Model<ExampleDocument>,
  ) {
    super(exampleModel);
  }

  async findAll() {
    return this.exampleModel.find({});
  }
}
