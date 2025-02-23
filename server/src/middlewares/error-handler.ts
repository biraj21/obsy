import { NextFunction, Request, Response } from "express";

import { CustomError, InternalServerError } from "../helpers/error.js";

export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof CustomError) {
    if (err instanceof InternalServerError) {
      console.error("internal server error:", err);
    }

    res.status(err.statusCode).json({
      error: {
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  // treat unknown errors as internal server errors
  console.error("unhandled internal error:", err);
  res.status(500).json({
    error: {
      message: "internal server error",
    },
  });
};
