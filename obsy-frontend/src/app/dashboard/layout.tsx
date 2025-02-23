"use client";

import { LogOut, LucideSparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import Button from "@/components/ui/Button";
import { useAuth } from "@/contexts/auth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  const navItems = [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/projects", label: "Projects" },
    { href: "/dashboard/api-keys", label: "API Keys" },
  ];

  return (
    <div className="min-h-screen bg-[#0A0B14]">
      <nav className="bg-[#12141F]/50 border-b border-slate-800 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center mr-6">
              {/* <Image src="/obsy-logo.png" alt="Obsy logo" fill className="object-contain" priority /> */}
              <LucideSparkles className="w-6 h-6 text-white" />
              <span className="text-xl font-semibold text-white ml-2">Obsy</span>
            </Link>

            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors mx-1 ${
                  pathname === item.href
                    ? "bg-gradient-to-r from-[#63E6BE] to-[#4EA8DE] text-slate-900"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-6 ml-10">
            <span className="text-slate-400">{user?.email}</span>
            <Button
              onClick={handleSignOut}
              className="bg-[#12141F] hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <main>{children}</main>
    </div>
  );
}
