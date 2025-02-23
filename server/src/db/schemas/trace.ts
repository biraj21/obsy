import { Schema, model } from "mongoose";

export interface ITrace {
  _id: Schema.Types.ObjectId;
  startedAt: Date;
  endedAt: Date;
  duration: number;
  request?: {
    url: string;
    method: string;
    query: Record<string, any>;
    headers: Record<string, any>;
    body: Record<string, any>;
  };
  metadata?: Record<string, any>;
  project: Schema.Types.ObjectId;
}

const traceSchema = new Schema<ITrace>({
  startedAt: { type: Date, required: true },
  endedAt: { type: Date, required: true },
  duration: { type: Number, required: true },
  request: { type: Schema.Types.Mixed },
  metadata: { type: Schema.Types.Mixed },
  project: {
    type: Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
});

export const Trace = model<ITrace>("Trace", traceSchema);
