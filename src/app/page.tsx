import { getTodaySummary } from "@/lib/cortexaApi";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { ScaleIn } from "@/components/ui/motion";

export const dynamic = "force-dynamic";

type SummaryBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "list"; heading?: string; items: string[] };

function parseSummary(text: string): SummaryBlock[] {
  const chunks = text
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  return chunks
    .map((chunk) => {
      const lines = chunk
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      if (!lines.length) {
        return null;
      }

      if (lines.every((line) => line.startsWith("- "))) {
        return {
          kind: "list" as const,
          items: lines.map((line) => line.slice(2).trim()).filter(Boolean),
        };
      }

      if (lines[0].endsWith(":")) {
        const items = lines.slice(1).filter((line) => line.startsWith("- ")).map((line) => line.slice(2).trim()).filter(Boolean);
        if (items.length === lines.length - 1) {
          return {
            kind: "list" as const,
            heading: lines[0].slice(0, -1),
            items,
          };
        }
      }

      return {
        kind: "paragraph" as const,
        text: lines.join(" "),
      };
    })
    .filter((block): block is SummaryBlock => Boolean(block));
}

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

  const blocks = parseSummary(summary);

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
                {blocks.length ? (
                  <div className="space-y-4 text-sm leading-7 text-zinc-800">
                    {blocks.map((block, idx) =>
                      block.kind === "paragraph" ? (
                        <p key={idx}>{block.text}</p>
                      ) : (
                        <div key={idx} className="space-y-2">
                          {block.heading ? (
                            <div className="text-sm font-semibold text-zinc-900">{block.heading}</div>
                          ) : null}
                          <ul className="list-disc space-y-1 pl-5">
                            {block.items.map((item, itemIdx) => (
                              <li key={`${idx}-${itemIdx}`}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-sm leading-7 text-zinc-700">No summary generated yet.</p>
                )}
              </div>
            </div>
          )}
        </Card>
      </ScaleIn>
    </>
  );
}
