import type { Pinecone, Index } from "@pinecone-database/pinecone";

import { OpTracerFn } from "../types.js";

type IndexQueryType = typeof Index.prototype.query;

/**
 * Instruments a Pinecone client to trace its operations.
 *
 * Supports:
 * - `pinecone.index("<index-name>").query`
 * - `pinecone.index("<index-name>").namespace("<namespace-name>").query`
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

      // we also have to proxy index.namespace.query
      const namespaceOrig = index.namespace.bind(index);
      index.namespace = new Proxy(namespaceOrig, {
        apply: (target, thisArg, args: any) => {
          const ns = target.apply(thisArg, args);

          // now we can proxy the query method on the returned index with namespace
          const queryOrig = ns.query.bind(ns);
          ns.query = new Proxy(queryOrig, {
            apply: (target, thisArg, args: any) => {
              return opTracer({
                type: "pinecone.index.namespace.query",
                fn: target,
                thisArg,
                args,
                label: "pinecone-namespace-query",
              });
            },
          });

          return ns;
        },
      });
      return index;
    },
  });

  return client;
}
