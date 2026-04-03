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

export type TunnelListItem = {
  id?: string;
  tunnel_name?: string;
  reason?: string;
  core_tag?: string;
  memory_count?: number;
  created_at_ts?: number;
  raw_content?: string;
};

export type TunnelListResponse = {
  tunnels: TunnelListItem[];
};

export type TunnelEdgeExplainResponse = {
  summary?: string;
  evidence?: Array<{ quote?: string }>;
  fallback?: boolean;
};

function getApiBase(): string {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) throw new Error("Missing required env var: NEXT_PUBLIC_API_URL");
  return base.replace(/\/$/, "");
}

async function parseError(res: Response, label: string): Promise<never> {
  const txt = await res.text();
  throw new Error(`${label} (${res.status}): ${txt}`);
}

export async function fetchTunnels(token: string): Promise<TunnelListResponse> {
  const base = getApiBase();
  const res = await fetch(`${base}/api/tunnels`, {
    method: "GET",
    headers: {
      "X-Dashboard-Token": token,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return parseError(res, "Tunnel list load failed");
  }

  return res.json();
}

export async function fetchTunnelGraph(
  tunnelId: string,
  token: string,
  minBridge?: number
): Promise<TunnelGraphResponse> {
  const base = getApiBase();
  const query = typeof minBridge === "number" ? `?min_bridge=${encodeURIComponent(String(minBridge))}` : "";

  const res = await fetch(`${base}/api/tunnels/${encodeURIComponent(tunnelId)}/graph${query}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Dashboard-Token": token,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return parseError(res, "Tunnel graph load failed");
  }

  return res.json();
}

export async function explainTunnelEdge(
  tunnelId: string,
  token: string,
  payload: { from_memory_id: string; to_memory_id: string },
): Promise<TunnelEdgeExplainResponse> {
  const base = getApiBase();
  const res = await fetch(`${base}/api/tunnels/${encodeURIComponent(tunnelId)}/edges/explain`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Dashboard-Token": token,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!res.ok) {
    return parseError(res, "Tunnel edge explain failed");
  }

  return res.json();
}

export async function rebuildTunnelEdges(tunnelId: string, token: string): Promise<void> {
  const base = getApiBase();
  const res = await fetch(`${base}/api/tunnels/${encodeURIComponent(tunnelId)}/rebuild-edges`, {
    method: "POST",
    headers: {
      "X-Dashboard-Token": token,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return parseError(res, "Tunnel edge rebuild failed");
  }
}
