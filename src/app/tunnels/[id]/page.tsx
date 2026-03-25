import Link from "next/link";
import { notFound } from "next/navigation";
import { getMemories, getTunnels, type MemoryItem } from "@/lib/cortexaApi";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { TunnelGraph, type TunnelGraphLink, type TunnelGraphNode } from "@/components/tunnel-graph";

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

function normalizeLabel(value: string): string {
  return value
    .replace(/^[-*\d.\s]+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractFallbackLabels(raw: string): string[] {
  const dateMatches = raw.match(/\b\d{4}-\d{2}-\d{2}\b/g) || [];
  const sentenceParts = raw
    .split(/[\n|]/)
    .flatMap((line) => line.split(/(?<=[.!?])\s+/))
    .map((part) => normalizeLabel(part))
    .filter((part) => part.length >= 4 && part.length <= 64);

  const merged = [...dateMatches, ...sentenceParts];
  const unique: string[] = [];
  const seen = new Set<string>();
  for (const label of merged) {
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(label);
    if (unique.length >= 24) break;
  }
  return unique;
}

function extractUrls(text: string): string[] {
  const matches = text.match(/https?:\/\/[^\s)]+/gi) || [];
  const unique: string[] = [];
  const seen = new Set<string>();
  for (const url of matches) {
    const normalized = url.replace(/[),.;:]+$/, "");
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    unique.push(normalized);
    if (unique.length >= 12) break;
  }
  return unique;
}

function buildGraph(tunnel: MemoryItem, relatedMemories: MemoryItem[]): { nodes: TunnelGraphNode[]; links: TunnelGraphLink[] } {
  const tunnelId = (tunnel.id as string) || "center";
  const tunnelName = (tunnel.tunnel_name as string) || "Untitled tunnel";
  const coreTag = (tunnel.core_tag as string) || "";
  const raw = (tunnel.raw_content as string) || "";

  const centerId = `center:${tunnelId}`;

  const nodes: TunnelGraphNode[] = [
    {
      id: centerId,
      label: tunnelName,
      kind: "center",
    },
  ];

  if (coreTag) {
    nodes.push({ id: `tag:${coreTag}`, label: coreTag, kind: "tag", details: "Core tag" });
  }

  const links: TunnelGraphLink[] = [];

  const memoryNodes = relatedMemories.slice(0, 20);
  const addedTagNodes = new Set<string>();
  const addedDateNodes = new Set<string>();

  memoryNodes.forEach((memory, idx) => {
    const memoryId = typeof memory.id === "string" ? memory.id : "";
    const rawContent = typeof memory.raw_content === "string" ? memory.raw_content : "";
    const titleCandidate =
      (typeof memory.title === "string" && memory.title) ||
      (typeof memory.file_name === "string" && memory.file_name) ||
      (typeof memory.url === "string" && memory.url) ||
      normalizeLabel(rawContent.split(/\r?\n/)[0] || "") ||
      `Memory ${idx + 1}`;

    const label = normalizeLabel(titleCandidate).slice(0, 42) || `Memory ${idx + 1}`;
    const nodeId = `memory:${memoryId || idx}`;

    nodes.push({
      id: nodeId,
      label,
      kind: "memory",
      externalUrl: typeof memory.url === "string" ? memory.url : undefined,
      memoryHref: memoryId ? `/memories/${encodeURIComponent(memoryId)}` : undefined,
      details: memoryId ? `Memory id: ${memoryId}` : undefined,
    });

    links.push({ source: centerId, target: nodeId });

    if (typeof memory.created_at === "string" && memory.created_at.length >= 10) {
      const date = memory.created_at.slice(0, 10);
      const dateNodeId = `date:${date}`;
      if (!addedDateNodes.has(dateNodeId)) {
        nodes.push({ id: dateNodeId, label: date, kind: "date", details: "Created date" });
        addedDateNodes.add(dateNodeId);
      }
      links.push({ source: nodeId, target: dateNodeId });
    }

    const tags = Array.isArray(memory.tags) ? (memory.tags as string[]) : [];
    tags.slice(0, 3).forEach((tag) => {
      const clean = normalizeLabel(tag).slice(0, 28);
      if (!clean) return;
      const tagNodeId = `tag:${clean.toLowerCase()}`;
      if (!addedTagNodes.has(tagNodeId)) {
        nodes.push({ id: tagNodeId, label: clean, kind: "tag", details: "Tag" });
        addedTagNodes.add(tagNodeId);
      }
      links.push({ source: nodeId, target: tagNodeId });
    });
  });

  if (!memoryNodes.length) {
    const labels = extractFallbackLabels(raw);
    labels.slice(0, 18).forEach((label, idx) => {
      const isDate = /^\d{4}-\d{2}-\d{2}$/.test(label);
      nodes.push({
        id: `${isDate ? "date" : "memory"}:${idx}:${label.toLowerCase().replace(/\s+/g, "-")}`,
        label,
        kind: isDate ? "date" : "memory",
      });
    });

    const fallbackUrls = extractUrls(raw);
    fallbackUrls.forEach((url, idx) => {
      const short = url.replace(/^https?:\/\//, "").slice(0, 40);
      const nodeId = `url:${idx}`;
      nodes.push({ id: nodeId, label: short, kind: "memory", externalUrl: url, details: "Saved link" });
      links.push({ source: centerId, target: nodeId });
    });
  }

  for (let i = 1; i < nodes.length; i += 1) {
    if (!links.some((link) => link.source === centerId && link.target === nodes[i].id)) {
      links.push({ source: centerId, target: nodes[i].id });
    }
  }

  for (let i = 2; i < nodes.length - 1; i += 2) {
    links.push({ source: nodes[i].id, target: nodes[i + 1].id });
  }

  return { nodes, links };
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
  const count = typeof tunnel.memory_count === "number" ? tunnel.memory_count : null;
  const core = (tunnel.core_tag as string) || "";

  let relatedMemories: MemoryItem[] = [];
  try {
    const result = await getMemories({
      q: name,
      per_page: 40,
      page: 1,
    });
    relatedMemories = result.items;
  } catch {
    relatedMemories = [];
  }

  const graph = buildGraph(tunnel, relatedMemories);

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
        <TunnelGraph nodes={graph.nodes} links={graph.links} />
      </Card>
    </div>
  );
}
