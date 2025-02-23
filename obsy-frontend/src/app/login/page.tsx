"use client";

import Button from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useAuth } from "@/contexts/auth";
import { Github } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { user, signInWithGithub } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleGithubLogin = async () => {
    try {
      await signInWithGithub();
    } catch (error) {
      console.error("Failed to sign in with GitHub:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B14] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#12141F]/50 border-slate-800">
        <CardHeader className="space-y-6 text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 relative">
              <Image src="/obsy-logo.png" alt="Obsy logo alt" fill className="object-contain" priority />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-semibold text-white">Welcome to Obsy</CardTitle>
            <CardDescription className="text-slate-400">AI Observability Platform</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="w-full bg-gradient-to-r from-[#63E6BE] to-[#4EA8DE] hover:from-[#4EA8DE] hover:to-[#63E6BE] text-slate-900 font-medium border-0"
            onClick={handleGithubLogin}
          >
            <Github className="mr-2 h-5 w-5" />
            Login with GitHub
          </Button>

          <p className="text-center text-sm text-slate-400 mt-6">
            Don&apos;t have an account? No problem - we&apos;ll create one for you.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
