import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`h-10 rounded-sm border border-outline bg-white px-3 text-sm text-copy outline-none transition focus:border-primary-ink ${className}`}
      {...props}
    />
  );
}
