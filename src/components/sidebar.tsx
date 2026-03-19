"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Dashboard", icon: "📊" },
    { href: "/memories", label: "Memories", icon: "💾" },
    { href: "/tunnels", label: "Tunnels", icon: "🌀" },
    { href: "/profile", label: "Profile", icon: "👤" },
  ];

  return (
    <aside className="hidden w-56 flex-shrink-0 md:block">
      <div className="rounded-2xl border border-zinc-200 bg-white/95 p-4">
        <div className="text-lg font-bold tracking-tight text-zinc-900">cortexa</div>
        <div className="mt-1 text-xs text-zinc-500">Memory dashboard</div>
        <nav className="mt-6 flex flex-col gap-2">
          {links.map(({ href, label, icon }) => {
            const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-zinc-100 text-zinc-900"
                    : "text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                <span>{icon}</span> {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-6 border-t border-zinc-200 pt-4">
          <Badge className="text-xs">v0.1.0</Badge>
        </div>
      </div>
    </aside>
  );
}
