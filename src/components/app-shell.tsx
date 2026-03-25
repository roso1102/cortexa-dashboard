"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { FadeIn } from "@/components/ui/motion";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isAuthRoute = pathname === "/login";
  const isLandingRoute = pathname === "/";

  if (isLandingRoute) {
    return <>{children}</>;
  }

  if (isAuthRoute) {
    return (
      <div className="min-h-screen bg-surface px-4 py-8">
        <div className="pointer-events-none fixed inset-0 editorial-grid opacity-10" />
        <div className="mx-auto w-full max-w-md">
          <FadeIn>{children}</FadeIn>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="pointer-events-none fixed inset-0 editorial-grid opacity-10" />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:gap-6 md:py-8">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <div className="space-y-6">
            <FadeIn>{children}</FadeIn>
          </div>
        </main>
      </div>
      <footer className="mx-auto w-full max-w-7xl px-4 pb-8 text-center text-xs text-copy-muted">
        <p>Powered by Koyeb + Pinecone + Gemini + Groq/OpenRouter.</p>
      </footer>
    </div>
  );
}
