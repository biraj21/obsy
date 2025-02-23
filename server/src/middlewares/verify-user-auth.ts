import type { User } from "@supabase/supabase-js";
import { NextFunction, Request, Response } from "express";

import supabase from "#src/config/supabase.js";
import { UnauthorizedError } from "#src/helpers/error.js";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const verifyUserAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw new UnauthorizedError("no token provided");
  }

  const token = authHeader.split(" ")[1];

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    throw new UnauthorizedError("invalid token");
  }

  req.user = data.user;

  next();
};
