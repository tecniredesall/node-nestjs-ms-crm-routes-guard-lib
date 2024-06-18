import { Example } from '../schemas/example.schema.realm';
import * as Realm from 'realm';

export class Task extends Realm.Object {
  public _id?: Realm.BSON.ObjectId;
  public _partitionKey = '';
  public text?: string;
  public assignee?: Realm.Results<Example>;

  public static schema: Realm.ObjectSchema = {
    name: 'Task',
    primaryKey: '_id',
    properties: {
      _id: 'objectId?',
      _partitionKey: 'string',
      text: 'string?',
      assignee: {
        type: 'linkingObjects',
        objectType: 'Example',
        property: 'tasks',
      },
    },
  };
}

export const TaskSchemas = [Task];
