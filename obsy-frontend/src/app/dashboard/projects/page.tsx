"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

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

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Projects</h1>
        <form onSubmit={createProject} className="flex gap-4">
          <Input
            placeholder="Enter project name"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            className="max-w-sm"
          />
          <Button type="submit">Create Project</Button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project._id}>
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Created on {new Date(project.createdAt).toLocaleDateString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
