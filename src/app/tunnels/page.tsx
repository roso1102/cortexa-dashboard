import { getTunnels } from "@/lib/cortexaApi";
import Link from "next/link";
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
            <div className="rounded-sm border border-danger bg-danger-soft p-3 text-sm text-danger">
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
          const id = (t.id as string) || "";
          const href = id ? `/tunnels/${encodeURIComponent(id)}` : "";
          return (
            <ScaleIn key={(t.id as string) || `${idx}`} delay={idx * 0.1}>
              <Card className="h-full">
                <div className="mb-4 flex items-start justify-between gap-3 border-b border-outline pb-4">
                  <div className="font-serif text-3xl tracking-tight text-primary">{name}</div>
                  {typeof count === "number" && (
                    <Badge className="flex-shrink-0">
                      {count} {count === 1 ? "memory" : "memories"}
                    </Badge>
                  )}
                </div>
                {core && (
                  <div className="mb-3 text-xs text-copy-muted">
                    <span className="font-semibold">Core tag:</span> {core}
                  </div>
                )}
                {raw && (
                  <div className="rounded-sm bg-surface-low p-3 text-sm leading-6 text-copy-muted">
                    {raw.slice(0, 280)}{raw.length > 280 ? "…" : ""}
                  </div>
                )}

                <div className="mt-4 border-t border-outline pt-3">
                  {href ? (
                    <Link
                      href={href}
                      className="inline-flex items-center gap-2 rounded-sm border border-outline bg-white px-3 py-2 [font-family:var(--font-manrope)] text-sm font-bold tracking-[-0.01em] text-primary hover:bg-surface-low"
                    >
                      Open interactive map
                    </Link>
                  ) : (
                    <span className="text-sm text-copy-muted">Interactive map unavailable for this item.</span>
                  )}
                </div>
              </Card>
            </ScaleIn>
          );
        })}
      </div>

      {!error && !items.length && (
        <ScaleIn>
          <Card>
            <div className="py-8 text-center text-sm text-copy-muted">
              No tunnels yet. Check back once you have more memories.
            </div>
          </Card>
        </ScaleIn>
      )}
    </>
  );
}

