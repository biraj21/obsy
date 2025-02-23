"use client";

import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0A0B14]">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Example cards - replace with actual dashboard content */}
            <div className="card p-6 space-y-4">
              <h2 className="text-lg font-medium text-white">Overview</h2>
              <p className="text-slate-400">Your dashboard overview and statistics will appear here.</p>
            </div>
            <div className="card p-6 space-y-4">
              <h2 className="text-lg font-medium text-white">Recent Activity</h2>
              <p className="text-slate-400">Track your recent activities and changes.</p>
            </div>
            <div className="card p-6 space-y-4">
              <h2 className="text-lg font-medium text-white">Performance</h2>
              <p className="text-slate-400">{"Monitor your system's performance metrics."}</p>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
