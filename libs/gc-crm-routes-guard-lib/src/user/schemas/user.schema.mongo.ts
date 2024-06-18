import { Schema, schemaBase, schemaOptions } from '../../common/schemas/Model';

const SubDocument = new Schema(
  {
    id: {
      type: Schema.Types.String,
    },
    slug: {
      type: Schema.Types.String,
    },
  },
  { ...schemaOptions },
);
const Value = new Schema(
  {
    value_id: {
      type: Schema.Types.String,
    },
    value: {
      type: Schema.Types.String,
    },
    value_type: {
      type: Schema.Types.String,
    },
    coll_name: {
      type: Schema.Types.String,
    },
  },
  { ...schemaOptions },
);
const External = new Schema({
  platform: {
    type: Schema.Types.String,
  },
  platform_id: {
    type: Schema.Types.String,
  },
  registered_at: {
    type: Schema.Types.Date,
  },
});
const Extra = new Schema(
  {
    key: {
      type: Schema.Types.String,
    },
    updated_at: {
      type: Schema.Types.Date,
    },
    values: [
      {
        type: Value,
      },
    ],
  },
  { ...schemaOptions },
);

const Link = new Schema(
  {
    apps: {
      type: Schema.Types.String,
    },
    active: {
      type: Schema.Types.String,
    },
    locations: [{ type: SubDocument }],
    profiles: [{ type: SubDocument }],
    roles: [{ type: SubDocument }],
    permissions: [{ type: SubDocument }],
    extras: [{ type: Extra }],
  },
  { ...schemaOptions },
);
export const UserSchema = new Schema(
  {
    _id: {
      type: Schema.Types.ObjectId,
    },
    email: {
      type: Schema.Types.String,
    },
    slug: {
      type: Schema.Types.String,
    },
    link: [{ type: Link }],
    externals: [{ type: External }],
    extras: [{ type: Extra }],
    active: {
      type: Schema.Types.Boolean,
    },
    status: {
      type: Schema.Types.String,
    },
    ...schemaBase,
  },
  schemaOptions,
);
