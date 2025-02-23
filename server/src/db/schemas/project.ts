import { Schema, model } from "mongoose";

export interface IProject {
  _id: Schema.Types.ObjectId;
  name: string;
  createdBy: string;
  createdAt: Date;
}

const projectSchema = new Schema<IProject>({
  name: { type: String, required: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

projectSchema.index({ createdBy: 1 });

export const Project = model<IProject>("Project", projectSchema);
