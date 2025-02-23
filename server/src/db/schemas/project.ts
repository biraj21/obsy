import { Schema, model } from "mongoose";

export interface IProject {
  _id: Schema.Types.ObjectId;
  name: string;
  createdAt: Date;
  createdBy: Schema.Types.ObjectId;
}

const projectSchema = new Schema<IProject>({
  name: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

export const Project = model<IProject>("Project", projectSchema);
