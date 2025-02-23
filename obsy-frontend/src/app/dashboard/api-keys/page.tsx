"use client";

import { Key, Plus } from "lucide-react";
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 space-y-6">
        <h1 className="text-2xl font-semibold text-white">API Keys</h1>
        <form onSubmit={createApiKey} className="flex gap-4">
          <Input
            placeholder="Enter API key label"
            value={newKeyLabel}
            onChange={(e) => setNewKeyLabel(e.target.value)}
            className="max-w-sm bg-[#12141F]/50 border-slate-800 text-white placeholder:text-slate-500"
          />
          <Button
            type="submit"
            className="bg-gradient-to-r from-[#63E6BE] to-[#4EA8DE] hover:from-[#4EA8DE] hover:to-[#63E6BE] text-slate-900 font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create API Key
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apiKeys.map((apiKey) => (
          <Card key={apiKey._id} className="bg-[#12141F]/50 border-slate-800">
            <CardHeader className="flex flex-row items-center gap-2">
              <Key className="w-5 h-5 text-slate-400" />
              <CardTitle className="text-white">{apiKey.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-[#0A0B14] border border-slate-800 p-3 rounded-md">
                <p className="text-sm font-mono text-slate-400 break-all">{apiKey.key}</p>
              </div>
              <p className="text-sm text-slate-400">Created on {new Date(apiKey.createdAt).toLocaleDateString()}</p>
            </CardContent>
          </Card>
        ))}
        {apiKeys.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-slate-400">No API keys yet. Create your first API key to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
