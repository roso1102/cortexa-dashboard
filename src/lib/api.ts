export type TunnelGraphNode = {
  id: string;
  title: string;
  snippet: string;
  tags: string[];
  source_type: string;
  created_at_ts: number;
};

export type TunnelGraphEdge = {
  from_memory_id: string;
  to_memory_id: string;
  weight: number | null;
  bridge_score: number | null;
  rationale: string;
};

export type TunnelGraphResponse = {
  tunnel_id: string;
  nodes: TunnelGraphNode[];
  edges: TunnelGraphEdge[];
};

export async function fetchTunnelGraph(
  tunnelId: string,
  token: string
): Promise<TunnelGraphResponse> {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) throw new Error("Missing required env var: NEXT_PUBLIC_API_URL");

  const res = await fetch(`${base}/api/tunnels/${encodeURIComponent(tunnelId)}/graph`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Dashboard-Token": token,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Tunnel graph load failed (${res.status}): ${txt}`);
  }

  return res.json();
}
