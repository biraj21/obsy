import type OpenAI from "openai";

import { OpTracerFn } from "../types.js";

type CompletionCreateType = typeof OpenAI.prototype.chat.completions.create;

/**
 * Instruments an OpenAI client to trace its operations.
 *
 * Supports `openai.chat.completions.create` as of now.
 */
export function instrumentOpenAI(client: OpenAI, opTracer: OpTracerFn<CompletionCreateType>): OpenAI {
  const completionsOrig = client.chat.completions.create.bind(client.chat.completions);

  // create a proxy for the completions method to replace the original
  client.chat.completions.create = new Proxy(completionsOrig, {
    apply: (target, thisArg, args: any) => {
      const isStream = args[0].stream ?? false;
      return opTracer({
        type: "openai.chat.completions.create",
        fn: target,
        thisArg,
        args,
        label: isStream ? "openai-chat-stream" : "openai-chat-completion",
      });
    },
  });

  return client;
}
