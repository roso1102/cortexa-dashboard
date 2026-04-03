export type GeneratedTunnel = {
  id?: string;
  tunnel_name?: string;
  reason?: string;
  core_tag?: string;
  memory_count?: number;
  created_at_ts?: number;
};

export type GenerateTunnelsResponse = {
  ok: boolean;
  count: number;
  tunnels: GeneratedTunnel[];
  generated_at: string;
};

export type TunnelListResponse = {
  tunnels: GeneratedTunnel[];
};

async function proxyFetch<T>(path: string, token: string, method: "GET" | "POST"): Promise<T> {
  const res = await fetch(path, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Dashboard-Token": token,
    },
    body: method === "POST" ? JSON.stringify({}) : undefined,
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({} as Record<string, unknown>));

  if (!res.ok) {
    const message =
      typeof data?.error === "string" && data.error.length > 0
        ? data.error
        : `HTTP ${res.status}`;
    throw Object.assign(new Error(message), { status: res.status, data });
  }

  return data as T;
}

export async function getTunnelsNow(token: string): Promise<TunnelListResponse> {
  return proxyFetch<TunnelListResponse>("/api/tunnels", token, "GET");
}

export async function generateTunnelsNow(token: string): Promise<GenerateTunnelsResponse> {
  return proxyFetch<GenerateTunnelsResponse>("/api/tunnels/generate", token, "POST");
}