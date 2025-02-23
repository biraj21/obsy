import { NextFunction, Request, Response } from "express";
import type { JWTVerifyResult } from "jose";
import { jwtVerify } from "jose";

import env from "#src/config/env.js";
import { UnauthorizedError } from "#src/helpers/error.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
      };
    }
  }
}

const secret = new TextEncoder().encode(env.SUPABASE_JWT_SECRET);

/**
 * Verifies the user's authentication token and adds the user's information to the request object.
 */
export const verifyUserAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw new UnauthorizedError("no token provided");
  }

  const token = authHeader.split(" ")[1];

  let decoded: JWTVerifyResult;
  try {
    decoded = await jwtVerify(token, secret);
  } catch (error) {
    throw new UnauthorizedError("invalid token");
  }

  const { sub, email } = decoded.payload;
  if (typeof sub !== "string" || typeof email !== "string") {
    throw new UnauthorizedError("invalid token");
  }

  req.user = {
    id: sub,
    email: email as string,
  };

  next();
};
