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
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">{label}</div>
        <h1 className="mt-2 font-serif text-4xl leading-tight tracking-tight text-primary">{title}</h1>
        {description && <p className="mt-3 text-sm text-copy-muted">{description}</p>}
        {children && <div className="mt-4">{children}</div>}
      </Card>
    </FadeIn>
  );
}
