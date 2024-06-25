import { Schema } from 'mongoose';

function toJSON(schema: Schema, removeUpdatedAt = true) {
  schema.set('toJSON', {
    transform: (_doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;

      if (removeUpdatedAt) {
        delete ret.updatedAt;
      }

      return ret;
    },
  });

  schema.set('toObject', {
    transform: (_doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;

      if (removeUpdatedAt) {
        delete ret.updatedAt;
      }

      return ret;
    },
  });
}

export default toJSON;
