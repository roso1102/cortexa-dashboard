import { getMemories } from "@/lib/cortexaApi";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScaleIn } from "@/components/ui/motion";

export const dynamic = "force-dynamic";

export default async function MemoriesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) || {};
  const q = typeof sp.q === "string" ? sp.q : "";
  const source_type = typeof sp.source_type === "string" ? sp.source_type : "";
  const tag = typeof sp.tag === "string" ? sp.tag : "";
  const page = typeof sp.page === "string" ? Math.max(parseInt(sp.page, 10) || 1, 1) : 1;

  const data = await getMemories({ q, source_type, tag, page, per_page: 20 });

  return (
    <>
      <PageHeader
        label="Memories"
        title="Browse your memory store"
        description="Filter by source type or tags. Search is semantic and indexed by your backend."
      />

      <ScaleIn delay={0.1}>
        <Card>
          <form className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <Input
                name="q"
                defaultValue={q}
                placeholder="Search (semantic)..."
              />
              <Input
                name="source_type"
                defaultValue={source_type}
                placeholder="source_type (text/link/pdf/...)"
              />
              <Input
                name="tag"
                defaultValue={tag}
                placeholder="tag (e.g. fpga)"
              />
              <Button variant="primary">Apply</Button>
            </div>
          </form>
        </Card>
      </ScaleIn>

      <ScaleIn delay={0.2}>
        <Card>
          <div className="mb-4 flex items-center justify-between border-b border-zinc-200 pb-4">
            <div className="text-sm text-zinc-600">
              Showing <span className="font-semibold">{data.items.length}</span> of{" "}
              <span className="font-semibold">{data.total}</span> memories (page{" "}
              <span className="font-semibold">{data.page}</span>)
            </div>
          </div>
          <div className="divide-y divide-zinc-100">
            {data.items.map((m, idx) => {
              const title = (m.title as string) || (m.file_name as string) || (m.url as string) || "Untitled";
              const st = (m.source_type as string) || "text";
              const raw = (m.raw_content as string) || "";
              const tagsArr = Array.isArray(m.tags) ? (m.tags as string[]) : [];
              return (
                <div key={(m.id as string) || `${idx}`} className="py-4 first:pt-0 last:pb-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge>{st}</Badge>
                    {m.id ? (
                      <a
                        className="text-sm font-semibold text-blue-600 hover:underline"
                        href={`/memories/${m.id as string}`}
                      >
                        {title}
                      </a>
                    ) : (
                      <div className="text-sm font-semibold text-zinc-900">{title}</div>
                    )}
                  </div>
                  {m.url ? (
                    <a
                      className="mb-2 block break-all text-xs text-blue-600 hover:underline"
                      href={m.url as string}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {m.url as string}
                    </a>
                  ) : null}
                  {raw && (
                    <div className="rounded bg-zinc-50 p-3 text-sm leading-6 text-zinc-700">
                      {raw.slice(0, 300)}{raw.length > 300 ? "…" : ""}
                    </div>
                  )}
                  {tagsArr.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {tagsArr.slice(0, 8).map((t) => (
                        <Badge key={t} className="text-xs">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
            {!data.items.length && (
              <div className="py-8 text-center text-sm text-zinc-600">
                No memories found. Try adjusting your filters.
              </div>
            )}
          </div>
        </Card>
      </ScaleIn>

      <ScaleIn delay={0.3}>
        <Pager page={data.page} total={data.total} perPage={data.per_page} q={q} source_type={source_type} tag={tag} />
      </ScaleIn>
    </>
  );
}

function Pager({
  page,
  total,
  perPage,
  q,
  source_type,
  tag,
}: {
  page: number;
  total: number;
  perPage: number;
  q: string;
  source_type: string;
  tag: string;
}) {
  const maxPage = Math.max(1, Math.ceil(total / perPage));
  const prev = Math.max(1, page - 1);
  const next = Math.min(maxPage, page + 1);

  const mk = (p: number) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (source_type) sp.set("source_type", source_type);
    if (tag) sp.set("tag", tag);
    sp.set("page", String(p));
    return `/memories?${sp.toString()}`;
  };

  return (
    <div className="flex items-center justify-between">
      <Button variant="ghost" disabled={page <= 1} onClick={() => (page > 1 ? window.location.href = mk(prev) : null)}>
        ← Previous
      </Button>
      <div className="text-sm text-zinc-600">
        Page <span className="font-semibold">{page}</span> of{" "}
        <span className="font-semibold">{maxPage}</span>
      </div>
      <Button variant="ghost" disabled={page >= maxPage} onClick={() => (page < maxPage ? window.location.href = mk(next) : null)}>
        Next →
      </Button>
    </div>
  );
}

