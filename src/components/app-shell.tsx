import type { ReactNode } from "react";
import { Sidebar } from "@/components/sidebar";
import { FadeIn } from "@/components/ui/motion";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-white to-zinc-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:gap-6 md:py-8">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <div className="space-y-6">
            <FadeIn>{children}</FadeIn>
          </div>
        </main>
      </div>
      <footer className="mx-auto w-full max-w-7xl px-4 pb-8 text-center text-xs text-zinc-500">
        <p>Powered by Koyeb + Pinecone + Gemini + Groq/OpenRouter.</p>
      </footer>
    </div>
  );
}
