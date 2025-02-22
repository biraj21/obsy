import { NextFunction, Request, Response } from "express";
import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";

import { ObsyClient, ObsyTrace } from "#src/core/index.js";
import { createObservableOpenAI } from "#src/core/openai.js";
import { createObservablePinecone } from "#src/core/pinecone.js";

declare global {
  namespace Express {
    interface Request {
      openai: OpenAI;
      pinecone?: Pinecone;
      trace: ObsyTrace;
    }
  }
}

interface ObsyExpressOptions {
  client: ObsyClient;
  openai: OpenAI;
  pinecone?: Pinecone;
}

/**
 * Express middleware to auto-instrument OpenAI and Pinecone clients for each request.
 *
 * @param client - Obsy client
 * @param openai - OpenAI client
 * @param pinecone - Optional Pinecone client
 */
export function obsyExpress(options: ObsyExpressOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    const trace = new ObsyTrace(options.client, {
      url: req.url,
      method: req.method,
      query: req.query,
      headers: req.headers,
      body: req.body,
    });

    req.trace = trace;

    // auto-instrument OpenAI client for this request
    req.openai = createObservableOpenAI(options.openai, trace);

    // auto-instrument Pinecone client if provided
    if (options.pinecone) {
      req.pinecone = createObservablePinecone(options.pinecone, trace);
      // req.pinecone = options.pinecone;
    }

    // auto-end trace on response finish
    res.on("finish", () => trace.end());

    trace.runInContext(next);
  };
}
