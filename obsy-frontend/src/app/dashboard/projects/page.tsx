"use client";

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { getAccessToken } from "@/config/auth";
import env from "@/config/env";

interface Project {
  _id: string;
  name: string;
  createdAt: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

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
    } catch (error) {
      console.error(error);
      toast.error("failed to fetch projects");
    }
  };

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await getAccessToken();
      const response = await fetch(`${env.BACKEND_URL}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newProjectName }),
      });

      if (response.ok) {
        setNewProjectName("");
        fetchProjects();
        toast.success("project created successfully");
      }
    } catch (error) {
      console.error(error);
      toast.error("failed to create project");
    }
  };

  const handleProjectClick = (projectId: string) => {
    router.push(`/dashboard/traces?projectId=${projectId}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 space-y-6">
        <h1 className="text-2xl font-semibold text-white">Projects</h1>
        <form onSubmit={createProject} className="flex gap-4">
          <Input
            placeholder="Enter project name"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            className="max-w-sm bg-[#12141F]/50 border-slate-800 text-white placeholder:text-slate-500"
          />
          <Button
            type="submit"
            className="bg-gradient-to-r from-[#63E6BE] to-[#4EA8DE] hover:from-[#4EA8DE] hover:to-[#63E6BE] text-slate-900 font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Project
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card
            key={project._id}
            className="bg-[#12141F]/50 border-slate-800 cursor-pointer hover:bg-slate-800/50 transition-colors"
            onClick={() => handleProjectClick(project._id)}
          >
            <CardHeader>
              <CardTitle className="text-white">{project.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{project._id}</p>
              <p className="text-sm text-slate-400">Created on {new Date(project.createdAt).toLocaleDateString()}</p>
            </CardContent>
          </Card>
        ))}
        {projects.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-slate-400">No projects yet. Create your first project to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
