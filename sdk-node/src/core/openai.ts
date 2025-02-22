import type OpenAI from "openai";

import { ObsyTrace } from "./index.js";

export function createObservableOpenAI(client: OpenAI, trace: ObsyTrace): OpenAI {
  return new Proxy(client, {
    get(target, propKey) {
      const original = target[propKey as keyof OpenAI];

      // auto-instrument completions.create() and similar methods
      if (propKey === "chat") {
        return new Proxy(original as any, {
          get: (nestedTarget, nestedPropKey) => {
            if (nestedPropKey === "completions") {
              return {
                create: async (params: any) => {
                  const isStream = params.stream ?? false;
                  return trace.recordOpenAi(
                    nestedTarget.completions.create(params),
                    isStream ? "openai-chat-stream" : "openai-chat-completion",
                    params
                  );
                },
              };
            }
            return nestedTarget[nestedPropKey as keyof typeof nestedTarget];
          },
        });
      }

      return original;
    },
  });
}
