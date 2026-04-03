"use client";

import { useCallback, useEffect, useState } from "react";
import { TunnelGraph, type TunnelGraphEdgeLink, type TunnelGraphRenderNode } from "@/components/tunnel-graph";
import { DASHBOARD_TOKEN_KEY } from "@/lib/auth";
import { explainTunnelEdge, fetchTunnelGraph, rebuildTunnelEdges, type TunnelEdgeExplainResponse } from "@/lib/api";

type TunnelDetailGraphClientProps = {
  tunnelId: string;
};

export function TunnelDetailGraphClient({ tunnelId }: TunnelDetailGraphClientProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dropWeakEdges, setDropWeakEdges] = useState(false);
  const [isRebuilding, setIsRebuilding] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState<TunnelGraphEdgeLink | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<TunnelGraphEdgeLink | null>(null);
  const [explainCache, setExplainCache] = useState<Record<string, TunnelEdgeExplainResponse>>({});
  const [explainLoading, setExplainLoading] = useState(false);
  const [explainError, setExplainError] = useState<string | null>(null);
  const [data, setData] = useState<{ nodes: TunnelGraphRenderNode[]; links: TunnelGraphEdgeLink[] }>({
    nodes: [],
    links: [],
  });

  const loadGraph = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSelectedEdge(null);
    setHoveredEdge(null);
    setExplainError(null);
    setExplainLoading(false);

    try {
      const token = window.localStorage.getItem(DASHBOARD_TOKEN_KEY);
      if (!token) {
        throw new Error("Missing dashboard token. Please log in again.");
      }

      const graphData = await fetchTunnelGraph(tunnelId, token, dropWeakEdges ? 0.05 : undefined);

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
        fromMemoryId: e.from_memory_id,
        toMemoryId: e.to_memory_id,
        rationale: e.rationale,
        weight: e.weight ?? 0,
        bridgeScore: e.bridge_score ?? 0,
      }));

      setData({ nodes: graphNodes, links: graphLinks });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setData({ nodes: [], links: [] });
    } finally {
      setLoading(false);
    }
  }, [dropWeakEdges, tunnelId]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!active) return;
      await loadGraph();
    };

    void load();

    return () => {
      active = false;
    };
  }, [loadGraph]);

  const edgeForPanel = selectedEdge || hoveredEdge;
  const edgeKey = edgeForPanel?.id || "";

  useEffect(() => {
    if (!edgeForPanel?.fromMemoryId || !edgeForPanel?.toMemoryId) {
      setExplainLoading(false);
      setExplainError(null);
      return;
    }

    if (explainCache[edgeKey]) {
      setExplainLoading(false);
      setExplainError(null);
      return;
    }

    let active = true;

    const run = async () => {
      setExplainLoading(true);
      setExplainError(null);
      try {
        const token = window.localStorage.getItem(DASHBOARD_TOKEN_KEY);
        if (!token) throw new Error("Missing dashboard token. Please log in again.");

        const result = await explainTunnelEdge(tunnelId, token, {
          from_memory_id: edgeForPanel.fromMemoryId || edgeForPanel.source,
          to_memory_id: edgeForPanel.toMemoryId || edgeForPanel.target,
        });

        if (!active) return;
        setExplainCache((prev) => ({ ...prev, [edgeKey]: result }));
      } catch (e) {
        if (!active) return;
        setExplainError(e instanceof Error ? e.message : "Unable to explain this edge.");
      } finally {
        if (active) setExplainLoading(false);
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [edgeForPanel, edgeKey, explainCache, tunnelId]);

  async function onRebuildEdges() {
    if (isRebuilding) return;

    setIsRebuilding(true);
    setError(null);
    try {
      const token = window.localStorage.getItem(DASHBOARD_TOKEN_KEY);
      if (!token) throw new Error("Missing dashboard token. Please log in again.");
      await rebuildTunnelEdges(tunnelId, token);
      setExplainCache({});
      await loadGraph();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to rebuild edge links.");
    } finally {
      setIsRebuilding(false);
    }
  }

  if (loading) {
    return <div className="text-sm text-copy-muted">Loading semantic tunnel graph...</div>;
  }

  if (error) {
    return <div className="rounded-sm border border-danger bg-danger-soft p-4 text-sm text-danger">{error}</div>;
  }

  if (data.nodes.length === 0) {
    return <div className="text-sm text-copy-muted">No memories in this tunnel yet.</div>;
  }

  const explanation = edgeKey ? explainCache[edgeKey] : undefined;

  return (
    <div className="space-y-3">
      {data.nodes.length > 0 && data.links.length === 0 ? (
        <div className="rounded-sm border border-outline bg-surface-low p-3 text-sm text-copy-muted">
          No strong semantic links found yet.
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex items-center gap-2 text-xs text-copy-muted">
          <input
            type="checkbox"
            checked={dropWeakEdges}
            onChange={(e) => setDropWeakEdges(e.target.checked)}
            className="h-4 w-4 rounded border border-outline"
          />
          Drop weak edges (min bridge 0.05)
        </label>
        <button
          type="button"
          onClick={onRebuildEdges}
          disabled={isRebuilding || loading}
          className="rounded-sm border border-outline bg-white px-3 py-1.5 text-xs font-semibold text-primary hover:bg-surface-low disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRebuilding ? "Recalculating links..." : "Recalculate links"}
        </button>
      </div>

      <TunnelGraph
        nodes={data.nodes}
        links={data.links}
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
          {explainLoading ? <p className="mt-2 text-xs text-copy-muted">Loading explanation...</p> : null}
          {explainError ? <p className="mt-2 text-xs text-danger">{explainError}</p> : null}
          {explanation?.summary ? <p className="mt-2 text-copy-muted">{explanation.summary}</p> : null}
          {Array.isArray(explanation?.evidence) && explanation.evidence.length > 0 ? (
            <ul className="mt-2 list-disc pl-5 text-xs text-copy-muted">
              {explanation.evidence.map((item, idx) => (
                <li key={`${edgeForPanel.id}-evidence-${idx}`}>{item.quote || "No quote provided."}</li>
              ))}
            </ul>
          ) : null}
          {explanation?.fallback ? <p className="mt-2 text-xs text-copy-muted">Note: explanation used fallback reasoning.</p> : null}
        </div>
      ) : null}
    </div>
  );
}
