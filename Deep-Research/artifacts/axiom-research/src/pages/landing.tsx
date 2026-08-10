import { useState } from 'react';
import { Link } from 'wouter';
import { motion, MotionConfig, type MotionProps, type Variants } from 'framer-motion';
import {
  ArrowUpRight,
  BrainCircuit,
  Check,
  Database,
  EyeOff,
  Globe2,
  Layers3,
  LockKeyhole,
  Quote,
  ServerCog,
  ShieldCheck,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import AxiomLogo from '@/components/axiom-logo';
import ThemeToggle from '@/components/theme-toggle';
import SeoHead, { SITE_DESCRIPTION, SITE_TITLE } from '@/components/seo-head';
import { useToast } from '@/hooks/use-toast';
import { faqItems } from '@/lib/faq';

const eyebrow = 'font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]';
const citationBadge =
  'ml-0.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded bg-[var(--bg-chip)] px-1 align-super font-mono text-[9px] leading-none text-[var(--ink)] no-underline transition hover:bg-[var(--line-soft)]';
const sourceChip =
  'inline-flex items-center gap-1.5 rounded-full border border-[var(--line-soft)] bg-[var(--bg-surface)] px-3 py-1 font-mono text-[9px] text-[var(--muted-2)] transition hover:border-[var(--accent)]';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const sectionMotion: MotionProps = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-100px' },
  transition: { duration: 0.6, ease: 'easeOut' },
};

function HeroVisual() {
  return (
    <div className="relative mx-auto mt-16 max-w-[920px]">
      <svg
        className="absolute -inset-8 h-[calc(100%+4rem)] w-[calc(100%+4rem)] text-[var(--ink)]"
        viewBox="0 0 920 460"
        fill="none"
        aria-hidden="true"
      >
        <g stroke="currentColor" strokeOpacity="0.22" strokeWidth="1">
          <line x1="60" y1="90" x2="460" y2="230" className="animate-axiom-glow" />
          <line x1="860" y1="80" x2="460" y2="230" className="animate-axiom-glow" />
          <line x1="80" y1="380" x2="460" y2="230" className="animate-axiom-glow" />
          <line x1="840" y1="390" x2="460" y2="230" className="animate-axiom-glow" />
        </g>
        <g fill="currentColor" fillOpacity="0.55">
          <circle cx="60" cy="90" r="3" className="animate-axiom-glow" />
          <circle cx="860" cy="80" r="3" className="animate-axiom-glow" />
          <circle cx="80" cy="380" r="3" className="animate-axiom-glow" />
          <circle cx="840" cy="390" r="3" className="animate-axiom-glow" />
        </g>
        <g fill="#b98a4d">
          <circle cx="320" cy="150" r="2.5" className="animate-axiom-glow" />
          <circle cx="600" cy="320" r="2.5" className="animate-axiom-glow" />
        </g>
      </svg>

      <div className="relative rounded-2xl border border-[var(--line-soft)] bg-[var(--bg-elevated)] p-5 text-left shadow-[0_30px_80px_rgba(27,56,50,0.14)] sm:p-7">
        <div className="flex flex-col gap-4 border-b border-[var(--line-soft)] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--bg-chip)] text-[var(--accent)]">
              <BrainCircuit size={19} strokeWidth={1.6} />
            </div>
            <div>
              <p className={`${eyebrow}`}>Deep research report</p>
              <p className="mt-1 font-serif text-[clamp(17px,3vw,21px)] leading-tight tracking-[-0.02em] text-[var(--ink)]">
                Supply-chain resilience in the semiconductor industry
              </p>
            </div>
          </div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#e2ece3] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-[#2f6a4f] dark:bg-[#15211b] dark:text-[#8ccfb0]">
            <Check size={11} strokeWidth={2.5} /> Verified
          </span>
        </div>

        <div className="mt-5 space-y-3 text-[13px] leading-[1.75] text-[var(--body)]">
          <p>
            Taiwanese fabs account for the majority of advanced-node capacity, making global output
            vulnerable to regional disruption
            <a href="#src-1" className={citationBadge}>[1]</a>.
          </p>
          <p>
            Inventory buffers of roughly six to eight weeks dampen short-term shocks but cannot
            absorb a multi-quarter outage
            <a href="#src-2" className={citationBadge}>[2]</a>.
          </p>
          <p>
            Dual-sourcing and regional fab expansion are emerging as the dominant resilience
            strategies through 2027
            <a href="#src-3" className={citationBadge}>[3]</a>.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-[var(--line-soft)] pt-5">
          <span className={`mr-1 ${eyebrow}`}>Verified sources</span>
          <a href="#src-1" id="src-1" className={sourceChip}>SIA.org — 2026 outlook</a>
          <a href="#src-2" id="src-2" className={sourceChip}>Nature Electronics</a>
          <a href="#src-3" id="src-3" className={sourceChip}>McKinsey Quarterly</a>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <div className="h-1.5 flex-1 rounded-full bg-[var(--line-soft)]">
            <div className="h-full w-[86%] rounded-full bg-[var(--accent)]" />
          </div>
          <span className="font-mono text-[9px] text-[var(--muted)]">86% claim confidence</span>
        </div>
      </div>
    </div>
  );
}

function NodeGraphVisual() {
  const satellites = [
    [60, 40],
    [270, 45],
    [285, 140],
    [70, 145],
  ];
  return (
    <svg viewBox="0 0 320 180" className="h-44 w-full text-[var(--ink)]" fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1" strokeDasharray="5 6" strokeOpacity="0.55">
        <path d="M160 90 L60 40" className="animate-axiom-dash" />
        <path d="M160 90 L270 45" className="animate-axiom-dash" />
        <path d="M160 90 L285 140" className="animate-axiom-dash" />
        <path d="M160 90 L70 145" className="animate-axiom-dash" />
        <path d="M60 40 L270 45" className="animate-axiom-dash" />
        <path d="M270 45 L285 140" className="animate-axiom-dash" />
        <path d="M285 140 L70 145" className="animate-axiom-dash" />
        <path d="M70 145 L60 40" className="animate-axiom-dash" />
      </g>
      <circle cx="160" cy="90" r="17" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.5" />
      <circle cx="160" cy="90" r="4.5" fill="currentColor" className="animate-axiom-glow" />
      {satellites.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="3.5" fill="currentColor" className="animate-axiom-glow" />
      ))}
    </svg>
  );
}

function Chunk({ width }: { width: string }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-md border border-[var(--line-soft)] bg-[var(--bg-chip)] px-2.5 py-1.5 ${width}`}
    >
      <span className="size-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
      <span className="h-1 w-9 rounded-full bg-[var(--muted)]" />
    </div>
  );
}

function VectorStreamVisual() {
  return (
    <div className="flex h-44 items-center justify-center gap-4">
      <div className="flex shrink-0 flex-col gap-2">
        <Chunk width="w-20" />
        <Chunk width="w-28" />
        <Chunk width="w-24" />
      </div>
      <svg viewBox="0 0 80 180" className="h-36 w-16 shrink-0 text-[var(--ink)]" fill="none" aria-hidden="true">
        <g stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.4" strokeDasharray="3 5">
          <path d="M4 30 C 40 60, 40 90, 76 90" className="animate-axiom-dash" />
          <path d="M4 90 L 76 90" className="animate-axiom-dash" />
          <path d="M4 150 C 40 120, 40 90, 76 90" className="animate-axiom-dash" />
        </g>
      </svg>
      <div className="grid shrink-0 grid-cols-2 gap-2">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className="size-4 rounded-full bg-[var(--accent)] animate-axiom-glow"
            style={{ animationDelay: `${i * 0.35}s` }}
          />
        ))}
      </div>
    </div>
  );
}

function CitationCardVisual() {
  return (
    <div className="flex h-44 flex-col justify-center rounded-xl border border-[var(--line-soft)] bg-[var(--bg-elevated)] p-5">
      <p className="text-[11.5px] leading-[1.75] text-[var(--body)]">
        Each synthesized claim is mapped back to its source passage
        <a href="#faq" className={citationBadge}>[1]</a>, attributed at claim level
        <a href="#faq" className={citationBadge}>[2]</a>, and cited inline for audit
        <a href="#faq" className={citationBadge}>[3]</a>.
      </p>
      <div className="mt-4 flex items-center gap-2 border-t border-[var(--line-soft)] pt-3">
        <ShieldCheck size={14} className="text-[var(--accent)]" />
        <span className="font-mono text-[9px] text-[var(--muted)]">
          Claim-level attribution · 3 of 3 citations verified
        </span>
      </div>
    </div>
  );
}

type SystemCard = {
  index: string;
  title: string;
  body: string;
  keywords: string[];
  visual: () => React.ReactNode;
};

const systemCards: SystemCard[] = [
  {
    index: '01',
    title: 'Multi-Agent Deep Web Exploration',
    body: 'Six LangGraph-orchestrated specialists — planner, source hunter, deep reader, synthesizer, verifier, and formatter — expand across domains, scraping and reading full documents in real time instead of settling for snippets.',
    keywords: ['Autonomous scraping', 'Real-time web extraction', 'LangGraph orchestration'],
    visual: NodeGraphVisual,
  },
  {
    index: '02',
    title: 'Neural Vector Evidence Indexing',
    body: 'Every source is chunked and embedded into a ChromaDB vector store, then retrieved through semantic search — with context-window optimization that feeds the synthesizer only the most relevant passages.',
    keywords: ['ChromaDB vector storage', 'Semantic search', 'Context window optimization'],
    visual: VectorStreamVisual,
  },
  {
    index: '03',
    title: 'Verifiable Citation Synthesis & Claim-Level Attribution',
    body: 'A natural-language verification pass scores every claim against the exact source passages it was derived from. Unsupported claims are revised or removed before publication, and every surviving claim carries an inline citation for audit.',
    keywords: ['Claim-level attribution', 'Source verification', 'Citation-backed synthesis'],
    visual: CitationCardVisual,
  },
];

function BentoFeature({
  icon: Icon,
  title,
  body,
  span = '',
  meta,
}: {
  icon: typeof Database;
  title: string;
  body: string;
  span?: string;
  meta?: string;
}) {
  return (
    <motion.article
      variants={fadeUp}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      className={`glow-hover flex flex-col justify-between rounded-2xl border border-[var(--line-soft)] bg-[var(--bg-elevated)] p-6 ${span}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--bg-chip)] text-[var(--accent)]">
          <Icon size={18} strokeWidth={1.6} />
        </div>
        {meta && (
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--muted)]">
            {meta}
          </span>
        )}
      </div>
      <div className="mt-6">
        <h3 className="text-[15px] font-semibold text-[var(--ink)]">{title}</h3>
        <p className="mt-1.5 text-[12.5px] leading-[1.65] text-[var(--body)]">{body}</p>
      </div>
    </motion.article>
  );
}

export default function Landing() {
  const [isYearly, setIsYearly] = useState(false);
  const { toast } = useToast();
  const notifyComingSoon = () =>
    toast({ title: 'Payment integration coming soon.', description: 'This tier will be available for checkout shortly.' });
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-[100dvh] bg-[var(--bg-surface)] font-sans text-[var(--ink)]">
        <SeoHead title={SITE_TITLE} description={SITE_DESCRIPTION} path="/" />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-[var(--accent)] focus:px-4 focus:py-2 focus:text-[var(--on-accent)]"
        >
          Skip to content
        </a>

        <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--bg-surface)]/90 backdrop-blur">
          <div className="mx-auto flex h-[68px] max-w-[1200px] items-center justify-between px-5 sm:px-8">
            <Link href="/" aria-label="Axiom — home" className="inline-flex items-center">
              <AxiomLogo variant="light" />
            </Link>
            <nav
              aria-label="Primary"
              className="hidden items-center gap-8 text-[13px] font-medium text-[var(--body)] md:flex"
            >
              <a href="#systems" className="transition hover:text-[var(--ink)]">
                Systems
              </a>
              <a href="#security" className="transition hover:text-[var(--ink)]">
                Security
              </a>
              <a href="#faq" className="transition hover:text-[var(--ink)]">
                FAQ
              </a>
              <a href="#pricing" className="transition hover:text-[var(--ink)]">
                Pricing
              </a>
              <Link href="/contact" className="transition hover:text-[var(--ink)]">
                Contact
              </Link>
            </nav>
            <div className="flex items-center gap-2.5">
              <ThemeToggle />
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-[13px] font-medium text-[var(--ink)] transition hover:bg-[var(--bg-chip)]"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-[13px] font-medium text-[var(--on-accent)] transition hover:bg-[var(--accent-strong)]"
              >
                Open Workspace
              </Link>
            </div>
          </div>
        </header>

        <main id="main">
          <motion.section className="relative overflow-hidden" {...sectionMotion}>
            <div
              aria-hidden="true"
              className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,black,transparent)]"
            />
            <div className="relative mx-auto max-w-[1200px] px-5 pb-16 pt-16 text-center sm:px-8 sm:pb-24 sm:pt-24">
              <p className={`${eyebrow} mx-auto`}>Research instrument · enterprise AI deep research</p>
              <h1 className="mx-auto mt-5 max-w-[840px] font-serif text-[clamp(46px,8vw,92px)] leading-[0.94] tracking-[-0.05em] text-[var(--ink)]">
                Autonomous AI Deep Research &amp; Evidence Engine
              </h1>
              <p className="mx-auto mt-6 max-w-[640px] text-[15px] leading-[1.7] text-[var(--body)]">
                Axiom turns complex research questions into defensible, citation-backed reports.
                Powered by multi-agent web scraping and vector retrieval.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a
                  href="/register"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-3.5 text-[14px] font-semibold text-[var(--on-accent)] shadow-[0_14px_34px_rgba(27,56,50,0.28)] transition hover:bg-[var(--accent-strong)] sm:w-auto"
                >
                  Start 5 Free Daily Research Runs <ArrowUpRight size={16} strokeWidth={2} />
                </a>
                <a
                  href="#systems"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--line-soft)] bg-[var(--bg-elevated)] px-6 py-3.5 text-[14px] font-medium text-[var(--ink)] transition hover:border-[var(--accent)] sm:w-auto"
                >
                  Explore the systems
                </a>
              </div>
              <p className="mt-4 font-mono text-[10px] text-[var(--muted)]">
                No credit card · 5 deep reports / day · quota resets every 24h UTC
              </p>
              <HeroVisual />
            </div>
          </motion.section>

          <motion.section
            id="systems"
            aria-labelledby="systems-heading"
            className="border-t border-[var(--line)] bg-[var(--bg-surface)]"
            {...sectionMotion}
          >
            <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 sm:py-28">
              <div className="max-w-[680px]">
                <p className={eyebrow}>Core systems</p>
                <h2
                  id="systems-heading"
                  className="mt-3 font-serif text-[clamp(34px,5vw,58px)] leading-[1.02] tracking-[-0.04em] text-[var(--ink)]"
                >
                  Enterprise RAG Architecture &amp; Research Systems
                </h2>
                <p className="mt-4 max-w-[560px] text-[13.5px] leading-[1.7] text-[var(--body)]">
                  Axiom is not a single model — it is an orchestrated pipeline that explores, indexes,
                  synthesizes, and verifies before a single sentence is published.
                </p>
              </div>
              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-100px' }}
                className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3"
              >
                {systemCards.map(({ index, title, body, keywords, visual: Visual }) => (
                  <motion.article
                    key={index}
                    variants={fadeUp}
                    className="flex flex-col overflow-hidden rounded-2xl border border-[var(--line-soft)] bg-[var(--bg-elevated)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(27,56,50,0.12)]"
                  >
                    <div className="px-6 pt-6">
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
                        System {index}
                      </p>
                      <h3 className="mt-2 font-serif text-[24px] leading-[1.12] tracking-[-0.02em] text-[var(--ink)]">
                        {title}
                      </h3>
                    </div>
                    <div className="px-6 pt-4">
                      <Visual />
                    </div>
                    <p className="px-6 pt-4 text-[12.5px] leading-[1.65] text-[var(--body)]">{body}</p>
                    <div className="mt-auto flex flex-wrap gap-2 px-6 pb-6 pt-5">
                      {keywords.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-[var(--bg-chip)] px-2.5 py-1 font-mono text-[9px] text-[var(--muted-2)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.article>
                ))}
              </motion.div>
            </div>
          </motion.section>

          <motion.section
            id="security"
            aria-labelledby="security-heading"
            className="border-t border-[var(--line)] bg-[var(--bg-surface-soft)]"
            {...sectionMotion}
          >
            <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 sm:py-28">
              <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                <div className="max-w-[680px]">
                  <p className={eyebrow}>Security</p>
                  <h2
                    id="security-heading"
                    className="mt-3 font-serif text-[clamp(34px,5vw,56px)] leading-[1.02] tracking-[-0.04em] text-[var(--ink)]"
                  >
                    Multi-Tenant Data Isolation &amp; Privacy
                  </h2>
                  <p className="mt-4 max-w-[560px] text-[13.5px] leading-[1.7] text-[var(--body)]">
                    Your research is your own. Every source, report, and claim is scoped to your
                    workspace — and enforced at the database layer, not just the application.
                  </p>
                </div>
                <div className="flex w-fit items-center gap-3 rounded-xl border border-[var(--line-soft)] bg-[var(--bg-elevated)] px-5 py-4">
                  <Globe2 size={17} className="text-[var(--accent)]" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted-2)]">
                    Zero data leakage across user workspaces
                  </span>
                </div>
              </div>
              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-100px' }}
                className="mt-12 grid gap-4 md:grid-cols-3 md:grid-rows-2"
              >
                <BentoFeature
                  icon={Database}
                  span="md:col-span-2"
                  meta="Row-level security"
                  title="SQL row-level tenant filtering"
                  body="Every query is scoped by row-level security at the database. A user can only ever read and write rows belonging to their own tenant, making cross-tenant access structurally impossible."
                />
                <BentoFeature
                  icon={LockKeyhole}
                  meta="Encryption"
                  title="Encrypted storage & transport"
                  body="Reports, sources, and research history are encrypted in transit and at rest. Credentials and API tokens are never stored in plain text."
                />
                <BentoFeature
                  icon={EyeOff}
                  meta="Private by default"
                  title="Private-by-default workspaces"
                  body="Nothing you research is shared, indexed, or reused to train another user's context. Each workspace maintains an isolated, private evidence trail."
                />
                <BentoFeature
                  icon={ServerCog}
                  span="md:col-span-2"
                  meta="Enterprise boundary"
                  title="Enterprise-grade isolation"
                  body="Built on the same tenant-boundary model used by regulated industries — auditable, deterministic, and applied before any request reaches the model."
                />
              </motion.div>
            </div>
          </motion.section>

          <motion.section
            id="faq"
            aria-labelledby="faq-heading"
            className="border-t border-[var(--line)] bg-[var(--bg-surface)]"
            {...sectionMotion}
          >
            <div className="mx-auto max-w-[780px] px-5 py-20 sm:px-8 sm:py-28">
              <div className="text-center">
                <p className={eyebrow}>FAQ</p>
                <h2
                  id="faq-heading"
                  className="mt-3 font-serif text-[clamp(34px,5vw,56px)] leading-[1.02] tracking-[-0.04em] text-[var(--ink)]"
                >
                  Frequently Asked Questions
                </h2>
              </div>
              <Accordion type="single" collapsible className="mt-12 border-t border-[var(--line-soft)]">
                {faqItems.map((item) => (
                  <AccordionItem key={item.question} value={item.question} className="border-b border-[var(--line-soft)]">
                    <AccordionTrigger className="py-5 text-left font-serif text-[19px] tracking-[-0.01em] text-[var(--ink)] hover:no-underline">
                      <span className="flex-1 pr-4">{item.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-5 text-[13px] leading-[1.75] text-[var(--body)]">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </motion.section>

          <motion.section
            id="pricing"
            aria-labelledby="pricing-heading"
            className="border-t border-[#24362e] bg-[#1b3832] text-[#f3efe2]"
            {...sectionMotion}
          >
            <div className="mx-auto max-w-[1200px] px-5 py-20 text-center sm:px-8 sm:py-28">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#a9b7a9]">
                Plans &amp; access
              </p>
              <h2
                id="pricing-heading"
                className="mx-auto mt-3 max-w-[760px] font-serif text-[clamp(34px,5vw,58px)] leading-[1.02] tracking-[-0.04em] text-[#f3efe2]"
              >
                Accelerate Your Research Workflow Today
              </h2>
              <p className="mx-auto mt-4 max-w-[560px] text-[13.5px] leading-[1.7] text-[#b9c3b4]">
                Start on the free tier, then scale with dedicated agents. Transparent pricing,
                no surprise fees — upgrade whenever you're ready.
              </p>
              <div className="mt-10 flex justify-center">
                <div
                  role="tablist"
                  aria-label="Billing period"
                  className="inline-flex items-center rounded-full border border-[#3a5248] bg-[#243f38] p-1"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={!isYearly}
                    onClick={() => setIsYearly(false)}
                    className={`rounded-full px-5 py-2 text-[12px] font-medium transition-all duration-300 ${
                      !isYearly
                        ? 'bg-[#f3efe2] text-[#1b3832] shadow-[0_2px_8px_rgba(0,0,0,0.25)]'
                        : 'text-[#c2cdc2] hover:text-[#f3efe2]'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={isYearly}
                    onClick={() => setIsYearly(true)}
                    className={`flex items-center gap-2 rounded-full px-5 py-2 text-[12px] font-medium transition-all duration-300 ${
                      isYearly
                        ? 'bg-[#f3efe2] text-[#1b3832] shadow-[0_2px_8px_rgba(0,0,0,0.25)]'
                        : 'text-[#c2cdc2] hover:text-[#f3efe2]'
                    }`}
                  >
                    Yearly
                    <span
                      className={`rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] transition-colors duration-300 ${
                        isYearly ? 'bg-[#2f4a41] text-[#5ec27c]' : 'bg-[#2f4a41] text-[#5ec27c]'
                      }`}
                    >
                      Save 20%
                    </span>
                  </button>
                </div>
              </div>
              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-100px' }}
                className="mx-auto mt-12 grid max-w-[1100px] gap-6 text-left md:grid-cols-3"
              >
                <motion.div
                  variants={fadeUp}
                  className="flex flex-col rounded-2xl border border-[#3a5248] bg-[#243f38] p-8"
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#a9b7a9]">
                    Tier 01
                  </p>
                  <h3 className="mt-4 font-serif text-[28px] leading-tight tracking-[-0.02em] text-[#f3efe2]">
                    Researcher
                  </h3>
                  <div className="mt-5 flex items-baseline gap-1.5">
                    <motion.span
                      key="$0"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="font-serif text-[38px] leading-none tracking-[-0.03em] text-[#f3efe2]"
                    >
                      $0
                    </motion.span>
                    <span className="font-sans text-[11px] text-[#a9b7a9]">/ month</span>
                  </div>
                  <p className="mt-4 text-[12.5px] leading-[1.65] text-[#c2cdc2]">
                    For individual analysts validating the instrument on live questions.
                  </p>
                  <ul className="mt-6 space-y-2.5 text-[12.5px] leading-[1.6] text-[#c2cdc2]">
                    <li className="flex gap-2.5">
                      <Check size={14} className="mt-0.5 shrink-0 text-[#5ec27c]" /> 5 daily research reports
                    </li>
                    <li className="flex gap-2.5">
                      <Check size={14} className="mt-0.5 shrink-0 text-[#5ec27c]" /> Standard vector indexing
                    </li>
                    <li className="flex gap-2.5">
                      <Check size={14} className="mt-0.5 shrink-0 text-[#5ec27c]" /> Community support
                    </li>
                  </ul>
                  <button
                    type="button"
                    onClick={notifyComingSoon}
                    className="mt-8 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#4a6056] bg-transparent px-5 py-3.5 text-[13.5px] font-semibold text-[#f3efe2] transition hover:border-[#5ec27c] hover:bg-[#2f4a41]"
                  >
                    Request Access <ArrowUpRight size={16} strokeWidth={2} />
                  </button>
                </motion.div>

                <motion.div
                  variants={fadeUp}
                  className="relative flex flex-col rounded-2xl border border-[#3a5248] bg-[#26473e] p-8 ring-1 ring-emerald-700 shadow-[0_0_50px_rgba(16,185,129,0.18)]"
                >
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#5ec27c] px-3.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-[#0d1f16]">
                    Most popular
                  </span>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#a9b7a9]">
                    Tier 02
                  </p>
                  <h3 className="mt-4 font-serif text-[28px] leading-tight tracking-[-0.02em] text-[#f3efe2]">
                    Professional
                  </h3>
                  <div className="mt-5 flex items-baseline gap-1.5">
                    <motion.span
                      key={isYearly ? '$240' : '$25'}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="font-serif text-[38px] leading-none tracking-[-0.03em] text-[#f3efe2]"
                    >
                      {isYearly ? '$240' : '$25'}
                    </motion.span>
                    <span className="font-sans text-[11px] text-[#a9b7a9]">
                      {isYearly ? '/ year' : '/ month'}
                    </span>
                  </div>
                  <p className="mt-4 text-[12.5px] leading-[1.65] text-[#c2cdc2]">
                    For teams running sustained research pipelines with priority throughput.
                  </p>
                  <ul className="mt-6 space-y-2.5 text-[12.5px] leading-[1.6] text-[#c2cdc2]">
                    <li className="flex gap-2.5">
                      <Check size={14} className="mt-0.5 shrink-0 text-[#5ec27c]" /> Unlimited reports
                    </li>
                    <li className="flex gap-2.5">
                      <Check size={14} className="mt-0.5 shrink-0 text-[#5ec27c]" /> RAG pipeline tuning
                    </li>
                    <li className="flex gap-2.5">
                      <Check size={14} className="mt-0.5 shrink-0 text-[#5ec27c]" /> Priority indexing
                    </li>
                  </ul>
                  <button
                    type="button"
                    onClick={notifyComingSoon}
                    className="mt-8 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#f3efe2] px-5 py-3.5 text-[13.5px] font-semibold text-[#1b3832] transition hover:bg-white"
                  >
                    Book Workspace <ArrowUpRight size={16} strokeWidth={2} />
                  </button>
                </motion.div>

                <motion.div
                  variants={fadeUp}
                  className="flex flex-col rounded-2xl border border-[#3a5248] bg-[#243f38] p-8"
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#a9b7a9]">
                    Tier 03
                  </p>
                  <h3 className="mt-4 font-serif text-[28px] leading-tight tracking-[-0.02em] text-[#f3efe2]">
                    Enterprise
                  </h3>
                  <div className="mt-5 flex items-baseline gap-1.5">
                    <motion.span
                      key={isYearly ? '$1680' : '$175'}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="font-serif text-[38px] leading-none tracking-[-0.03em] text-[#f3efe2]"
                    >
                      {isYearly ? '$1680' : '$175'}
                    </motion.span>
                    <span className="font-sans text-[11px] text-[#a9b7a9]">
                      {isYearly ? '/ year' : '/ month'}
                    </span>
                  </div>
                  <p className="mt-4 text-[12.5px] leading-[1.65] text-[#c2cdc2]">
                    For organizations with compliance, isolation, and SLA requirements.
                  </p>
                  <ul className="mt-6 space-y-2.5 text-[12.5px] leading-[1.6] text-[#c2cdc2]">
                    <li className="flex gap-2.5">
                      <Check size={14} className="mt-0.5 shrink-0 text-[#5ec27c]" /> Custom model routing
                    </li>
                    <li className="flex gap-2.5">
                      <Check size={14} className="mt-0.5 shrink-0 text-[#5ec27c]" /> Dedicated database tenant
                    </li>
                    <li className="flex gap-2.5">
                      <Check size={14} className="mt-0.5 shrink-0 text-[#5ec27c]" /> SLA support
                    </li>
                  </ul>
                  <button
                    type="button"
                    onClick={notifyComingSoon}
                    className="mt-8 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#4a6056] bg-transparent px-5 py-3.5 text-[13.5px] font-semibold text-[#f3efe2] transition hover:border-[#5ec27c] hover:bg-[#2f4a41]"
                  >
                    Contact Sales <ArrowUpRight size={16} strokeWidth={2} />
                  </button>
                </motion.div>
              </motion.div>
              <div className="mx-auto mt-8 flex max-w-[520px] items-start gap-3 rounded-xl border border-[#3a5248] bg-[#243f38]/60 p-4 text-left">
                <Quote size={15} className="mt-0.5 shrink-0 text-[#b98a4d]" />
                <p className="text-[12px] leading-[1.65] text-[#c2cdc2]">
                  <em className="font-serif text-[14px] text-[#f3efe2]">
                    “The evidence trail Axiom leaves behind is what makes the difference.”
                  </em>
                </p>
              </div>
            </div>
          </motion.section>
        </main>

        <footer className="bg-[#111812] text-[#b9c3b4]">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-10 px-5 py-14 sm:px-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-[300px]">
              <Link href="/" aria-label="Axiom — home" className="inline-flex items-center">
                <AxiomLogo variant="dark" />
              </Link>
              <p className="mt-4 text-[12px] leading-[1.6] text-[#8b9989]">
                Autonomous deep research with verified, citation-backed evidence.
              </p>
            </div>
            <nav aria-label="Legal" className="flex flex-wrap gap-x-12 gap-y-6">
              <div className="space-y-3">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#64756a]">
                  Legal
                </p>
                <Link href="/privacy" className="block text-[12px] transition hover:text-[#f3efe2]">
                  Privacy policy
                </Link>
                <Link href="/terms" className="block text-[12px] transition hover:text-[#f3efe2]">
                  Terms of service
                </Link>
              </div>
              <div className="space-y-3">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#64756a]">
                  Product
                </p>
                <Link href="/docs" className="block text-[12px] transition hover:text-[#f3efe2]">
                  Documentation
                </Link>
                <Link href="/contact" className="block text-[12px] transition hover:text-[#f3efe2]">
                  Book a consultation
                </Link>
                <a href="#systems" className="block text-[12px] transition hover:text-[#f3efe2]">
                  How it works
                </a>
              </div>
            </nav>
            <div className="flex w-fit items-center gap-2.5 rounded-full border border-[#2a352d] bg-[#161e18] px-4 py-2">
              <span className="size-2 animate-pulse rounded-full bg-[#5ec27c]" />
              <span className="font-mono text-[10px] text-[#b9c3b4]">All systems operational</span>
            </div>
          </div>
          <div className="border-t border-[#222b24] py-5 text-center font-mono text-[9px] text-[#5c6b5d]">
            © {new Date().getFullYear()} Axiom Research. All rights reserved.
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}
