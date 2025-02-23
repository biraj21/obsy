import { Schema, model } from "mongoose";

export interface IApiKey {
  _id: Schema.Types.ObjectId;
  key: string;
  label: string;
  createdAt: Date;
  userId: Schema.Types.ObjectId;
}

const apiKeySchema = new Schema<IApiKey>({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  label: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true, // Index for faster queries by userId
  },
});

export const ApiKey = model<IApiKey>("ApiKey", apiKeySchema);
