import express from "express";

import { Operation } from "#src/db/schemas/operation.js";
import { Trace } from "#src/db/schemas/trace.js";
import { NotFoundError } from "#src/helpers/error.js";

const router = express.Router();

// get traces by project ID
router.get("/by-project/:projectId", async (req, res) => {
  const { projectId } = req.params;
  const traces = await Trace.find({ project: projectId });

  const updatedTraces = [];

  for (const trace of traces) {
    const operations = await Operation.find({ trace: trace._id });
    updatedTraces.push({
      ...trace.toObject(),
      operations,
    });
  }

  res.status(200).json(updatedTraces);
});

// get trace by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const trace = await Trace.findById(id);
  if (!trace) {
    throw new NotFoundError(`trace with id ${id} not found`);
  }

  // get operations for this trace and return them with the trace
  const operations = await Operation.find({ trace: id });

  res.status(200).json({
    ...trace.toObject(),
    operations,
  });
});

export default router;
