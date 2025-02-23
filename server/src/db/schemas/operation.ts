import { Schema, model } from "mongoose";

interface IOperation {
  _id: Schema.Types.ObjectId;
  label: string;
  vendor: string;
  type: string;
  inputs: any[];
  result: any;
  error: any;
  startedAt: Date;
  endedAt: Date;
  duration: number;
  trace: Schema.Types.ObjectId;
}

const operationSchema = new Schema<IOperation>({
  label: { type: String, required: true },
  vendor: { type: String, required: true },
  type: { type: String, required: true },
  inputs: [{ type: Schema.Types.Mixed }],
  result: { type: Schema.Types.Mixed, required: true },
  error: { type: Schema.Types.Mixed },
  startedAt: { type: Date, required: true },
  endedAt: { type: Date, required: true },
  duration: { type: Number, required: true },
  trace: { type: Schema.Types.ObjectId, ref: "Trace", required: true },
});

export const Operation = model<IOperation>("Operation", operationSchema);
