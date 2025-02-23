"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Button from "@/components/ui/Button";
import { useAuth } from "@/contexts/auth";

export default function DashboardPage() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0A0B14] p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-slate-400">{user?.email}</span>
              <Button
                className="border border-slate-700 bg-transparent text-slate-400 hover:text-white hover:bg-slate-800"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </div>
          </div>
          {/* Add your dashboard content here */}
        </div>
      </div>
    </ProtectedRoute>
  );
}
