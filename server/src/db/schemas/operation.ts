import { Schema, model } from "mongoose";

interface IOperation {
  _id: Schema.Types.ObjectId;
  inputs: any[];
  results: any;
  type: string;
  trace: Schema.Types.ObjectId;
}

const operationSchema = new Schema<IOperation>({
  inputs: [
    {
      type: Schema.Types.Mixed,
    },
  ],
  results: {
    type: Schema.Types.Mixed,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  trace: {
    type: Schema.Types.ObjectId,
    ref: "Trace",
    required: true,
  },
});

export const Operation = model<IOperation>("Operation", operationSchema);
