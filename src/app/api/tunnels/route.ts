import { NextRequest, NextResponse } from "next/server";

function baseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (!raw) {
    throw new Error("Missing API URL config: set NEXT_PUBLIC_API_URL");
  }
  return raw.replace(/\/+$/, "");
}

export async function GET(request: NextRequest) {
  const token = request.headers.get("x-dashboard-token") || "";
  if (!token) {
    return NextResponse.json({ error: "missing_dashboard_token" }, { status: 401 });
  }

  const res = await fetch(`${baseUrl()}/api/tunnels`, {
    method: "GET",
    headers: {
      "X-Dashboard-Token": token,
    },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({} as Record<string, unknown>));
  return NextResponse.json(data, { status: res.status });
}