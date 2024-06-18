import { Schema, schemaBase, schemaOptions } from '../../common/schemas/Model';

const PermitsExtrasValuesSchema = new Schema(
  {
    coll_name: Schema.Types.String,
    value: Schema.Types.String,
    value_id: Schema.Types.String,
    value_type: Schema.Types.String,
  },
  {
    ...schemaOptions,
    _id: false,
  },
);

const PermitsExtrasSchema = new Schema(
  {
    key: Schema.Types.String,
    updated_at: {
      type: Schema.Types.Date,
      default: new Date(),
    },
    values: [{ type: PermitsExtrasValuesSchema }],
  },
  {
    ...schemaOptions,
    _id: false,
  },
);

const PermitsResourcesSchema = new Schema(
  {
    actions: [Schema.Types.String],
    slug: Schema.Types.String,
  },
  {
    ...schemaOptions,
    _id: false,
  },
);

export const PermitsSchema = new Schema(
  {
    _partitionKey: Schema.Types.String,
    active: Schema.Types.Boolean,
    app: Schema.Types.String,
    created_at: Schema.Types.Date,
    created_by: Schema.Types.String,
    deleted_at: Schema.Types.Date,
    description: Schema.Types.Mixed,
    section: Schema.Types.Mixed,
    extras: [{ type: PermitsExtrasSchema }],
    slug: Schema.Types.String,
    status: Schema.Types.String,
    resources: [{ type: PermitsResourcesSchema }],
    ...schemaBase,
  },
  schemaOptions,
);
