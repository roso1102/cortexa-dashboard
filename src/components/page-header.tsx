import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { FadeIn } from "@/components/ui/motion";

type PageHeaderProps = {
  label: string;
  title: string;
  description?: string;
  children?: ReactNode;
};

export function PageHeader({ label, title, description, children }: PageHeaderProps) {
  return (
    <FadeIn>
      <Card>
        <div className="text-xs font-medium uppercase tracking-widest text-zinc-500">{label}</div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">{title}</h1>
        {description && <p className="mt-3 text-sm text-zinc-600">{description}</p>}
        {children && <div className="mt-4">{children}</div>}
      </Card>
    </FadeIn>
  );
}
