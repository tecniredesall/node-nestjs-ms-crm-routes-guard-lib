import * as mongoose from 'mongoose';
import { Schema, schemaBase, schemaOptions } from '../../common/schemas/Model';

const NamesSchema = new Schema(
  {
    description: {
      type: String,
    },
    value: {
      type: String,
    },
    language: {
      type: String,
    },
  },
  schemaOptions,
);
export const ExampleSchema = new Schema(
  {
    slug: String,
    names: [
      {
        type: NamesSchema,
      },
    ],
    tasks: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Tasks',
      },
    ],
    ...schemaBase,
  },
  schemaOptions,
);

export const Example = mongoose.model('Example', ExampleSchema, 'Example');
