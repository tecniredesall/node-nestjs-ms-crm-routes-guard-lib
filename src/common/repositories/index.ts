import configuration from '@app/config/configuration';
import { DynamicModule, Type } from '@nestjs/common';
import { ModelDefinition, MongooseModule } from '@nestjs/mongoose';
import { MongoRepository } from './mongo.repository';
import { RealmRepository } from './realm.repository';
import { BaseRepository } from './repository';
import { Document } from 'mongoose';

export function isMongoSelected() {
  return configuration.databases.default === 'mongo';
}

/**
 * Select the correct repository according to the app's database configuration.
 * @param mongoRepository - Repository to use when mongo is defined in the configuration
 * @param realmRepository - Repository to use when realm is defined in the configuration
 * @returns repository
 */
export function makeRepository(
  mongoRepository: Type<MongoRepository<unknown & Document>>,
  realmRepository: Type<RealmRepository<unknown>>,
): Type<BaseRepository<unknown>> {
  if (isMongoSelected()) {
    return mongoRepository;
  }

  return realmRepository;
}

/**
 * If the app is configured to use mongo as the database, make the required imports.
 * @param definitions - The model definitions for mongoose
 * @returns {DynamicModule[]} - The modules required for mongoose to work correctly or an empty array if mongo is not the selected database
 */
export function makeImports(definitions: ModelDefinition[]): DynamicModule[] {
  if (isMongoSelected()) {
    return [
      MongooseModule.forRoot(configuration.databases.mongo.uri),
      MongooseModule.forFeature(definitions),
    ];
  }
  return [];
}

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-interface */
export interface IRepository {}
