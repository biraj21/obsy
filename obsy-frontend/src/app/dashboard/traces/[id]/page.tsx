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
          </div>
          <div className="text-slate-400">{operation.type}</div>
        </div>
        <div className="text-right">
          <div className="text-slate-200">{(operation.duration / 1000).toFixed(2)}s</div>
          <div className="text-slate-500 text-sm">{new Date(operation.startedAt).toLocaleTimeString()}</div>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <RequestResponseSection title="Args" data={operation.inputs?.[0]} />
        <RequestResponseSection title="Return value" data={operation.result?.value} />
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-2 text-sm border-t border-slate-800 pt-4">
          <div className="text-slate-400">Started: {new Date(operation.startedAt).toLocaleString()}</div>
          <div className="text-slate-400">Ended: {new Date(operation.endedAt).toLocaleString()}</div>
          <pre className="bg-[#12141F] p-4 rounded-md overflow-x-auto">
            <code className="text-slate-200">{JSON.stringify(operation, null, 2)}</code>
          </pre>
        </div>
      )}

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-slate-400 hover:text-white text-sm transition-colors"
      >
        {isExpanded ? "Show less" : "Show raw data"}
      </button>
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
  }, []);

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
