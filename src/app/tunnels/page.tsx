import { getTunnels } from "@/lib/cortexaApi";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScaleIn } from "@/components/ui/motion";

export const dynamic = "force-dynamic";

export default async function TunnelsPage() {
  let tunnels: Awaited<ReturnType<typeof getTunnels>>["tunnels"] = [];
  let error: string | null = null;

  try {
    const res = await getTunnels();
    tunnels = res.tunnels;
  } catch (e) {
    error = e instanceof Error ? e.message : "Unknown error";
  }

  // Deduplicate by id if present
  const seen = new Set<string>();
  const items = tunnels.filter((t) => {
    const id = (t.id as string) || "";
    if (!id) return true;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  return (
    <>
      <PageHeader
        label="Tunnels"
        title="Your semantic tunnels"
        description="Weekly theme clusters automatically named by the LLM. Explore how memories group together."
      />

      {error ? (
        <ScaleIn delay={0.1}>
          <Card>
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              Unable to load tunnels: {error}
            </div>
          </Card>
        </ScaleIn>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {items.map((t, idx) => {
          const name = (t.tunnel_name as string) || "Untitled Tunnel";
          const count = t.memory_count;
          const core = (t.core_tag as string) || "";
          const raw = (t.raw_content as string) || "";
          return (
            <ScaleIn key={(t.id as string) || `${idx}`} delay={idx * 0.1}>
              <Card>
                <div className="mb-4 flex items-start justify-between gap-3 border-b border-zinc-200 pb-4">
                  <div className="text-lg font-bold tracking-tight text-zinc-900">{name}</div>
                  {typeof count === "number" && (
                    <Badge className="flex-shrink-0">
                      {count} {count === 1 ? "memory" : "memories"}
                    </Badge>
                  )}
                </div>
                {core && (
                  <div className="mb-3 text-xs text-zinc-600">
                    <span className="font-semibold">Core tag:</span> {core}
                  </div>
                )}
                {raw && (
                  <div className="rounded bg-zinc-50 p-3 text-sm leading-6 text-zinc-700">
                    {raw.slice(0, 280)}{raw.length > 280 ? "…" : ""}
                  </div>
                )}
              </Card>
            </ScaleIn>
          );
        })}
      </div>

      {!error && !items.length && (
        <ScaleIn>
          <Card>
            <div className="py-8 text-center text-sm text-zinc-600">
              No tunnels yet. Check back once you have more memories.
            </div>
          </Card>
        </ScaleIn>
      )}
    </>
  );
}

