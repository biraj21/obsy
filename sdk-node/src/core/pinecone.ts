import { Pinecone } from "@pinecone-database/pinecone";
import { ObsyTrace } from "./index.js";

export function createObservablePinecone(client: Pinecone, trace: ObsyTrace): Pinecone {
  // first create a proxy for the index method
  const indexOrig = client.index.bind(client);
  client.index = new Proxy(indexOrig, {
    apply: (target, thisArg, args: any) => {
      const index = target.apply(thisArg, args);

      // now we can proxy the query method on the returned index
      const queryOrig = index.query.bind(index);
      index.query = new Proxy(queryOrig, {
        apply: (target, thisArg, args: any) => {
          return trace.recordPineconeQuery(target.apply(thisArg, args), "pinecone-query", args);
        },
      });

      return index;
    },
  });

  return client;
}
