"use client";

import { createContext, useContext, useEffect, useState } from "react";

import type { User } from "@/config/auth";
import { getSession, onAuthStateChange, signInWithGithub, signOut } from "@/config/auth";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // check active sessions and sets the user
    getSession()
      .then((session) => {
        setUser(session?.user ?? null);
      })
      .catch((error) => {
        console.error("Error getting session:", error);
      })
      .finally(() => {
        setLoading(false);
      });

    // listen for changes on auth state (sign in, sign out, etc.)
    const {
      data: { subscription },
    } = onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={{ user, loading, signInWithGithub, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
