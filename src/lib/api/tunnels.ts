function baseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!raw) {
    throw new Error("Missing API URL config: set NEXT_PUBLIC_API_URL (or NEXT_PUBLIC_API_BASE_URL)");
  }
  return raw.replace(/\/+$/, "");
}

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

export async function generateTunnelsNow(token: string): Promise<GenerateTunnelsResponse> {
  const res = await fetch(`${baseUrl()}/api/tunnels/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Dashboard-Token": token,
    },
    body: JSON.stringify({}),
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

  return data as GenerateTunnelsResponse;
}