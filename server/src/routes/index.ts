import express from "express";

import { verifyApiKey, verifyUserAuth } from "#src/middlewares/index.js";

import apiKeys from "./api-keys.js";
import projects from "./projects.js";
import sdk from "./sdk.js";
import traces from "./traces.js";

const router = express.Router();

router.use("/api-keys", verifyUserAuth, apiKeys);
router.use("/projects", verifyUserAuth, projects);
router.use("/sdk", verifyApiKey, sdk);
router.use("/traces", verifyUserAuth, traces);

export default router;
