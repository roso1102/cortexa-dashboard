import Link from "next/link";
import { notFound } from "next/navigation";
import { getTunnels, type MemoryItem } from "@/lib/cortexaApi";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { TunnelDetailGraphClient } from "./tunnel-detail-graph-client";

export const dynamic = "force-dynamic";

function decodeRepeated(value: string, rounds = 4): string {
  let current = value;
  for (let i = 0; i < rounds; i += 1) {
    try {
      const decoded = decodeURIComponent(current);
      if (decoded === current) break;
      current = decoded;
    } catch {
      break;
    }
  }
  return current;
}

function pickTunnelById(items: MemoryItem[], routeId: string): MemoryItem | null {
  const decodedId = decodeRepeated(routeId);
  for (const item of items) {
    const rawId = typeof item.id === "string" ? item.id : "";
    if (!rawId) continue;
    if (rawId === decodedId || decodeRepeated(rawId) === decodedId) {
      return item;
    }
  }
  return null;
}

export default async function TunnelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let tunnels: MemoryItem[] = [];
  let error: string | null = null;
  try {
    const res = await getTunnels();
    tunnels = res.tunnels;
  } catch (e) {
    error = e instanceof Error ? e.message : "Unknown error";
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader label="Tunnels" title="Tunnel map" description="Interactive semantic graph for this tunnel." />
        <Card>
          <div className="rounded-sm border border-danger bg-danger-soft p-4 text-sm text-danger">
            Unable to load tunnel map: {error}
          </div>
        </Card>
      </div>
    );
  }

  const tunnel = pickTunnelById(tunnels, id);
  if (!tunnel) {
    notFound();
  }

  const name = (tunnel.tunnel_name as string) || "Untitled tunnel";
  const tunnelId = typeof tunnel.id === "string" && tunnel.id ? tunnel.id : decodeRepeated(id);
  const count = typeof tunnel.memory_count === "number" ? tunnel.memory_count : null;
  const core = (tunnel.core_tag as string) || "";

  return (
    <div className="space-y-6">
      <PageHeader
        label="Tunnel"
        title={name}
        description="Interactive semantic map. Drag nodes, pan the canvas, and zoom to inspect relationships."
      >
        <div className="flex flex-wrap items-center gap-2 text-xs text-copy-muted">
          {count !== null ? <span className="rounded-full border border-outline bg-surface-low px-2 py-1">{count} memories</span> : null}
          {core ? <span className="rounded-full border border-outline bg-surface-low px-2 py-1">Core tag: {core}</span> : null}
          <Link href="/tunnels" className="rounded-sm border border-outline bg-white px-3 py-1.5 font-semibold text-primary hover:bg-surface-low">
            Back to tunnels
          </Link>
        </div>
      </PageHeader>

      <Card>
        <TunnelDetailGraphClient tunnelId={tunnelId} />
      </Card>
    </div>
  );
}
