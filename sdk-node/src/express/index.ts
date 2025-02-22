import { NextFunction, Request, Response } from "express";
import OpenAI from "openai";

import { ObsyClient, ObsyTrace } from "#src/core/index.js";
import { createObservableOpenAI } from "#src/core/openai.js";

declare global {
  namespace Express {
    interface Request {
      openai: OpenAI;
      trace: ObsyTrace;
    }
  }
}

/**
 * Express middleware to auto-instrument OpenAI client for each request.
 *
 * @param client - Obsy client
 * @param openai - OpenAI client
 */
export function obsyExpress(client: ObsyClient, openai: OpenAI) {
  return (req: Request, res: Response, next: NextFunction) => {
    const trace = new ObsyTrace(client, {
      url: req.url,
      method: req.method,
      query: req.query,
      headers: req.headers,
      body: req.body,
    });

    req.trace = trace;

    // auto-instrument OpenAI client for this request
    req.openai = createObservableOpenAI(openai, trace);

    // auto-end trace on response finish
    res.on("finish", () => trace.end());

    trace.runInContext(next);
  };
}
