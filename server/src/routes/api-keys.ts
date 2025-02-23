import express from "express";

import { ApiKey } from "#src/db/schemas/api-key.js";

const router = express.Router();

router.get("/api-keys", async (req, res) => {
  const apiKeys = await ApiKey.find({ userId: req.user!.id });
  // probably not the most secure way to do this
  res.status(200).json(apiKeys);
});

router.post("/api-keys", async (req, res) => {
  const { key, label } = req.body;
  await ApiKey.create({ key, label, userId: req.user!.id });
  res.status(201).json({
    message: "API key created successfully",
  });
});

export default router;
