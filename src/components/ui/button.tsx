import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "ghost";
};

export function Button({ children, className = "", variant = "primary", ...props }: ButtonProps) {
  const base = "inline-flex h-10 items-center justify-center rounded-sm px-4 [font-family:var(--font-manrope)] text-sm font-bold tracking-[-0.01em] transition-all";
  const styles =
    variant === "primary"
      ? "bg-primary text-white hover:opacity-90"
      : "border border-outline bg-white text-primary hover:bg-surface-low";
  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
}
