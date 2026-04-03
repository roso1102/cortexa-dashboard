"use client";

import { useEffect, useMemo, useState } from "react";
import { TunnelGraph, type TunnelGraphEdgeLink, type TunnelGraphRenderNode } from "@/components/tunnel-graph";
import { DASHBOARD_TOKEN_KEY } from "@/lib/auth";
import { fetchTunnelGraph } from "@/lib/api";

type TunnelDetailGraphClientProps = {
  tunnelId: string;
};

export function TunnelDetailGraphClient({ tunnelId }: TunnelDetailGraphClientProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRawTagNodes, setShowRawTagNodes] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState<TunnelGraphEdgeLink | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<TunnelGraphEdgeLink | null>(null);
  const [data, setData] = useState<{ nodes: TunnelGraphRenderNode[]; links: TunnelGraphEdgeLink[] }>({
    nodes: [],
    links: [],
  });

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      setSelectedEdge(null);
      setHoveredEdge(null);

      try {
        const token = window.localStorage.getItem(DASHBOARD_TOKEN_KEY);
        if (!token) {
          throw new Error("Missing dashboard token. Please log in again.");
        }

        const graphData = await fetchTunnelGraph(tunnelId, token);

        const graphNodes = graphData.nodes.map((n) => ({
          id: n.id,
          label: n.title?.trim() || n.snippet?.slice(0, 48) || "Memory",
          snippet: n.snippet,
          sourceType: n.source_type,
          tags: n.tags,
        }));

        const graphLinks = graphData.edges.map((e, i) => ({
          id: `${e.from_memory_id}-${e.to_memory_id}-${i}`,
          source: e.from_memory_id,
          target: e.to_memory_id,
          rationale: e.rationale,
          weight: e.weight ?? 0,
          bridgeScore: e.bridge_score ?? 0,
        }));

        if (active) {
          setData({ nodes: graphNodes, links: graphLinks });
        }
      } catch (e) {
        if (active) {
          setError(e instanceof Error ? e.message : "Unknown error");
          setData({ nodes: [], links: [] });
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [tunnelId]);

  const rendered = useMemo(() => {
    if (!showRawTagNodes) {
      return data;
    }

    const existing = new Set(data.nodes.map((node) => node.id));
    const tagNodes: TunnelGraphRenderNode[] = [];
    const tagLinks: TunnelGraphEdgeLink[] = [];

    for (const node of data.nodes) {
      const tags = Array.isArray(node.tags) ? node.tags : [];
      for (const tag of tags) {
        const clean = tag.trim();
        if (!clean) continue;
        const tagId = `raw-tag:${clean.toLowerCase()}`;
        if (!existing.has(tagId)) {
          existing.add(tagId);
          tagNodes.push({
            id: tagId,
            label: clean,
            snippet: "",
            sourceType: "tag",
            tags: [],
            kind: "tag",
          });
        }

        tagLinks.push({
          id: `${node.id}-${tagId}`,
          source: node.id,
          target: tagId,
          rationale: "Raw tag membership",
          weight: 0,
          bridgeScore: 0,
        });
      }
    }

    return {
      nodes: [...data.nodes, ...tagNodes],
      links: [...data.links, ...tagLinks],
    };
  }, [data, showRawTagNodes]);

  if (loading) {
    return <div className="text-sm text-copy-muted">Loading semantic tunnel graph...</div>;
  }

  if (error) {
    return <div className="rounded-sm border border-danger bg-danger-soft p-4 text-sm text-danger">{error}</div>;
  }

  if (data.nodes.length === 0) {
    return <div className="text-sm text-copy-muted">No memories in this tunnel yet.</div>;
  }

  const edgeForPanel = selectedEdge || hoveredEdge;

  return (
    <div className="space-y-3">
      {data.nodes.length > 0 && data.links.length === 0 ? (
        <div className="rounded-sm border border-outline bg-surface-low p-3 text-sm text-copy-muted">
          No strong semantic links found yet.
        </div>
      ) : null}

      <label className="inline-flex items-center gap-2 text-xs text-copy-muted">
        <input
          type="checkbox"
          checked={showRawTagNodes}
          onChange={(e) => setShowRawTagNodes(e.target.checked)}
          className="h-4 w-4 rounded border border-outline"
        />
        Show raw tag nodes
      </label>

      <TunnelGraph
        nodes={rendered.nodes}
        links={rendered.links}
        onEdgeSelect={setSelectedEdge}
        onEdgeHover={setHoveredEdge}
      />

      {edgeForPanel ? (
        <div className="rounded-sm border border-outline bg-surface-low p-3 text-sm text-primary">
          <h4 className="text-sm font-semibold">Why these are linked</h4>
          <p className="mt-2 text-copy-muted">{edgeForPanel.rationale || "No rationale available."}</p>
          <small className="mt-2 block text-copy-muted">
            Bridge: {edgeForPanel.bridgeScore.toFixed(2)} | Similarity: {edgeForPanel.weight.toFixed(2)}
          </small>
        </div>
      ) : null}
    </div>
  );
}
