import express from "express";

import { SignJWT } from "jose";

import { ApiKey } from "#src/db/schemas/api-key.js";
import env from "#src/config/env.js";

const router = express.Router();

// get all api keys created by the user
router.get("/", async (req, res) => {
  const apiKeys = await ApiKey.find({ createdBy: req.user!.id });
  // probably not the most secure way to do this
  res.status(200).json(apiKeys);
});

const secret = new TextEncoder().encode(env.SDK_JWT_SECRET);

// create a new api key
router.post("/", async (req, res) => {
  const { label } = req.body;

  const apiKey = new ApiKey({ label, createdBy: req.user!.id });

  // a JWT that identifies the user
  const signJWTPayload = new SignJWT({ oid: apiKey._id.toString() });
  signJWTPayload.setProtectedHeader({ alg: "HS256" });
  signJWTPayload.setSubject(req.user!.id);
  signJWTPayload.setIssuedAt();
  signJWTPayload.setExpirationTime("100y");
  const key = await signJWTPayload.sign(secret);

  // save the key to the database
  apiKey.key = key;

  await apiKey.save();

  res.status(201).json({ message: "API key created successfully" });
});

export default router;
