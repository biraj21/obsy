import "./globals.css";

import type { Metadata } from "next";
import { Suspense } from "react";
import { Toaster } from "sonner";

import { AuthProvider } from "@/contexts/auth";

export const metadata: Metadata = {
  title: "Obsy",
  description: "See what your AI is really doing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Suspense>
          <Toaster richColors position="top-right" theme="dark" />
          <AuthProvider>{children}</AuthProvider>
        </Suspense>
      </body>
    </html>
  );
}
