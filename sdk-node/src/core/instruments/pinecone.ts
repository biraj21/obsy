import type { Pinecone, Index } from "@pinecone-database/pinecone";

import { OpTracerFn } from "../types.js";

type IndexQueryType = typeof Index.prototype.query;

/**
 * Instruments a Pinecone client to trace its operations.
 *
 * Supports `pinecone.index("<index-name>").query` as of now.
 */
export function instrumentPinecone(client: Pinecone, opTracer: OpTracerFn<IndexQueryType>): Pinecone {
  // first create a proxy for the index method
  const indexOrig = client.index.bind(client);
  client.index = new Proxy(indexOrig, {
    apply: (target, thisArg, args: any) => {
      const index = target.apply(thisArg, args);

      // now we can proxy the query method on the returned index
      const queryOrig = index.query.bind(index);
      index.query = new Proxy(queryOrig, {
        apply: (target, thisArg, args: any) => {
          return opTracer({
            type: "pinecone.index.query",
            fn: target,
            thisArg,
            args,
            label: "pinecone-query",
          });
        },
      });

      return index;
    },
  });

  return client;
}
