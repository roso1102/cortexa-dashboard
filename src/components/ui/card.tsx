import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  return (
    <section className={`rounded-lg border border-outline/60 bg-white p-6 shadow-[0px_16px_40px_rgba(0,28,14,0.06)] ${className}`}>
      {children}
    </section>
  );
}
