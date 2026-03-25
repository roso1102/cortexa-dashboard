"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { DASHBOARD_TOKEN_KEY } from "@/lib/auth";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    window.localStorage.removeItem(DASHBOARD_TOKEN_KEY);
    document.cookie = `${DASHBOARD_TOKEN_KEY}=; path=/; max-age=0; samesite=lax`;
    router.replace("/login");
  };

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: "◦" },
    { href: "/memories", label: "Memories", icon: "◦" },
    { href: "/tunnels", label: "Tunnels", icon: "◦" },
    { href: "/profile", label: "Profile", icon: "◦" },
  ];

  return (
    <>
      <div className="md:hidden">
        <div className="rounded-lg border border-outline bg-white p-3 shadow-[0px_14px_30px_rgba(0,28,14,0.06)]">
          <div className="mb-1 font-serif text-2xl leading-none tracking-tight text-primary">cortexa</div>
          <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-copy-muted">Memory layer</div>
          <nav className="grid grid-cols-4 gap-2">
            {links.map(({ href, label, icon }) => {
              const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium transition ${
                    isActive
                      ? "bg-primary/8 text-primary"
                      : "text-copy-muted hover:bg-surface-low"
                  }`}
                >
                  <span className="text-base leading-none text-secondary">{icon}</span>
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 w-full rounded-sm border border-outline bg-white px-3 py-2 text-xs font-semibold text-primary transition hover:bg-surface-low"
          >
            Logout
          </button>
        </div>
      </div>

      <aside className="hidden w-56 flex-shrink-0 md:block">
        <div className="rounded-lg border border-outline bg-white p-4 shadow-[0px_20px_45px_rgba(0,28,14,0.06)]">
          <div className="font-serif text-3xl leading-none tracking-tight text-primary">cortexa</div>
          <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-copy-muted">Memory dashboard</div>
          <nav className="mt-6 flex flex-col gap-2">
            {links.map(({ href, label, icon }) => {
              const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-primary/8 text-primary"
                      : "text-copy-muted hover:bg-surface-low"
                  }`}
                >
                  <span className="text-secondary">{icon}</span> {label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-6 border-t border-outline pt-4">
            <Badge className="text-xs">v0.1.0</Badge>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-3 w-full rounded-sm border border-outline bg-white px-3 py-2 text-xs font-semibold text-primary transition hover:bg-surface-low"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
