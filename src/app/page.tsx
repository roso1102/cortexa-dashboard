import Link from "next/link";

const features = [
  {
    title: "Semantic Mapping",
    copy: "Understand the why behind the what. Cortexa builds relationships between data points using ontological relevance.",
    icon: "mapping",
    tone: "light",
  },
  {
    title: "Temporal Tracking",
    copy: "Context moves with time. Cortexa tracks how your understanding evolves across weeks, months, and years.",
    icon: "clock",
    tone: "dark",
  },
  {
    title: "Intelligent Resurfacing",
    copy: "Never lose an idea again. Relevant memories reappear exactly when you are working on related concepts.",
    icon: "spark",
    tone: "light",
  },
  {
    title: "Structural Encoding",
    copy: "Drop raw input from PDFs, notes, and links. Cortexa transforms it into queryable, connected knowledge.",
    icon: "chip",
    tone: "warm",
  },
  {
    title: "Privacy-First",
    copy: "Self-hosted and encrypted by design. Your cognitive layer runs inside your infrastructure.",
    icon: "lock",
    tone: "light",
  },
  {
    title: "Team Synergy",
    copy: "Shared memory for high-performing teams. Build on each other's insights without repeating work.",
    icon: "team",
    tone: "sand",
  },
];

const steps = [
  {
    title: "Ingest",
    copy: "Capture notes, links, files, and messages from everywhere.",
    icon: "inbox",
  },
  {
    title: "Structure",
    copy: "Cortexa organizes relationships, entities, and timelines automatically.",
    icon: "structure",
  },
  {
    title: "Resurface",
    copy: "Insights return exactly when they are needed for execution.",
    icon: "bulb",
  },
];

function FeatureIcon({ name, className }: { name: string; className?: string }) {
  const stroke = "currentColor";
  switch (name) {
    case "mapping":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
          <rect x="3" y="3" width="4" height="4" stroke={stroke} strokeWidth="1.8" />
          <rect x="17" y="3" width="4" height="4" stroke={stroke} strokeWidth="1.8" />
          <rect x="10" y="17" width="4" height="4" stroke={stroke} strokeWidth="1.8" />
          <path d="M7 5h10M5 7v8m2 0h8m6-8v8m-9 2v-2" stroke={stroke} strokeWidth="1.8" />
        </svg>
      );
    case "clock":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
          <circle cx="12" cy="12" r="8" stroke={stroke} strokeWidth="1.8" />
          <path d="M12 7v5l3 2" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "spark":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
          <path d="M12 3l1.6 3.4L17 8l-3.4 1.6L12 13l-1.6-3.4L7 8l3.4-1.6L12 3Z" stroke={stroke} strokeWidth="1.8" />
          <path d="M5 14l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2Zm14-1 .8 1.8L22 16l-2.2 1.2L19 19l-.8-1.8L16 16l2.2-1.2.8-1.8Z" stroke={stroke} strokeWidth="1.2" />
        </svg>
      );
    case "chip":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
          <rect x="7" y="7" width="10" height="10" rx="1" stroke={stroke} strokeWidth="1.8" />
          <path d="M10 10h4v4h-4zM12 3v3m0 12v3M3 12h3m12 0h3M6 6l1.5 1.5M16.5 16.5 18 18M18 6l-1.5 1.5M6 18l1.5-1.5" stroke={stroke} strokeWidth="1.4" />
        </svg>
      );
    case "lock":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
          <rect x="5" y="10" width="14" height="10" rx="2" stroke={stroke} strokeWidth="1.8" />
          <path d="M8 10V7a4 4 0 1 1 8 0v3" stroke={stroke} strokeWidth="1.8" />
        </svg>
      );
    case "team":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
          <circle cx="8" cy="10" r="3" stroke={stroke} strokeWidth="1.8" />
          <circle cx="16" cy="10" r="3" stroke={stroke} strokeWidth="1.8" />
          <path d="M3 19c.7-2.6 2.6-4 5-4s4.3 1.4 5 4M11 19c.6-1.9 2-3 4-3s3.4 1.1 4 3" stroke={stroke} strokeWidth="1.4" />
        </svg>
      );
    case "inbox":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
          <path d="M4 7h16v10H4z" stroke={stroke} strokeWidth="1.8" />
          <path d="M8 12h8m-4-5v5" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "structure":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
          <rect x="4" y="4" width="6" height="6" stroke={stroke} strokeWidth="1.8" />
          <rect x="14" y="4" width="6" height="6" stroke={stroke} strokeWidth="1.8" />
          <rect x="9" y="14" width="6" height="6" stroke={stroke} strokeWidth="1.8" />
          <path d="M10 7h4M12 10v4" stroke={stroke} strokeWidth="1.8" />
        </svg>
      );
    case "bulb":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
          <path d="M12 4a6 6 0 0 0-3.8 10.6c.9.8 1.4 1.7 1.4 2.9h4.8c0-1.2.5-2.1 1.4-2.9A6 6 0 0 0 12 4Z" stroke={stroke} strokeWidth="1.8" />
          <path d="M10 20h4m-3-2h2" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7f3ec] text-[#193025]">
      <header className="sticky top-0 z-30 border-b border-[#193025]/10 bg-[#f7f3ec]/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1260px] items-center justify-between gap-4 px-4 py-4 md:px-8 md:py-5">
          <div className="font-serif text-[1.85rem] font-semibold tracking-tight">Cortexa</div>
          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            <a href="#product" className="[font-family:var(--font-manrope)] text-sm font-bold tracking-[-0.01em] text-[#193025]">Product</a>
            <a href="#features" className="[font-family:var(--font-manrope)] text-sm font-bold tracking-[-0.01em] text-[#193025]/70 transition hover:text-[#193025]">Features</a>
            <a href="#about" className="[font-family:var(--font-manrope)] text-sm font-bold tracking-[-0.01em] text-[#193025]/70 transition hover:text-[#193025]">About</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden [font-family:var(--font-manrope)] text-sm font-bold tracking-[-0.01em] text-[#193025] md:inline-flex">
              Log In
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-sm bg-[#173424] px-4 py-2.5 [font-family:var(--font-manrope)] text-sm font-bold tracking-[-0.01em] !text-white transition hover:bg-[#10281c]"
            >
              Get Started
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden>
                <path d="M5 10h10m0 0-3.5-3.5M15 10l-3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1260px] px-4 pb-16 md:px-8 md:pb-20">
        <main>
          <section id="product" className="relative overflow-hidden py-14 md:py-24">
            <div className="absolute -left-24 top-0 h-44 w-44 rounded-full bg-[#8f4f38]/10 blur-3xl" />
            <div className="absolute -right-20 top-16 h-48 w-48 rounded-full bg-[#173424]/10 blur-3xl" />
            <p className="mb-6 [font-family:var(--font-manrope)] text-[11px] font-bold uppercase tracking-[0.24em] text-[#8f4f38]">The intellectual architect</p>
            <h1 className="max-w-5xl font-serif text-[2.85rem] leading-[0.98] tracking-tight text-[#173424] sm:text-[3.6rem] md:text-[4.6rem] lg:text-[6.2rem]">
              Memory without structure is storage. Memory with structure, time, and intelligence becomes
              <span className="ml-2 italic text-[#8f4f38] sm:ml-3"> cognition.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-[#173424]/80 md:text-[1.72rem]">
              The self-hosted cognitive system that functions as an externalized, structured memory layer for your mind.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-sm bg-[#173424] px-6 py-3.5 [font-family:var(--font-manrope)] text-sm font-bold tracking-[-0.01em] !text-white transition hover:bg-[#10281c]"
              >
                Start Your Free Trial
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden>
                  <path d="M5 10h10m0 0-3.5-3.5M15 10l-3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <button className="rounded-sm border border-[#173424]/20 bg-white/60 px-6 py-3.5 [font-family:var(--font-manrope)] text-sm font-bold tracking-[-0.01em] text-[#173424] transition hover:bg-white">
                Watch the Demo
              </button>
            </div>
          </section>

          <section id="features" className="py-8 md:py-14">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5">
              <article className="rounded-md border border-[#173424]/10 bg-white p-6 md:col-span-8 md:p-10">
                <div className="mb-5 text-[#a15d42]">
                  <FeatureIcon name="mapping" className="h-8 w-8" />
                </div>
                <div className="grid items-end gap-6 md:grid-cols-[1.15fr_.85fr]">
                  <div>
                    <h3 className="font-serif text-[2rem] leading-tight text-[#173424] md:text-[2.7rem]">Semantic Mapping</h3>
                    <p className="mt-3 max-w-xl text-base leading-relaxed text-[#173424]/75 md:text-[1.12rem]">
                      Understand the why behind the what. Cortexa automatically creates rich semantic relationships between your disparate data points.
                    </p>
                  </div>
                  <div className="h-44 rounded-md border border-dashed border-[#173424]/15 bg-gradient-to-br from-[#f2efe8] to-[#e8ece8] p-3">
                    <svg viewBox="0 0 420 220" className="h-full w-full" fill="none" aria-hidden>
                      <circle cx="102" cy="102" r="28" fill="#e6e9e4" stroke="#b8c4ba" strokeWidth="1.5" />
                      <circle cx="208" cy="62" r="22" fill="#ecefe9" stroke="#b8c4ba" strokeWidth="1.5" />
                      <circle cx="300" cy="112" r="30" fill="#e6e9e4" stroke="#b8c4ba" strokeWidth="1.5" />
                      <circle cx="236" cy="156" r="18" fill="#eef1ec" stroke="#b8c4ba" strokeWidth="1.5" />
                      <path d="M130 95 186 70M227 75 275 100M130 112l86 38M247 150l37-27" stroke="#9fb0a3" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="102" cy="102" r="4" fill="#173424" />
                      <circle cx="208" cy="62" r="4" fill="#173424" />
                      <circle cx="300" cy="112" r="4" fill="#173424" />
                      <circle cx="236" cy="156" r="4" fill="#173424" />
                    </svg>
                  </div>
                </div>
              </article>
              <article className="rounded-md bg-gradient-to-r from-[#122d1f] to-[#173424] p-6 text-white md:col-span-4 md:p-10">
                <div className="mb-5 text-[#ff9f78]">
                  <FeatureIcon name="clock" className="h-8 w-8" />
                </div>
                <h3 className="font-serif text-[2rem] leading-tight md:text-[2.45rem]">Temporal Tracking</h3>
                <p className="mt-3 text-base leading-relaxed text-white/85 md:text-[1.1rem]">
                  Context that moves with time. Cortexa tracks how your understanding of a topic evolves over weeks and years.
                </p>
              </article>
              {features.slice(2).map((feature) => (
                <article
                  key={feature.title}
                  className={`rounded-md border p-6 md:col-span-4 md:p-8 ${
                    feature.tone === "warm"
                      ? "border-[#8f4f38]/15 bg-[#efe9df]"
                      : feature.tone === "sand"
                        ? "border-[#173424]/8 bg-[#efe9df] md:col-span-12"
                        : "border-[#173424]/10 bg-white"
                  }`}
                >
                  <div className="mb-5 text-[#a15d42]">
                    <FeatureIcon name={feature.icon} className="h-7 w-7" />
                  </div>
                  <h3 className="font-serif text-[2rem] leading-tight text-[#173424] md:text-[2.35rem]">{feature.title}</h3>
                  <p className="mt-3 text-base leading-relaxed text-[#173424]/75 md:text-[1.1rem]">{feature.copy}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="about" className="py-12 md:py-20">
            <div className="rounded-md border border-[#173424]/10 bg-[#f0ebe2] p-5 md:p-12">
              <p className="text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8f4f38]">The canvas</p>
              <h2 className="mt-4 text-center font-serif text-[2.1rem] leading-tight text-[#173424] md:text-6xl">A spatial environment for complex thought.</h2>
              <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start lg:gap-8">
                <div className="rounded-md border border-[#173424]/10 bg-white p-4 md:p-6">
                  <div className="grid overflow-hidden rounded-md border border-[#173424]/10 md:grid-cols-[210px_1fr]">
                    <div className="border-b border-[#173424]/10 bg-[#faf8f2] p-4 md:border-b-0 md:border-r">
                      <div className="text-lg font-semibold text-[#173424]">cortexa</div>
                      <div className="mt-6 space-y-2 text-sm text-[#173424]/70">
                        <div className="flex items-center gap-2 rounded-sm bg-[#173424]/8 px-3 py-2 font-semibold text-[#173424]">
                          <FeatureIcon name="structure" className="h-4 w-4" /> Dashboard
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2"><FeatureIcon name="mapping" className="h-4 w-4" />Memories</div>
                        <div className="flex items-center gap-2 px-3 py-2"><FeatureIcon name="inbox" className="h-4 w-4" />Tunnels</div>
                        <div className="flex items-center gap-2 px-3 py-2"><FeatureIcon name="lock" className="h-4 w-4" />Profile</div>
                      </div>
                    </div>
                    <div className="bg-[#f9faf8] p-4 md:p-6">
                      <p className="text-xs uppercase tracking-widest text-[#173424]/50">Dashboard</p>
                      <p className="mt-1 text-xl font-semibold text-[#173424] md:text-2xl">Today in your memory</p>
                      <div className="mt-5 space-y-3 rounded-sm border border-[#173424]/10 bg-white p-4">
                        <div className="h-2 w-20 rounded bg-[#173424]/12" />
                        <div className="h-3 rounded bg-[#173424]/8" />
                        <div className="h-3 w-5/6 rounded bg-[#173424]/8" />
                        <div className="h-16 rounded bg-[#f4f1ea]" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-5 md:space-y-6">
                  <div>
                    <h4 className="flex items-center gap-2 font-serif text-[1.8rem] text-[#173424] md:text-3xl"><FeatureIcon name="structure" className="h-5 w-5 text-[#a15d42]" />Dashboard</h4>
                    <p className="mt-2 text-base leading-relaxed text-[#173424]/75 md:text-lg">Daily reflection and cognitive snapshots in one living feed.</p>
                  </div>
                  <div>
                    <h4 className="flex items-center gap-2 font-serif text-[1.8rem] text-[#173424] md:text-3xl"><FeatureIcon name="mapping" className="h-5 w-5 text-[#a15d42]" />Memories</h4>
                    <p className="mt-2 text-base leading-relaxed text-[#173424]/75 md:text-lg">Structured memory objects and semantic maps that keep context intact.</p>
                  </div>
                  <div>
                    <h4 className="flex items-center gap-2 font-serif text-[1.8rem] text-[#173424] md:text-3xl"><FeatureIcon name="inbox" className="h-5 w-5 text-[#a15d42]" />Tunnels</h4>
                    <p className="mt-2 text-base leading-relaxed text-[#173424]/75 md:text-lg">Ingestion endpoints that connect your tools and data streams securely.</p>
                  </div>
                  <div>
                    <h4 className="flex items-center gap-2 font-serif text-[1.8rem] text-[#173424] md:text-3xl"><FeatureIcon name="lock" className="h-5 w-5 text-[#a15d42]" />Profile</h4>
                    <p className="mt-2 text-base leading-relaxed text-[#173424]/75 md:text-lg">Pattern-level understanding of your thinking over time.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="py-12 md:py-20">
            <h2 className="text-center font-serif text-[2.2rem] text-[#173424] md:text-5xl">The Cognitive Cycle</h2>
            <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
              {steps.map((step, idx) => (
                <article key={step.title} className="rounded-md border border-[#173424]/10 bg-white p-6 text-center md:p-8">
                  <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border ${idx === 2 ? "bg-[#173424] text-white" : "border-[#173424]/20 text-[#173424]"}`}>
                    <FeatureIcon name={step.icon} className="h-6 w-6" />
                  </div>
                  <h3 className="font-serif text-[2rem] text-[#173424] md:text-3xl">{idx + 1}. {step.title}</h3>
                  <p className="mt-3 text-base text-[#173424]/75 md:text-lg">{step.copy}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="py-12 md:py-20">
            <blockquote className="mx-auto max-w-5xl text-center font-serif text-[2rem] italic leading-tight text-[#173424] md:text-6xl">
              &ldquo;Cortexa has fundamentally changed how I approach research. It is no longer about finding where I saved a file, but exploring how my thoughts evolve.&rdquo;
            </blockquote>
          </section>

          <section className="overflow-hidden rounded-md bg-gradient-to-r from-[#102c1d] via-[#173424] to-[#1f4a32] px-5 py-14 text-white md:px-10 md:py-20">
            <h2 className="mx-auto max-w-3xl text-center font-serif text-[2.35rem] leading-tight md:text-7xl">Ready to externalize your mind?</h2>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-sm bg-[#cf7348] px-7 py-3.5 [font-family:var(--font-manrope)] text-sm font-bold tracking-[-0.01em] !text-white transition hover:bg-[#b7653e]"
              >
                Get Started Today
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden>
                  <path d="M5 10h10m0 0-3.5-3.5M15 10l-3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <p className="text-sm text-white/70">No credit card required for 14-day trial.</p>
            </div>
          </section>
        </main>

        <footer className="mt-14 border-t border-[#173424]/10 py-10 text-sm text-[#173424]/70">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <div className="font-serif text-xl font-semibold text-[#173424]">Cortexa</div>
              <p className="mt-3">Designed for the intellectual architect.</p>
            </div>
            <div className="space-y-2">
              <div className="font-semibold uppercase tracking-wider text-[#173424]">Navigation</div>
              <a href="#product" className="block">Product</a>
              <a href="#features" className="block">Features</a>
              <a href="#about" className="block">About</a>
            </div>
            <div className="space-y-2">
              <div className="font-semibold uppercase tracking-wider text-[#173424]">Legal</div>
              <span className="block">Privacy Policy</span>
              <span className="block">Terms of Service</span>
            </div>
          </div>
          <p className="mt-10 text-xs text-[#173424]/50">© 2026 Cortexa. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
