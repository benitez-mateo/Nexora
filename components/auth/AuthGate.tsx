"use client";

import { useAuth } from "@/lib/auth-context";
import { AuthScreen } from "./AuthScreen";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, hydrated } = useAuth();

  if (!hydrated) {
    return (
      <div
        className="fixed inset-0 grid place-items-center"
        style={{ background: "var(--bg)" }}
        aria-busy="true"
      />
    );
  }

  if (!user) return <AuthScreen />;

  return <>{children}</>;
}
