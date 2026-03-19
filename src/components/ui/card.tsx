import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  return <section className={`rounded-2xl border border-zinc-200 bg-white/90 p-6 shadow-sm ${className}`}>{children}</section>;
}
