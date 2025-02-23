import express from "express";

import { Project } from "#src/db/schemas/project.js";
import { NotFoundError } from "#src/helpers/error.js";

const router = express.Router();

// get all projects
router.get("/", async (req, res) => {
  const projects = await Project.find({ createdBy: req.user!.id });
  res.status(200).json(projects);
});

// get a project by id
router.get("/:id", async (req, res) => {
  const projectId = req.params.id;
  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError(`project with id ${projectId} not found`);
  }

  res.status(200).json(project);
});

// create a new project
router.post("/", async (req, res) => {
  const { name } = req.body;

  const project = await Project.create({ name, createdBy: req.user!.id });

  res.status(201).json(project);
});

export default router;
