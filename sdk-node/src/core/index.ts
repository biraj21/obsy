import { AsyncLocalStorage } from "node:async_hooks";
import crypto from "node:crypto";

import { isAsyncIterable, redactSensitiveKeys } from "./utils.js";
import { DEFAULT_SENSITIVE_KEYS } from "./constants.js";

export interface TraceContext {
  /**
   * Reference to the trace object
   */
  trace: ObsyTrace;
}

interface ObsyClientOptions {
  apiKey: string;
  projectId: string;
  sinkUrl?: string;
  sensitiveKeys?: Set<string>;
}

export class ObsyClient {
  readonly projectId: string;
  readonly sensitiveKeys: Set<string>;
  readonly #apiKey: string;
  readonly #sinkUrl: string;
  readonly #storage: AsyncLocalStorage<TraceContext>;

  /**
   * @param apiKey Your Obsy API key
   * @param projectId Your Obsy project ID
   * @param sensitiveKeys Set of sensitive keys to redact from instrumented data. See `getDefaultSensitiveKeys()` method for default values.
   * @param sinkUrl Optional URL to send traces to (defaults to api.obsy.com)
   */
  constructor(options: ObsyClientOptions) {
    this.#apiKey = options.apiKey;
    this.projectId = options.projectId;
    this.#sinkUrl = options.sinkUrl ?? `https://api.obsy.com/v1/projects/${this.projectId}/`;
    this.sensitiveKeys = options.sensitiveKeys ?? this.getDefaultSensitiveKeys();
    this.#storage = new AsyncLocalStorage();
  }

  getDefaultSensitiveKeys() {
    return new Set(DEFAULT_SENSITIVE_KEYS);
  }

  getContextStorage() {
    return this.#storage;
  }

  getContext() {
    return this.#storage.getStore();
  }

  async sendTrace(trace: ObsyTrace) {
    try {
      const response = await fetch(`${this.#sinkUrl}traces`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.#apiKey}`,
        },
        body: JSON.stringify(trace.toJSON()),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Failed to send trace:", error);
      }
    } catch (error) {
      console.error("Error sending trace:", error);
    }
  }
}

interface HttpRequest {
  url: string;
  method: string;
  query: Record<string, any>;
  headers: Record<string, any>;
  body: Record<string, any>;
}

export class ObsyTrace {
  readonly #id: string;
  readonly #client: ObsyClient;
  readonly #startedAt: number;
  #endedAt: number | null;
  #duration: number | null;
  #operations: Operation[];
  readonly #request?: HttpRequest;
  #metadata?: Record<string, any>;

  constructor(client: ObsyClient, request?: HttpRequest, metadata?: Record<string, any>) {
    this.#id = crypto.randomUUID();
    this.#client = client;
    this.#startedAt = Date.now();
    this.#endedAt = null;
    this.#duration = null;
    this.#operations = [];
    this.#request = request;
    this.#metadata = metadata;
  }

  async recordOpenAiCompletion<T>(arg: T, label: string, inputs: any): Promise<T> {
    const operation = this.createOperation(label, "openai.chat.completions.create", inputs);

    const result = await arg;

    if (isAsyncIterable(result)) {
      return this.recordOpenAiStream(result, operation) as T;
    }

    return this.recordOpenAiNonStream(result, operation);
  }

  private async recordOpenAiNonStream<T>(arg: T, operation: Operation): Promise<T> {
    let result: T;

    try {
      result = await arg;
      operation.result = {
        model: (result as any).model || null,
        usage: (result as any).usage || null,
        value: result,
      };
      operation.endedAt = Date.now();
      operation.duration = operation.endedAt - operation.startedAt;
    } catch (err) {
      operation.endedAt = Date.now();
      operation.duration = operation.endedAt - operation.startedAt;
      operation.error = err;
      throw err;
    } finally {
      this.saveOperation(operation);
    }

    return result;
  }

  private async *recordOpenAiStream(stream: AsyncIterable<any>, operation: Operation) {
    try {
      const chunks: any[] = [];

      operation.result = {
        model: null,
        usage: null,
        value: chunks,
      };

      for await (const chunk of stream) {
        await new Promise((resolve) => setTimeout(resolve, 100));

        if (!operation.result.model && chunk.model) {
          operation.result.model = chunk.model;
        }

        if (!operation.result.usage && (chunk.usage || chunk.x_groq?.usage)) {
          operation.result.usage = chunk.usage || chunk.x_groq.usage;
        }

        chunks.push(chunk);
        yield chunk;
      }
    } catch (err) {
      operation.endedAt = Date.now();
      operation.duration = operation.endedAt - operation.startedAt;
      operation.error = err;
      throw err;
    } finally {
      this.saveOperation(operation);
    }
  }

  async recordPineconeQuery<T>(arg: T, label: string, inputs: any): Promise<T> {
    const operation = this.createOperation(label, "pinecone.index.query", inputs);

    try {
      const result = await arg;
      operation.result = result;
      operation.endedAt = Date.now();
      operation.duration = operation.endedAt - operation.startedAt;
      return result;
    } catch (err) {
      operation.endedAt = Date.now();
      operation.duration = operation.endedAt - operation.startedAt;
      operation.error = err;
      throw err;
    } finally {
      this.saveOperation(operation);
    }
  }

  end() {
    this.#endedAt = Date.now();
    this.#duration = this.#endedAt - this.#startedAt;
    // Send trace to server
    this.#client.sendTrace(this);
  }

  createOperation(label: string, type: OperationType, inputs: any) {
    const operation: Operation = {
      traceId: this.#id,
      label,
      type,
      inputs,
      startedAt: Date.now(),
    };

    this.#operations.push(operation);
    return operation;
  }

  async saveOperation(operation: Operation) {
    console.log("birajlog saving operation");
  }

  runInContext<T>(fn: (...args: any[]) => T) {
    const context: TraceContext = {
      trace: this,
    };
    return this.#client.getContextStorage().run(context, fn);
  }

  getContext() {
    return this.#client.getContext();
  }

  // Add method to serialize trace data
  toJSON() {
    const trace = {
      id: this.#id,
      startedAt: this.#startedAt,
      endedAt: this.#endedAt,
      duration: this.#duration,
      operations: this.#operations,
      request: this.#request,
      metadata: this.#metadata,
    };

    // Redact sensitive data before sending
    return redactSensitiveKeys(trace, this.#client.sensitiveKeys);
  }
}

type OpenAiOperationType = "openai.chat.completions.create";
type PineconeOperationType = "pinecone.index.query";
type OperationType = OpenAiOperationType | PineconeOperationType;

interface Operation {
  traceId: string;
  label: string;
  type: OperationType;
  inputs: any;
  startedAt: number;
  endedAt?: number;
  duration?: number;
  result?: any;
  error?: any;
}
