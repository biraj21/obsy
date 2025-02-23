import express from "express";

import { Project } from "#src/db/schemas/project.js";
import { NotFoundError } from "#src/helpers/error.js";

const router = express.Router();

router.get("/projects", async (req, res) => {
  const projects = await Project.find({ userId: req.user!.id });
  res.status(200).json(projects);
});

router.get("/projects/:id", async (req, res) => {
  const projectId = req.params.id;
  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError(`project with id ${projectId} not found`);
  }

  res.status(200).json(project);
});

router.post("/projects", async (req, res) => {
  const { name } = req.body;

  const project = await Project.create({ name });

  res.status(201).json(project);
});

export default router;
