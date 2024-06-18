import { Injectable } from '@nestjs/common';
import ObjectID from 'bson-objectid';

import { FilterPaginationQuery } from '@app/common/middleware/req-filterpaginate.middleware';
import { PageLinksDto } from '@app/common/dtos/page-links.dto';
import { PageDto, PageMetaDto } from '@app/common/dtos';
import { S3Service } from '@app/aws/s3.service';

import { CreateExampleDto } from './dto/create-example.dto';
import { UpdateExampleDto } from './dto/update-example.dto';
import { IExample } from './interfaces';
import { ExampleNotDeleted, ExampleNotFound } from './example.errors';
import {
  ExampleMongoRepository,
  ExampleDocument,
} from './repositories/example.mongo.repository';
import { PubMessagingService } from '@app/messaging/pub-messaging.service';
//import { PrismaService } from '@app/prisma/prisma.service'; //if you need to use prism uncomment

@Injectable()
export class ExampleService {
  constructor(
    private readonly messagingService: PubMessagingService,
    private readonly exampleRepository: ExampleMongoRepository,
    private readonly s3Service: S3Service, //private readonly prismaService: PrismaService, //if you need to use prism uncomment
  ) {}

  async create(body: CreateExampleDto): Promise<any> {
    //Send data to rabbitmq exchange using routing key
    const data = {
      ...body,
      _id: ObjectID(),
    };
    const exampleDoc = await this.exampleRepository.create(data);
    //this.messagingService.sendExchange('crm-example.created', exampleDoc);
    return exampleDoc;
  }

  async findAll(): Promise<IExample[]> {
    return await this.exampleRepository.findAll();
  }

  async findOne(id: string): Promise<IExample> {
    const data = await this.exampleRepository.findById(ObjectID(id));
    if (!data) {
      throw new ExampleNotFound(id);
    }
    return data;
  }

  async update(
    id: string,
    updateExampleDto: UpdateExampleDto,
  ): Promise<IExample> {
    const data = await this.exampleRepository.findByIdAndUpdate(
      ObjectID(id),
      updateExampleDto,
    );
    if (!data) {
      throw new ExampleNotFound(id);
    }
    return data;
  }

  async remove(id: string): Promise<any> {
    const data = await this.exampleRepository.findByIdAndRemove(ObjectID(id));
    if (!data) {
      throw new ExampleNotDeleted(id);
    }
    return data;
  }

  async findPaginate(
    filter: FilterPaginationQuery,
  ): Promise<PageDto<IExample>> {
    const data = await this.exampleRepository.paginate(filter);
    const total = await this.exampleRepository.count(filter);

    const meta = new PageMetaDto({
      pageOptionsDto: {
        page: filter.page,
        skip: filter.limit,
      },
      total_elements: total,
      page_size: data.length,
    });
    return new PageDto<ExampleDocument>(
      data,
      meta,
      new PageLinksDto(meta, 'example/query'),
    );
  }

  async uploadFile(file: Express.Multer.File) {
    return await this.s3Service.upload(file);
  }

  //if you need to use prism uncomment
  //async findPrisma(): Promise<any> {
  //  return await this.prismaService.user.findMany();
  //}
}
