import { Schema, model } from "mongoose";

export interface IApiKey {
  _id: Schema.Types.ObjectId;
  key: string;
  label: string;
  createdBy: string;
  createdAt: Date;
}

const apiKeySchema = new Schema<IApiKey>({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  label: { type: String, required: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

apiKeySchema.index({ key: 1 });

export const ApiKey = model<IApiKey>("ApiKey", apiKeySchema);
