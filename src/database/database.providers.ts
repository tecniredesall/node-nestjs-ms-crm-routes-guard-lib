import * as mongoose from 'mongoose';
import configuration from '../config/configuration';
import { RealmManager } from './realm.manager';

export const databaseProviders = [
  {
    provide: 'mongo',
    useFactory: async (): Promise<any> => {
      await mongoose.connect(`${configuration.databases.mongo.uri}`);
    },
  },
  {
    provide: 'realm',
    useFactory: async (): Promise<any> => {
      await RealmManager.Instance.setConnection(['public', 'organization']);
    },
  },
];
