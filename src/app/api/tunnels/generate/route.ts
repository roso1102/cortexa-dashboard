import { NextRequest, NextResponse } from "next/server";

function baseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (!raw) {
    throw new Error("Missing API URL config: set NEXT_PUBLIC_API_URL");
  }
  return raw.replace(/\/+$/, "");
}

export async function POST(request: NextRequest) {
  const token = request.headers.get("x-dashboard-token") || "";
  if (!token) {
    return NextResponse.json({ error: "missing_dashboard_token" }, { status: 401 });
  }

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
  return NextResponse.json(data, { status: res.status });
}