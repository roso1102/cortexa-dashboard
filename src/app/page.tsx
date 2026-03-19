import { getTodaySummary } from "@/lib/cortexaApi";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { ScaleIn } from "@/components/ui/motion";

export const dynamic = "force-dynamic";

export default function Home() {
  return <Dashboard />;
}

async function Dashboard() {
  let summary = "";
  let error: string | null = null;
  try {
    const res = await getTodaySummary();
    summary = res.text;
  } catch (e) {
    error = e instanceof Error ? e.message : "Unknown error";
  }

  return (
    <>
      <PageHeader
        label="Dashboard"
        title="Today in your memory"
        description="Real-time summary from your Koyeb API endpoint, powered by Gemini."
      />

      <ScaleIn delay={0.1}>
        <Card>
          {error ? (
            <div className="space-y-2">
              <div className="text-sm font-semibold text-red-600">Error loading summary</div>
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
              <p className="mt-2 text-xs text-zinc-600">
                Check your <code>NEXT_PUBLIC_API_URL</code> and <code>DASHBOARD_SECRET</code> environment variables.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm font-semibold text-zinc-900">Summary</div>
              <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-4">
                <pre className="whitespace-pre-wrap font-mono text-sm leading-6 text-zinc-800">
                  {summary || "Loading..."}
                </pre>
              </div>
            </div>
          )}
        </Card>
      </ScaleIn>
    </>
  );
}
