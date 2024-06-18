import { Schema, schemaBase, schemaOptions } from '../../common/schemas/Model';

const RolesExtrasValuesSchema = new Schema(
  {
    coll_name: Schema.Types.String,
    value: Schema.Types.String,
    value_id: Schema.Types.ObjectId,
    value_type: Schema.Types.String,
  },
  {
    ...schemaOptions,
    _id: false,
  },
);

const RolesExtrasSchema = new Schema(
  {
    key: Schema.Types.String,
    updated_at: {
      type: Schema.Types.Date,
      default: new Date(),
    },
    values: [RolesExtrasValuesSchema],
  },
  {
    ...schemaOptions,
    _id: false,
  },
);

const RolesPermissionsSchema = new Schema(
  {
    id: Schema.Types.String,
    slug: Schema.Types.String,
  },
  {
    ...schemaOptions,
    _id: false,
  },
);

export const RolesSchema = new Schema(
  {
    type: Schema.Types.String,
    name: Schema.Types.Mixed,
    active: Schema.Types.Boolean,
    app: [Schema.Types.String],
    created_at: Schema.Types.Date,
    created_by: Schema.Types.String,
    deleted_at: Schema.Types.Date,
    description: Schema.Types.Mixed,
    extras: [RolesExtrasSchema],
    permissions: [RolesPermissionsSchema],
    slug: Schema.Types.String,
    status: Schema.Types.String,
    ...schemaBase,
  },
  schemaOptions,
);
