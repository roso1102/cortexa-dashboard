import { getMemoryById } from "@/lib/cortexaApi";

export const dynamic = "force-dynamic";

export default async function MemoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let m: Awaited<ReturnType<typeof getMemoryById>>["item"] | null = null;
  let error: string | null = null;

  try {
    const data = await getMemoryById(id);
    m = data.item;
  } catch (e) {
    error = e instanceof Error ? e.message : "Unknown error";
  }

  if (!m) {
    return (
      <div className="space-y-6">
        <header className="rounded-lg border border-outline bg-white p-6 shadow-[0px_16px_40px_rgba(0,28,14,0.06)]">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Memory</div>
          <h1 className="mt-2 font-serif text-4xl tracking-tight text-primary">Memory detail</h1>
        </header>
        <section className="rounded-lg border border-danger bg-danger-soft p-6 text-sm text-danger">
          Unable to load memory: {error || "Not found"}
        </section>
      </div>
    );
  }

  const raw = (m.raw_content as string) || "";
  const firstLine = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .find((l) => l.length > 0);
  const title = (m.title as string) || firstLine || (m.file_name as string) || (m.url as string) || "Memory";
  const st = (m.source_type as string) || "text";
  const tagsArr = Array.isArray(m.tags) ? (m.tags as string[]) : [];

  return (
    <div className="space-y-6">
      <header className="rounded-lg border border-outline bg-white p-6 shadow-[0px_16px_40px_rgba(0,28,14,0.06)]">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Memory</div>
        <h1 className="mt-2 font-serif text-4xl tracking-tight text-primary">{title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-surface-low px-2 py-1 text-xs text-copy-muted">{st}</span>
          {m.id ? <span className="rounded-full border border-outline px-2 py-1 text-xs text-copy-muted">id: {m.id as string}</span> : null}
        </div>
        {m.url ? (
          <a className="mt-3 block break-all text-sm text-copy-muted hover:text-primary hover:underline" href={m.url as string} target="_blank" rel="noreferrer">
            {m.url as string}
          </a>
        ) : null}
      </header>

      {tagsArr.length ? (
        <section className="rounded-lg border border-outline bg-white p-6 shadow-[0px_16px_40px_rgba(0,28,14,0.06)]">
          <div className="text-sm font-semibold text-primary">Tags</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {tagsArr.map((t) => (
              <span key={t} className="rounded-full border border-outline px-2 py-1 text-xs text-copy-muted">
                {t}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-lg border border-outline bg-white p-6 shadow-[0px_16px_40px_rgba(0,28,14,0.06)]">
        <div className="text-sm font-semibold text-primary">Full text</div>
        <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-copy">{raw}</pre>
      </section>
    </div>
  );
}

