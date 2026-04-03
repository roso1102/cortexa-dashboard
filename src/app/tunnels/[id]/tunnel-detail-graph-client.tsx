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
        <div className="space-y-4 rounded-sm border border-outline bg-surface-low p-4">
          <div>
            <h3 className="text-sm font-bold text-primary">Why these are linked</h3>
            <p className="mt-1 text-sm text-copy">{edgeForPanel.rationale || "No direct rationale provided."}</p>
          </div>

          <div className="flex gap-4 rounded-sm bg-white/5 p-3">
            <div className="flex-1">
              <div className="text-xs font-semibold text-copy-muted uppercase tracking-wide">Semantic Bridge</div>
              <div className="mt-1 text-lg font-bold text-primary">{(edgeForPanel.bridgeScore * 100).toFixed(0)}%</div>
            </div>
            <div className="flex-1">
              <div className="text-xs font-semibold text-copy-muted uppercase tracking-wide">Similarity</div>
              <div className="mt-1 text-lg font-bold text-primary">{(edgeForPanel.weight * 100).toFixed(0)}%</div>
            </div>
          </div>

          {explainLoading ? (
            <div className="flex items-center gap-2 text-sm text-copy-muted">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-copy-muted border-t-primary"></div>
              Loading detailed explanation...
            </div>
          ) : null}

          {!explainLoading && explanation ? (
            <div className="space-y-3">
              {explanation.summary ? (
                <div>
                  <div className="text-xs font-semibold text-copy-muted uppercase tracking-wide">Summary</div>
                  <p className="mt-1 text-sm text-copy-muted">{explanation.summary}</p>
                </div>
              ) : null}

              {Array.isArray(explanation.evidence) && explanation.evidence.length > 0 ? (
                <div>
                  <div className="text-xs font-semibold text-copy-muted uppercase tracking-wide">Evidence</div>
                  <ul className="mt-2 space-y-2">
                    {explanation.evidence.map((item, idx) => (
                      <li key={`${edgeForPanel.id}-evidence-${idx}`} className="rounded-sm bg-white/5 p-2 text-xs text-copy-muted border-l-2 border-primary pl-3">
                        {item.quote || "No quote provided."}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {explanation.fallback ? (
                <div className="rounded-sm bg-amber-50 p-2 text-xs text-amber-900">
                  ⚠ This explanation used fallback reasoning (full analysis not available).
                </div>
              ) : null}
            </div>
          ) : null}

          {explainError ? (
            <div className="rounded-sm bg-danger-soft p-2 text-xs text-danger">
              Could not load explanation: {explainError}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
