import { Schema, schemaBase, schemaOptions } from '../../common/schemas/Model';

const RolesSchema = new Schema(
  {
    id: {
      type: String,
    },
    slug: {
      type: String,
    },
  },
  { ...schemaOptions, _id: false },
);

const PermissionsSchema = new Schema(
  {
    id: {
      type: Schema.Types.String,
      required: true,
    },
    slug: {
      type: Schema.Types.String,
    },
  },
  { ...schemaOptions, _id: false },
);

const ExtrasValuesSchema = new Schema(
  {
    value_id: {
      type: Schema.Types.ObjectId,
    },
    value: {
      type: Schema.Types.String,
      required: true,
    },
    value_type: {
      type: Schema.Types.String,
    },
    coll_name: {
      type: Schema.Types.String,
      required: true,
    },
  },
  { ...schemaOptions, _id: false },
);

const ExtrasSchema = new Schema(
  {
    key: {
      type: Schema.Types.String,
      required: true,
    },
    updated_at: {
      type: Schema.Types.Date,
      default: new Date(),
      required: true,
    },
    values: {
      type: [ExtrasValuesSchema],
      default: undefined,
      required: true,
    },
  },
  { ...schemaOptions, _id: false },
);

export const ProfileSchema = new Schema(
  {
    _id: Schema.Types.ObjectId,
    app: Schema.Types.String,
    slug: Schema.Types.String,
    description: Schema.Types.Mixed,
    roles: {
      type: [RolesSchema],
    },
    permissions: {
      type: [PermissionsSchema],
    },
    extras: {
      type: [ExtrasSchema],
    },
    ...schemaBase,
  },
  schemaOptions,
);
