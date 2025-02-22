import type OpenAI from "openai";

import { ObsyTrace } from "./index.js";

export function createObservableOpenAI(client: OpenAI, trace: ObsyTrace): OpenAI {
  const completionsOrig = client.chat.completions.create.bind(client.chat.completions);

  // create a proxy for the completions method to replace the original
  client.chat.completions.create = new Proxy(completionsOrig, {
    apply: (target, thisArg, args: any) => {
      const isStream = args[0].stream ?? false;
      return trace.recordOpenAiCompletion(
        target.apply(thisArg, args),
        isStream ? "openai-chat-stream" : "openai-chat-completion",
        args
      );
    },
  });

  return client;
}
