import { getMemories } from "@/lib/cortexaApi";

export const dynamic = "force-dynamic";

const FILTERED_PAGE_SIZE = 20;
const UNFILTERED_BATCH_SIZE = 100;
const MAX_UNFILTERED_ITEMS = 500;

function normalizeRouteId(id: string): string {
  let current = id;
  for (let i = 0; i < 5; i += 1) {
    try {
      const decoded = decodeURIComponent(current);
      if (decoded === current) {
        break;
      }
      current = decoded;
    } catch {
      break;
    }
  }
  return encodeURIComponent(current);
}

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
  const hasFilters = Boolean(q || source_type || tag);

  let error: string | null = null;
  let isTruncated = false;
  let data = { items: [] as Awaited<ReturnType<typeof getMemories>>["items"], total: 0, page, per_page: FILTERED_PAGE_SIZE };

  try {
    if (hasFilters) {
      data = await getMemories({ q, source_type, tag, page, per_page: FILTERED_PAGE_SIZE });
    } else {
      const first = await getMemories({ page: 1, per_page: UNFILTERED_BATCH_SIZE });
      const merged = [...first.items];
      const maxPages = Math.max(1, Math.ceil(Math.min(first.total, MAX_UNFILTERED_ITEMS) / UNFILTERED_BATCH_SIZE));

      for (let p = 2; p <= maxPages && merged.length < first.total; p += 1) {
        const nextPage = await getMemories({ page: p, per_page: UNFILTERED_BATCH_SIZE });
        if (!nextPage.items.length) {
          break;
        }
        merged.push(...nextPage.items);
      }

      if (merged.length > MAX_UNFILTERED_ITEMS) {
        merged.length = MAX_UNFILTERED_ITEMS;
        isTruncated = true;
      }

      if (first.total > MAX_UNFILTERED_ITEMS) {
        isTruncated = true;
      }

      data = {
        items: merged,
        total: first.total,
        page: 1,
        per_page: merged.length || UNFILTERED_BATCH_SIZE,
      };
    }
  } catch (e) {
    error = e instanceof Error ? e.message : "Unknown error";
  }

  return (
    <div className="space-y-6">
      <header className="rounded-lg border border-outline bg-white p-6 shadow-[0px_16px_40px_rgba(0,28,14,0.06)]">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Memories</div>
        <h1 className="mt-2 font-serif text-4xl tracking-tight text-primary">Browse your memory store</h1>
        <p className="mt-2 text-sm text-copy-muted">Filter by source type or tags. Search is semantic (best-effort).</p>
      </header>

      <form className="rounded-lg border border-outline bg-white p-6 shadow-[0px_16px_40px_rgba(0,28,14,0.06)]">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search (semantic)..."
            className="h-10 rounded-sm border border-outline bg-white px-3 text-sm text-copy outline-none focus:border-primary-ink"
          />
          <input
            name="source_type"
            defaultValue={source_type}
            placeholder="source_type (text/link/pdf/...)"
            className="h-10 rounded-sm border border-outline bg-white px-3 text-sm text-copy outline-none focus:border-primary-ink"
          />
          <input
            name="tag"
            defaultValue={tag}
            placeholder="tag (e.g. fpga)"
            className="h-10 rounded-sm border border-outline bg-white px-3 text-sm text-copy outline-none focus:border-primary-ink"
          />
          <button className="h-10 rounded-sm bg-primary px-3 text-sm font-semibold text-white hover:opacity-90">
            Apply
          </button>
        </div>
      </form>

      <section className="rounded-lg border border-outline bg-white shadow-[0px_16px_40px_rgba(0,28,14,0.06)]">
        {error ? (
          <div className="border-b border-danger bg-danger-soft p-4 text-sm text-danger">
            Unable to load memories: {error}
          </div>
        ) : null}
        <div className="border-b border-outline p-4 text-sm text-copy-muted">
          Showing {data.items.length} of {data.total} (page {data.page})
        </div>
        {isTruncated ? (
          <div className="border-b border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Loaded the first {MAX_UNFILTERED_ITEMS} memories. Use search or filters to narrow down older items.
          </div>
        ) : null}
        <div className="divide-y divide-outline/50">
          {data.items.map((m, idx) => {
            const raw = (m.raw_content as string) || "";
            const preview = raw.slice(0, 260);
            const firstLine = raw
              .split(/\r?\n/)
              .map((l) => l.trim())
              .find((l) => l.length > 0);
            const title = (m.title as string) || firstLine || (m.file_name as string) || (m.url as string) || "Untitled";
            const st = (m.source_type as string) || "text";
            const memoryId = typeof m.id === "string" ? normalizeRouteId(m.id) : "";
            const tagsArr = Array.isArray(m.tags) ? (m.tags as string[]) : [];
            return (
              <div key={`${(m.id as string) || "memory"}-${idx}`} className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-surface-low px-2 py-1 text-xs text-copy-muted">{st}</span>
                  {memoryId ? (
                    <a className="text-sm font-semibold text-primary hover:text-primary-ink hover:underline" href={`/memories/${memoryId}`}>
                      {title}
                    </a>
                  ) : (
                    <div className="text-sm font-medium">{title}</div>
                  )}
                </div>
                {m.url ? (
                  <a className="mt-1 block break-all text-sm text-copy-muted hover:text-primary hover:underline" href={m.url as string} target="_blank" rel="noreferrer">
                    {m.url as string}
                  </a>
                ) : null}
                {preview ? (
                  <div className="mt-2 whitespace-pre-wrap text-sm leading-6 text-copy-muted">
                    {preview}{raw.length > preview.length ? "..." : ""}
                  </div>
                ) : null}
                {tagsArr.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tagsArr.slice(0, 8).map((t) => (
                      <span key={t} className="rounded-full border border-outline px-2 py-1 text-xs text-copy-muted">
                        {t}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
          {!data.items.length ? <div className="p-6 text-sm text-copy-muted">No results.</div> : null}
        </div>
      </section>

      {hasFilters ? (
        <Pager page={data.page} total={data.total} perPage={data.per_page} q={q} source_type={source_type} tag={tag} />
      ) : null}
    </div>
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
      <a
        className="rounded-sm border border-outline bg-white px-4 py-2 text-sm text-primary hover:bg-surface-low"
        href={mk(prev)}
        aria-disabled={page <= 1}
      >
        Prev
      </a>
      <div className="text-sm text-copy-muted">
        Page {page} / {maxPage}
      </div>
      <a className="rounded-sm border border-outline bg-white px-4 py-2 text-sm text-primary hover:bg-surface-low" href={mk(next)}>
        Next
      </a>
    </div>
  );
}

