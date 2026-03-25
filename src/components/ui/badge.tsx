import type { ReactNode } from "react";

export function Badge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border border-outline bg-surface-low px-2.5 py-1 text-xs text-copy-muted ${className}`}>
      {children}
    </span>
  );
}
