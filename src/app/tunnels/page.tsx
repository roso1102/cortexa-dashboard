"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScaleIn } from "@/components/ui/motion";
import { Button } from "@/components/ui/button";
import { DASHBOARD_TOKEN_KEY } from "@/lib/auth";
import { fetchTunnels, type TunnelListItem } from "@/lib/api";
import { generateTunnelsNow } from "@/lib/api/tunnels";
import { toast } from "sonner";

export const dynamic = "force-dynamic";

export default function TunnelsPage() {
  const [tunnels, setTunnels] = useState<TunnelListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGeneratedAt, setLastGeneratedAt] = useState<string | null>(null);
  const [showLegacyList, setShowLegacyList] = useState(false);

  const refetchTunnels = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    const token = window.localStorage.getItem(DASHBOARD_TOKEN_KEY) || "";
    if (!token) {
      setError("Missing dashboard token. Please sign in again.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetchTunnels(token, showLegacyList ? 1 : 4);
      setTunnels(res.tunnels ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [showLegacyList]);

  useEffect(() => {
    void refetchTunnels();
  }, [refetchTunnels]);

  async function onGenerateTunnels() {
    if (isGenerating) return;

    const token = window.localStorage.getItem(DASHBOARD_TOKEN_KEY) || "";
    if (!token) {
      toast.error("Missing dashboard token. Please sign in again.");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateTunnelsNow(token);
      setLastGeneratedAt(result.generated_at || null);
      if (result.count > 0) {
        toast.success(`Generated ${result.count} tunnel(s).`);
      } else {
        toast.success("No new tunnels generated (not enough overlapping memories/tags yet).");
        toast.info("Need at least 3 memories sharing overlapping tag tokens.");
      }
      await refetchTunnels();
    } catch (err: unknown) {
      const errorLike = err as { status?: number; message?: string };
      if (errorLike?.status === 409 && errorLike?.message === "generation_in_progress") {
        toast.info("Tunnel generation already running. Please wait.");
      } else {
        toast.error(`Failed to generate tunnels: ${errorLike?.message || "Unknown error"}`);
      }
    } finally {
      setIsGenerating(false);
    }
  }

  // Deduplicate by id if present
  const items = useMemo(() => {
    const seen = new Set<string>();
    return tunnels.filter((t) => {
      const id = (t.id as string) || "";
      if (!id) return true;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [tunnels]);

  return (
    <>
      <PageHeader
        label="Tunnels"
        title="Your semantic tunnels"
        description="Weekly theme clusters automatically named by the LLM. Explore how memories group together."
      />

      <ScaleIn delay={0.05}>
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm text-copy-muted">Run tunnel generation now, then refresh this list automatically.</div>
              {lastGeneratedAt ? (
                <div className="mt-1 text-xs text-copy-muted">
                  Last generated at: {new Date(lastGeneratedAt).toLocaleString()}
                </div>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex items-center gap-2 px-2 text-xs text-copy-muted">
                <input
                  type="checkbox"
                  checked={showLegacyList}
                  onChange={(e) => setShowLegacyList(e.target.checked)}
                  className="h-4 w-4 rounded border border-outline"
                />
                Show legacy list (>= 1 memory)
              </label>
              <Button
                type="button"
                variant="ghost"
                onClick={refetchTunnels}
                disabled={isLoading || isGenerating}
                className="disabled:cursor-not-allowed disabled:opacity-60"
              >
                Refresh List
              </Button>
              <Button onClick={onGenerateTunnels} disabled={isGenerating} className="disabled:cursor-not-allowed disabled:opacity-60">
                {isGenerating ? "Generating..." : "Generate Tunnels Now"}
              </Button>
            </div>
          </div>
        </Card>
      </ScaleIn>

      {error ? (
        <ScaleIn delay={0.1}>
          <Card>
            <div className="rounded-sm border border-danger bg-danger-soft p-3 text-sm text-danger">
              Unable to load tunnels: {error}
            </div>
          </Card>
        </ScaleIn>
      ) : null}

      {isLoading && !error ? (
        <ScaleIn delay={0.1}>
          <Card>
            <div className="py-6 text-sm text-copy-muted">Loading tunnels...</div>
          </Card>
        </ScaleIn>
      ) : null}

      {!isLoading && !error ? (
        <div className="text-sm text-copy-muted">Showing {items.length} tunnel{items.length === 1 ? "" : "s"}.</div>
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

      {!isLoading && !error && !items.length && (
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

