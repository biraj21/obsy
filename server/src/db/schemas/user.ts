import { Schema, model } from "mongoose";

export interface IUser {
  _id: Schema.Types.ObjectId;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const User = model<IUser>("User", userSchema);
