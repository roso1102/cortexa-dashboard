"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DASHBOARD_TOKEN_KEY, DASHBOARD_TOKEN_MAX_AGE_SECONDS } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [chatId, setChatId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getNextPath = () => {
    if (typeof window === "undefined") {
      return "/dashboard";
    }
    const value = new URLSearchParams(window.location.search).get("next") || "/dashboard";
    return value.startsWith("/") ? value : "/";
  };

  useEffect(() => {
    const token = window.localStorage.getItem(DASHBOARD_TOKEN_KEY);
    if (token) {
      router.replace(getNextPath());
    }
  }, [router]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_API_URL is not configured.");
      }

      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId.trim(),
          password,
        }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          setError("Invalid chat id or password");
          return;
        }

        const detail = await res.text().catch(() => "");
        throw new Error(detail || `Login failed with status ${res.status}`);
      }

      const data = (await res.json()) as { token?: string };
      if (!data.token) {
        throw new Error("Login response did not include a token.");
      }

      window.localStorage.setItem(DASHBOARD_TOKEN_KEY, data.token);
      const secure = window.location.protocol === "https:" ? "; secure" : "";
      document.cookie = `${DASHBOARD_TOKEN_KEY}=${encodeURIComponent(data.token)}; path=/; max-age=${DASHBOARD_TOKEN_MAX_AGE_SECONDS}; samesite=lax${secure}`;
      router.replace(getNextPath());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div className="mb-6">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Dashboard Login</div>
        <h1 className="mt-2 font-serif text-4xl tracking-tight text-primary">Sign in to Cortexa</h1>
        <p className="mt-2 text-sm text-copy-muted">Use your chat_id and dashboard password to continue.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="chat_id" className="text-sm font-semibold text-primary">
            chat_id
          </label>
          <Input
            id="chat_id"
            name="chat_id"
            inputMode="numeric"
            autoComplete="username"
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
            placeholder="123456789"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-semibold text-primary">
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        {error ? (
          <div className="rounded-sm border border-danger bg-danger-soft p-3 text-sm text-danger">{error}</div>
        ) : null}

        <Button variant="primary" disabled={loading} className="w-full">
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </Card>
  );
}
