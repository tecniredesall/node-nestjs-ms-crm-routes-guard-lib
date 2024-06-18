import * as mongoose from 'mongoose';
import { Schema, schemaBase, schemaOptions } from '../../common/schemas/Model';

export const TasksSchema = new Schema(
  {
    text: String,
    assignee: {
      type: Schema.Types.ObjectId,
      ref: 'Example',
    },
    ...schemaBase,
  },
  schemaOptions,
);

export const Tasks = mongoose.model('Tasks', TasksSchema, 'Tasks');
