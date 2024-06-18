import { DynamicModule, Module } from '@nestjs/common';
import { databaseProviders } from './database.providers';

@Module({})
export class DatabaseModule {
  static register(source: string): DynamicModule {
    const database: any = databaseProviders.find((db: any) => {
      return db.provide === source;
    });
    if (database) database.useFactory();
    return {
      module: DatabaseModule,
    };
  }
}
