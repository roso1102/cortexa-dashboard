import { getMemoryById } from "@/lib/cortexaApi";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScaleIn } from "@/components/ui/motion";

export const dynamic = "force-dynamic";

export default async function MemoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getMemoryById(id);
  const m = data.item;

  const title = (m.title as string) || (m.file_name as string) || (m.url as string) || "Memory";
  const st = (m.source_type as string) || "text";
  const raw = (m.raw_content as string) || "";
  const tagsArr = Array.isArray(m.tags) ? (m.tags as string[]) : [];

  return (
    <>
      <PageHeader
        label="Memory"
        title={title}
      />

      <ScaleIn delay={0.1}>
        <Card>
          <div className="mb-4 flex flex-wrap items-center gap-2 border-b border-zinc-200 pb-4">
            <Badge>{st}</Badge>
            {m.id && (
              <Badge className="flex-shrink-0 text-xs">
                id: {(m.id as string).slice(0, 12)}…
              </Badge>
            )}
          </div>
          {m.url && (
            <a
              className="block break-all text-sm text-blue-600 hover:underline"
              href={m.url as string}
              target="_blank"
              rel="noreferrer"
            >
              {m.url as string}
            </a>
          )}
        </Card>
      </ScaleIn>

      {tagsArr.length > 0 && (
        <ScaleIn delay={0.2}>
          <Card>
            <div className="mb-4 text-sm font-semibold text-zinc-900">Tags</div>
            <div className="flex flex-wrap gap-2">
              {tagsArr.map((t) => (
                <Badge key={t}>{t}</Badge>
              ))}
            </div>
          </Card>
        </ScaleIn>
      )}

      <ScaleIn delay={0.3}>
        <Card>
          <div className="mb-4 text-sm font-semibold text-zinc-900">Full text</div>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <pre className="overflow-auto whitespace-pre-wrap font-mono text-sm leading-6 text-zinc-800">
              {raw}
            </pre>
          </div>
        </Card>
      </ScaleIn>
    </>
  );
}

