"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { getAccessToken } from "@/config/auth";

import env from "@/config/env";
interface ApiKey {
  _id: string;
  label: string;
  key: string;
  createdAt: string;
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyLabel, setNewKeyLabel] = useState("");

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const token = await getAccessToken();
      const response = await fetch(`${env.BACKEND_URL}/api-keys`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("failed to fetch api keys");
      }

      const data = await response.json();
      setApiKeys(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch API keys");
    }
  };

  const createApiKey = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const token = await getAccessToken();
      const response = await fetch(`${env.BACKEND_URL}/api-keys`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ label: newKeyLabel }),
      });

      if (response.ok) {
        setNewKeyLabel("");
        fetchApiKeys();
        toast.success("API key created successfully");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to create API key");
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">API Keys</h1>
        <form onSubmit={createApiKey} className="flex gap-4">
          <Input
            placeholder="Enter API key label"
            value={newKeyLabel}
            onChange={(e) => setNewKeyLabel(e.target.value)}
            className="max-w-sm"
          />
          <Button type="submit">Create API Key</Button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apiKeys.map((apiKey) => (
          <Card key={apiKey._id}>
            <CardHeader>
              <CardTitle>{apiKey.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-mono bg-gray-100 p-2 rounded break-all">{apiKey.key}</p>
              <p className="text-sm text-gray-500 mt-2">Created on {new Date(apiKey.createdAt).toLocaleDateString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
