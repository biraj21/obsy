import express from "express";
import { z } from "zod";
import { ObjectId } from "mongodb";

import { BadRequestError } from "#src/helpers/error.js";

import { Trace } from "#src/db/schemas/trace.js";
import { Operation } from "#src/db/schemas/operation.js";

// type definitions matching the SDK's trace structure
const OperationSchema = z.object({
  traceId: z.string(),
  label: z.string(),
  vendor: z.string(),
  type: z.string(),
  inputs: z.any(),
  startedAt: z.number(),
  endedAt: z.number().optional(),
  duration: z.number().optional(),
  result: z.any().optional(),
  error: z.any().optional(),
});

const HttpRequestSchema = z.object({
  url: z.string(),
  method: z.string(),
  query: z.record(z.any()),
  headers: z.record(z.any()),
  body: z.record(z.any()),
});

const HttpResponseSchema = z.object({
  statusCode: z.number(),
  headers: z.record(z.any()),
  body: z.record(z.any()).optional(),
});

const TraceSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  startedAt: z.number(),
  endedAt: z.number(),
  duration: z.number(),
  operations: z.array(OperationSchema),
  request: HttpRequestSchema.optional(),
  response: HttpResponseSchema.optional(),
  metadata: z.record(z.any()).optional(),
});

const router = express.Router();

// trace ingestion endpoint
router.post("/:projectId/traces", async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const trace = req.body;

    // validate the trace data
    const validatedTrace = TraceSchema.parse({
      ...trace,
      projectId,
    });

    // save trace to db
    const savedTrace = await Trace.create({
      startedAt: validatedTrace.startedAt,
      endedAt: validatedTrace.endedAt,
      project: projectId,
      duration: validatedTrace.duration,
      request: validatedTrace.request,
      response: validatedTrace.response,
      metadata: validatedTrace.metadata,
    });

    // save operations to db
    for (const op of validatedTrace.operations) {
      await Operation.create({
        ...op,
        trace: savedTrace._id,
      });
    }

    res.status(201).json({
      status: "success",
      message: "Trace ingested successfully",
      traceId: validatedTrace.id,
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      throw new BadRequestError("invalid trace data", error.errors);
    }

    next(error);
  }
});

export default router;
