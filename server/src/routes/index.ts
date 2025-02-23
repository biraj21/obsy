import express from "express";

import { verifyUserAuth } from "#src/middlewares/verify-user-auth.js";
import projects from "./projects.js";
import sdk from "./sdk.js";
import users from "./users.js";

const router = express.Router();

router.use("/users", verifyUserAuth, users);
router.use("/projects", verifyUserAuth, projects);
router.use("/sdk", sdk);

export default router;
