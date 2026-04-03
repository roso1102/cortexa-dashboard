import { DASHBOARD_TOKEN_KEY } from "@/lib/auth";

export type MemoryItem = Record<string, unknown> & {
  id?: string;
  source_type?: string;
  title?: string;
  url?: string;
  file_name?: string;
  raw_content?: string;
  created_at?: string;
  created_at_ts?: number;
  tags?: string[];
  score?: number;
  priority_score?: number;
  tunnel_name?: string;
  memory_count?: number;
  core_tag?: string;
};

function baseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (!raw) {
    throw new Error("Missing API URL config: set NEXT_PUBLIC_API_URL");
  }
  return raw.replace(/\/+$/, "");
}

function decodeURIComponentSafe(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function fullyDecodeURIComponent(value: string, maxRounds = 5): string {
  let current = value;
  for (let i = 0; i < maxRounds; i += 1) {
    const decoded = decodeURIComponentSafe(current);
    if (decoded === current) {
      break;
    }
    current = decoded;
  }
  return current;
}

function encodeMemoryIdOnce(id: string): string {
  // Some backends return ids that are already URL-encoded one or more times.
  // Canonicalize by fully decoding then encoding exactly once.
  return encodeURIComponent(fullyDecodeURIComponent(id));
}

async function apiFetch<T>(path: string): Promise<T> {
  const token = await resolveDashboardToken();

  const res = await fetch(`${baseUrl()}${path}`, {
    method: "GET",
    headers: {
      ...(token ? { "X-Dashboard-Token": token } : {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    // Try to parse JSON error first, fall back to text
    let detail = "";
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const j = await res.json().catch(() => ({}));
      detail = j.error || JSON.stringify(j);
    } else {
      const t = await res.text().catch(() => "");
      // Strip HTML tags from Flask error pages
      detail = t.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 300);
    }
    throw new Error(`API ${path} → ${res.status}: ${detail}`);
  }

  return (await res.json()) as T;
}

async function resolveDashboardToken(): Promise<string | null> {
  if (typeof window !== "undefined") {
    return window.localStorage.getItem(DASHBOARD_TOKEN_KEY);
  }

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  return cookieStore.get(DASHBOARD_TOKEN_KEY)?.value ?? null;
}

export async function getTodaySummary(): Promise<{ text: string; generated_at: string }> {
  return apiFetch("/api/summary/today");
}

export async function getProfile(): Promise<{ snapshot: string }> {
  return apiFetch("/api/profile");
}

export async function getTunnels(): Promise<{ tunnels: MemoryItem[] }> {
  return apiFetch("/api/tunnels");
}

export async function getMemories(params?: {
  q?: string;
  source_type?: string;
  tag?: string;
  page?: number;
  per_page?: number;
}): Promise<{ items: MemoryItem[]; total: number; page: number; per_page: number }> {
  const sp = new URLSearchParams();
  if (params?.q) sp.set("q", params.q);
  if (params?.source_type) sp.set("source_type", params.source_type);
  if (params?.tag) sp.set("tag", params.tag);
  if (params?.page) sp.set("page", String(params.page));
  if (params?.per_page) sp.set("per_page", String(params.per_page));
  const qs = sp.toString();
  return apiFetch(`/api/memories${qs ? `?${qs}` : ""}`);
}

export async function getMemoryById(id: string): Promise<{ item: MemoryItem }> {
  return apiFetch(`/api/memories/${encodeMemoryIdOnce(id)}`);
}

