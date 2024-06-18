import * as Realm from 'realm';
import { Task } from './tasks.realm';

export class Example extends Realm.Object {
  _id?: Realm.BSON.ObjectId;
  _partitionKey: string;
  created_at?: Date;
  names: Realm.List<Names>;
  slug?: string;
  tasks: Realm.List<Task>;
  updated_at?: Date;

  public static schema: Realm.ObjectSchema = {
    name: 'Example',
    primaryKey: '_id',
    properties: {
      _id: 'objectId?',
      _partitionKey: 'string',
      created_at: 'date?',
      names: 'Example_names[]',
      slug: 'string?',
      tasks: 'Task[]',
      updated_at: 'date?',
    },
  };
}

export class Names extends Realm.Object {
  public _id: Realm.BSON.ObjectId;
  public description: string;
  public value: string;
  public static schema: Realm.ObjectSchema = {
    name: 'Example_names',
    embedded: true,
    properties: {
      _id: 'objectId?',
      description: 'string?',
      language: 'string?',
      value: 'string?',
    },
  };
}

export const ExampleSchemas = [Example, Names];
