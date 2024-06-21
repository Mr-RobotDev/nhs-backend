import { Schema } from 'mongoose';

function toJSON(schema: Schema) {
  schema.set('toJSON', {
    transform: (_doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.updatedAt;
      return ret;
    },
  });

  schema.set('toObject', {
    transform: (_doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.updatedAt;
      return ret;
    },
  });
}

export default toJSON;
