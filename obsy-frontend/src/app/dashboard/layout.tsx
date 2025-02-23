"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/projects", label: "Projects" },
    { href: "/dashboard/api-keys", label: "API Keys" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-xl font-bold">
                Obsy
              </Link>
              <div className="ml-10 flex items-center space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      pathname === item.href ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
