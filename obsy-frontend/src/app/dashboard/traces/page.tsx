"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getAccessToken } from "@/config/auth";
import env from "@/config/env";

interface Project {
  _id: string;
  name: string;
  createdAt: string;
}

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

function OperationSummary({ operation }: { operation: Operation }) {
  // Get a summary of the request
  const getRequestSummary = () => {
    if (operation.vendor === "openai") {
      return operation.inputs?.[0]?.messages?.[0]?.content || "No content";
    }
    return JSON.stringify(operation.inputs?.[0] || {});
  };

  return (
    <div className="border-l-2 border-slate-700 pl-4 py-1">
      <div className="flex items-center gap-2 text-sm">
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
        <span className="text-slate-400">{operation.label}</span>
      </div>
      <div className="mt-1 text-xs text-slate-500 truncate max-w-xl">{getRequestSummary()}</div>
    </div>
  );
}

export default function TracesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");

  const [projects, setProjects] = useState<Project[]>([]);
  const [traces, setTraces] = useState<Trace[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = await getAccessToken();
        const response = await fetch(`${env.BACKEND_URL}/projects`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("failed to fetch projects");
        }

        const data = await response.json();
        setProjects(data);

        // Set selected project from URL or first project
        const project = projectId ? data.find((p: Project) => p._id === projectId) : data[0];

        if (project) {
          setSelectedProject(project);
        }
      } catch (error) {
        console.error(error);
        toast.error("failed to fetch projects");
      }
    };

    fetchProjects();
  }, [projectId]);

  // Fetch traces when selected project changes
  useEffect(() => {
    const fetchTraces = async () => {
      if (!selectedProject) return;

      setIsLoading(true);
      try {
        const token = await getAccessToken();
        const response = await fetch(`${env.BACKEND_URL}/traces/by-project/${selectedProject._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("failed to fetch traces");
        }

        const data = await response.json();
        setTraces(data);
      } catch (error) {
        console.error(error);
        toast.error("failed to fetch traces");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTraces();
  }, [selectedProject]);

  // Update URL and fetch traces when project changes
  const handleProjectChange = (projectId: string) => {
    const project = projects.find((p) => p._id === projectId);
    if (project) {
      setSelectedProject(project);
      router.push(`/dashboard/traces?projectId=${projectId}`);
    }
  };

  if (!selectedProject) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#0A0B14]">
          <main className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center text-slate-400">No projects found. Create a project first.</div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0A0B14]">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-semibold text-white">Traces</h1>
            <select
              value={selectedProject._id}
              onChange={(e) => handleProjectChange(e.target.value)}
              className="bg-[#12141F] text-slate-200 border border-slate-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#63E6BE] focus:border-transparent"
            >
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <div className="text-center text-slate-400">Loading traces...</div>
          ) : traces.length === 0 ? (
            <div className="text-center text-slate-400">No traces found for this project.</div>
          ) : (
            <div className="space-y-4">
              {traces.map((trace) => (
                <Link
                  key={trace._id}
                  href={`/dashboard/traces/${trace._id}?projectId=${selectedProject._id}`}
                  className="card p-6 hover:bg-slate-800/50 transition-colors group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
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
                        <span className="text-slate-200 font-medium">{trace.request.url}</span>
                        <span className="text-slate-500">•</span>
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
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-slate-400">
                          {formatDistanceToNow(trace.startedAt, { addSuffix: true })}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400">Duration: {(trace.duration / 1000).toFixed(2)}s</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                  </div>

                  <div className="space-y-2">
                    {trace.operations?.slice(0, 2).map((operation, index) => (
                      <OperationSummary key={index} operation={operation} />
                    ))}
                    {trace.operations?.length > 2 && (
                      <div className="text-xs text-slate-500 pl-4 flex items-center gap-1">
                        <span>{trace.operations.length - 2} more operations</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
