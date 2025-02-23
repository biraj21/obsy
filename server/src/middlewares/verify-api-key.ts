import { NextFunction, Request, Response } from "express";
import type { JWTVerifyResult } from "jose";
import { jwtVerify } from "jose";

import { UnauthorizedError } from "#src/helpers/error.js";

import env from "#src/config/env.js";

declare global {
  namespace Express {
    interface Request {
      apiKey?: {
        id: string;
        createdBy: string;
      };
    }
  }
}

// TODO: 1. add a check to validate the key against the database
// TODO: 2. cache the value from the database to prevent extra db calls

const secret = new TextEncoder().encode(env.SDK_JWT_SECRET);

/**
 * Verifies the API key provided in the request header and adds the API key information to the request object.
 */
export const verifyApiKey = async (req: Request, res: Response, next: NextFunction) => {
  const apiKeyHeader = req.headers["x-api-key"];

  if (!apiKeyHeader || typeof apiKeyHeader !== "string") {
    throw new UnauthorizedError("no api key provided");
  }

  let decoded: JWTVerifyResult;
  try {
    decoded = await jwtVerify(apiKeyHeader, secret);
  } catch (error) {
    throw new UnauthorizedError("invalid api key");
  }

  const { sub, oid } = decoded.payload;
  if (typeof oid !== "string" || typeof sub !== "string") {
    throw new UnauthorizedError("invalid api key");
  }

  req.apiKey = {
    id: oid,
    createdBy: sub,
  };

  next();
};
