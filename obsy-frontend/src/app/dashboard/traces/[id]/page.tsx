"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { toast } from "sonner";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getAccessToken } from "@/config/auth";
import env from "@/config/env";

interface Operation {
  trace: string;
  label: string;
  vendor: string;
  type: string;
  inputs: any[];
  result: {
    value: any;
    model: string;
    usage: any;
  };
  error?: {
    message: string;
    stack: string;
  };
  startedAt: number;
  endedAt: number;
  duration: number;
}

interface Trace {
  _id: string;
  endpoint: string;
  request: {
    url: string;
    method: string;
    query: Record<string, any>;
    headers: Record<string, any>;
    body: Record<string, any>;
  };
  response: {
    statusCode: number;
    headers: Record<string, any>;
  };
  startedAt: number;
  endedAt: number;
  duration: number;
  operations: Operation[];
}

function RequestResponseSection({ title, data }: { title: string; data: any }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors w-full text-left"
      >
        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        <span className="font-medium">{title}</span>
      </button>

      {isExpanded && (
        <pre className="bg-[#12141F] p-4 rounded-md overflow-x-auto text-sm">
          <code className="text-slate-200">{JSON.stringify(data, null, 2)}</code>
        </pre>
      )}
    </div>
  );
}

function OperationCard({ operation }: { operation: Operation }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get usage summary for OpenAI operations
  const getUsageSummary = () => {
    if (operation.vendor === "openai" && operation.result?.usage) {
      const usage = operation.result.usage;
      return (
        <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
          <div className="space-y-1">
            <div className="text-slate-500">Total Tokens</div>
            <div className="text-emerald-400 font-medium">{usage.total_tokens}</div>
          </div>
          {/* <div className="space-y-1">
            <div className="text-slate-500">Total Time</div>
            <div className="text-emerald-400 font-medium">{(usage.total_time * 1000).toFixed(2)}ms</div>
          </div> */}
          <div className="space-y-1">
            <div className="text-slate-500">Prompt Tokens</div>
            <div className="text-slate-400">{usage.prompt_tokens}</div>
          </div>
          <div className="space-y-1">
            <div className="text-slate-500">Completion Tokens</div>
            <div className="text-slate-400">{usage.completion_tokens}</div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Format OpenAI messages
  const getOpenAIMessages = () => {
    if (operation.vendor === "openai" && operation.inputs?.[0]?.messages) {
      const isStreaming = operation.inputs?.[0]?.stream;

      return (
        <div className="space-y-4">
          {/* Input messages */}
          <div className="space-y-3">
            {operation.inputs[0].messages.map((msg: any, index: number) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      msg.role === "system"
                        ? "bg-purple-900/50 text-purple-400"
                        : msg.role === "user"
                        ? "bg-blue-900/50 text-blue-400"
                        : msg.role === "assistant"
                        ? "bg-green-900/50 text-green-400"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {msg.role}
                  </span>
                </div>
                <div className="text-sm text-slate-300 pl-1 whitespace-pre-wrap max-h-80 overflow-auto">
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          {/* Response section */}
          {operation.result?.value && (
            <div className="space-y-1 border-t border-slate-800 pt-4">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-xs bg-green-900/50 text-green-400">assistant</span>
                {isStreaming && <span className="text-xs text-slate-500">streaming response</span>}
              </div>
              <div className="text-sm text-slate-300 pl-1">
                {(() => {
                  const value = operation.result.value;

                  // Function call case
                  if (value.choices?.[0]?.message?.function_call) {
                    const functionCall = value.choices[0].message.function_call;
                    return (
                      <div className="space-y-2">
                        <div className="text-blue-400">Function call: {functionCall.name}</div>
                        <pre className="bg-[#12141F] p-4 rounded-md overflow-x-auto text-xs">
                          <code className="text-slate-300">
                            {JSON.stringify(JSON.parse(functionCall.arguments), null, 2)}
                          </code>
                        </pre>
                      </div>
                    );
                  }

                  // Regular response
                  if (value.choices?.[0]?.message?.content) {
                    return value.choices[0].message.content;
                  }

                  // Streaming chunks case
                  if (Array.isArray(value) && value.length > 0) {
                    return value.map((chunk) => chunk.choices?.[0]?.delta?.content || "").join("");
                  }

                  return "No response content";
                })()}
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Format Pinecone matches
  const getPineconeMatches = () => {
    if (operation.vendor === "pinecone" && operation.result?.value?.matches) {
      const matches = operation.result.value.matches;
      const topK = operation.inputs?.[0]?.topK || matches.length;

      return (
        <div className="space-y-4">
          <div className="text-sm text-slate-400">
            Showing top {matches.length} of {topK} matches
          </div>
          <div className="space-y-3">
            {matches.map((match: any, index: number) => (
              <div key={index} className="space-y-2 border-l-2 border-blue-900/50 pl-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-mono text-slate-500">{match.id}</span>
                  <span className="text-xs text-blue-400">{(match.score * 100).toFixed(1)}% match</span>
                </div>
                <div className="text-sm text-slate-300">{match.metadata.text}</div>
                <div className="text-xs text-slate-500 font-mono truncate">source: {match.metadata.source}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded text-xs ${
                operation.vendor === "openai"
                  ? "bg-green-900/50 text-green-400"
                  : operation.vendor === "pinecone"
                  ? "bg-blue-900/50 text-blue-400"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {operation.vendor}
            </span>
            <div className="text-lg font-medium text-white">{operation.label}</div>
            {operation.vendor === "openai" && operation.inputs?.[0]?.model && (
              <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-400">
                {operation.inputs[0].model}
              </span>
            )}
            {operation.error && <span className="px-2 py-0.5 rounded text-xs bg-red-900/50 text-red-400">Failed</span>}
          </div>
          <div className="text-slate-400">{operation.type}</div>
        </div>
        <div className="text-right">
          <div className="text-slate-200">{(operation.duration / 1000).toFixed(2)}s</div>
          <div className="text-slate-500 text-sm">{new Date(operation.startedAt).toLocaleTimeString()}</div>
        </div>
      </div>

      {operation.error && (
        <div className="mt-2 space-y-2 text-sm">
          <div className="text-red-400 font-medium">{operation.error.message}</div>
          {operation.error.stack && (
            <pre className="bg-red-900/20 text-red-400 p-4 rounded-md overflow-x-auto text-xs font-mono whitespace-pre-wrap">
              {operation.error.stack}
            </pre>
          )}
        </div>
      )}

      {!operation.error && (
        <>
          {operation.vendor === "openai" && (
            <>
              {getUsageSummary()}
              <div className="pt-2">{getOpenAIMessages()}</div>
            </>
          )}
          {operation.vendor === "pinecone" && <div className="pt-2">{getPineconeMatches()}</div>}
        </>
      )}

      <div className="space-y-4 pt-2">
        {operation.vendor !== "openai" && operation.vendor !== "pinecone" && (
          <RequestResponseSection title="Args" data={operation.inputs?.[0]} />
        )}
        {!operation.error && operation.vendor !== "openai" && operation.vendor !== "pinecone" && (
          <RequestResponseSection title="Return value" data={operation.result?.value} />
        )}
      </div>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-slate-400 hover:text-white text-sm transition-colors"
      >
        {isExpanded ? "Show less" : "Show raw data"}
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-2 text-sm border-t border-slate-800 pt-4 max-h-[500px] overflow-y-auto">
          <div className="text-slate-400">Started: {new Date(operation.startedAt).toLocaleString()}</div>
          <div className="text-slate-400">Ended: {new Date(operation.endedAt).toLocaleString()}</div>
          <pre className="bg-[#12141F] p-4 rounded-md overflow-x-auto">
            <code className="text-slate-200">{JSON.stringify(operation, null, 2)}</code>
          </pre>
        </div>
      )}
    </div>
  );
}

export default function TraceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const [trace, setTrace] = useState<Trace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrace = async () => {
      try {
        const id = (await params).id;

        const token = await getAccessToken();
        const response = await fetch(`${env.BACKEND_URL}/traces/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("failed to fetch trace");
        }

        const data = await response.json();
        setTrace(data);
      } catch (error) {
        console.error(error);
        toast.error("failed to fetch trace");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrace();
  }, [params]);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#0A0B14]">
          <main className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center text-slate-400">Loading trace...</div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  if (!trace) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#0A0B14]">
          <main className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center text-slate-400">Trace not found.</div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0A0B14]">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <Link
              href={`/dashboard/traces${projectId ? `?projectId=${projectId}` : ""}`}
              className="flex items-center text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to traces
            </Link>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span
                className={`px-2 py-1 rounded text-sm font-medium ${
                  trace.request.method === "GET"
                    ? "bg-blue-900/50 text-blue-400"
                    : trace.request.method === "POST"
                    ? "bg-green-900/50 text-green-400"
                    : trace.request.method === "PUT"
                    ? "bg-yellow-900/50 text-yellow-400"
                    : trace.request.method === "DELETE"
                    ? "bg-red-900/50 text-red-400"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {trace.request.method}
              </span>
              <h1 className="text-2xl font-semibold text-white">{trace.request.url}</h1>
              <span
                className={`text-sm ${
                  trace.response.statusCode >= 200 && trace.response.statusCode < 300
                    ? "text-green-400"
                    : trace.response.statusCode >= 300 && trace.response.statusCode < 400
                    ? "text-blue-400"
                    : trace.response.statusCode >= 400 && trace.response.statusCode < 500
                    ? "text-yellow-400"
                    : "text-red-400"
                }`}
              >
                {trace.response.statusCode}
              </span>
            </div>

            <div className="flex items-center gap-3 text-sm text-slate-400">
              <span>Started {new Date(trace.startedAt).toLocaleString()}</span>
              <span className="text-slate-500">•</span>
              <span>Duration: {(trace.duration / 1000).toFixed(2)}s</span>
              <span className="text-slate-500">•</span>
              <span className="font-mono">ID: {trace._id}</span>
            </div>

            <div className="mt-6 space-y-4">
              <RequestResponseSection
                title="Request Details"
                data={{
                  query: trace.request.query,
                  headers: trace.request.headers,
                  body: trace.request.body,
                }}
              />
              <RequestResponseSection title="Response Headers" data={trace.response.headers} />
            </div>
          </div>

          <div className="space-y-4">
            {trace.operations.map((operation, index) => (
              <OperationCard key={index} operation={operation} />
            ))}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
