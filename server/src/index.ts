import express from "express";
import { z } from "zod";

// Type definitions matching the SDK's trace structure
const OperationSchema = z.object({
  traceId: z.string(),
  label: z.string(),
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

const TraceSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  startedAt: z.number(),
  endedAt: z.number().optional(),
  duration: z.number().optional(),
  operations: z.array(OperationSchema),
  request: HttpRequestSchema.optional(),
  metadata: z.record(z.any()).optional(),
});

const app = express();
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Trace ingestion endpoint
app.post("/v1/projects/:projectId/traces", async (req, res) => {
  try {
    const { projectId } = req.params;
    const trace = req.body;

    // Validate the trace data
    const validatedTrace = TraceSchema.parse({
      ...trace,
      projectId,
    });

    // TODO: Store the trace in a database
    // For now, we'll just log it
    console.log("Received trace:", JSON.stringify(validatedTrace, null, 2));

    res.status(201).json({
      status: "success",
      message: "Trace ingested successfully",
      traceId: validatedTrace.id,
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        status: "error",
        message: "Invalid trace data",
        errors: error.errors,
      });
      return;
    }

    console.error("Error processing trace:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
