import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'wouter';
import {
  AnimatePresence,
  motion,
  MotionConfig,
  type MotionProps,
  type Variants,
} from 'framer-motion';
import {
  ArrowUpRight,
  BarChart3,
  BookOpen,
  BrainCircuit,
  Check,
  Database,
  Download,
  EyeOff,
  Globe2,
  Layers3,
  Link2,
  Loader2,
  LockKeyhole,
  Mail,
  Menu,
  Quote,
  Scale,
  Search,
  ServerCog,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import AxiomLogo from '@/components/axiom-logo';
import ThemeToggle from '@/components/theme-toggle';
import Footer from '@/components/footer';
import SeoHead, { SITE_DESCRIPTION, SITE_TITLE } from '@/components/seo-head';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { faqItems } from '@/lib/faq';
import { sendEmail } from '@/lib/email';

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

const heroKeywords = [
  'Autonomous AI Deep Research & Evidence Engine',
  'Autonomous AI Deep Research & Verified Research Agent',
  'Autonomous AI Deep Research & Market Intelligence Copilot',
  'Autonomous AI Deep Research & Citation-Backed Analyst',
];

function useTypewriter(phrases: string[]) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setText(phrases[0]);
      return;
    }
    const phrase = phrases[index % phrases.length];
    if (!deleting && text === phrase) {
      const t = window.setTimeout(() => setDeleting(true), 2100);
      return () => window.clearTimeout(t);
    }
    if (deleting && text === '') {
      const t = window.setTimeout(() => {
        setDeleting(false);
        setIndex((i) => (i + 1) % phrases.length);
      }, 500);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(
      () => setText(phrase.slice(0, text.length + (deleting ? -1 : 1))),
      deleting ? 24 : 45,
    );
    return () => window.clearTimeout(t);
  }, [text, deleting, index, phrases]);

  return text;
}

function TypedHeadline() {
  const typed = useTypewriter(heroKeywords);
  return (
    <span className="inline">
      {typed}
      <span
        aria-hidden="true"
        className="typed-caret ml-0.5 inline-block h-[0.9em] w-[3px] translate-y-[0.08em] rounded-full bg-[var(--accent)]"
      />
    </span>
  );
}

function ReportCard() {
  return (
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

function HeroTeaser() {
  const [query, setQuery] = useState('');
  const [phase, setPhase] = useState<'idle' | 'loading' | 'result'>('idle');
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [captured, setCaptured] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const timersRef = useRef<number[]>([]);
  const { toast } = useToast();

  useEffect(
    () => () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
    },
    [],
  );

  const runSearch = (e: FormEvent) => {
    e.preventDefault();
    if (phase === 'loading' || !query.trim()) return;
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
    setPhase('loading');
    setStep(0);
    timersRef.current.push(window.setTimeout(() => setStep(1), 650));
    timersRef.current.push(window.setTimeout(() => setStep(2), 1300));
    timersRef.current.push(
      window.setTimeout(() => setPhase('result'), 2000),
    );
  };

  const reset = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
    setPhase('idle');
    setStep(0);
    setQuery('');
    setEmail('');
    setCaptured(false);
  };

  const submitEmail = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isCapturing) return;
    setIsCapturing(true);
    try {
      await sendEmail(import.meta.env.VITE_EMAILJS_TEMPLATE_LEAD, {
        email,
        source: 'Hero Teaser',
        query,
      });
      setCaptured(true);
      toast({
        title:
          "Blueprint sent! Please check your spam folder if it doesn't arrive in 60 seconds.",
      });
    } catch {
      toast({
        title: 'Failed to send. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCapturing(false);
    }
  };

  const steps = [
    'Initializing LangGraph agents...',
    'Retrieving vectors...',
    'Streaming via Groq...',
  ];

  return (
    <div className="mx-auto mt-8 max-w-[640px]">
      <form onSubmit={runSearch} className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={15}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., What is the supply chain impact of TSMC's 2nm delay?"
            disabled={phase === 'loading'}
            className="w-full rounded-xl border border-[var(--line-soft)] bg-[var(--bg-elevated)] py-3 pl-11 pr-4 text-left text-[13px] text-[var(--ink)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
        <button
          type="submit"
          disabled={phase === 'loading'}
          className="inline-flex w-full min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-3 text-[13px] font-semibold text-[var(--on-accent)] transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {phase === 'loading' ? (
            <>
              <Loader2 size={15} className="animate-spin" /> Running…
            </>
          ) : (
            <>
              Run AI Deep Search <ArrowUpRight size={15} strokeWidth={2} />
            </>
          )}
        </button>
      </form>

      <div className="mt-3 min-h-[120px]">
        {phase === 'loading' && (
          <div className="rounded-xl border border-[var(--line-soft)] bg-[var(--bg-elevated)] p-4 text-left">
            {steps.map((label, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <div
                  key={label}
                  className={`flex items-center gap-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] ${
                    done
                      ? 'text-[var(--accent)]'
                      : active
                        ? 'text-[var(--ink)]'
                        : 'text-[var(--muted)]'
                  }`}
                >
                  {done ? (
                    <Check size={12} strokeWidth={2.5} />
                  ) : active ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <span className="size-3" />
                  )}
                  {label}
                </div>
              );
            })}
          </div>
        )}

        {phase === 'result' && (
          <div className="relative w-full overflow-hidden rounded-2xl">
            <div className="pointer-events-none select-none blur-[3px]">
              <ReportCard />
            </div>

            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md bg-background/60">
              <div className="relative w-full max-w-md rounded-2xl border border-[var(--line-soft)] bg-[var(--bg-elevated)] p-6 text-center shadow-[0_30px_70px_rgba(27,56,50,0.25)]">
                <button
                  type="button"
                  aria-label="Close"
                  onClick={reset}
                  className="absolute right-3 top-3 grid size-7 place-items-center rounded-md text-[var(--muted)] transition hover:bg-[var(--bg-chip)] hover:text-[var(--ink)]"
                >
                  <X size={13} strokeWidth={2.2} />
                </button>
                {captured ? (
                  <div>
                    <div className="mx-auto grid size-11 place-items-center rounded-full bg-[#e2ece3] text-[#2f6a4f] dark:bg-[#15211b] dark:text-[#8ccfb0]">
                      <Check size={20} strokeWidth={2.5} />
                    </div>
                    <p className="mt-4 font-serif text-[18px] tracking-[-0.01em] text-[var(--ink)]">
                      You&apos;re in.
                    </p>
                    <p className="mt-1.5 text-[12px] leading-[1.6] text-[var(--body)]">
                      The full citation-backed report is heading to {email}. Your 5 free daily runs
                      are ready.
                    </p>
                  </div>
                ) : (
                  <div>
                    <Mail size={18} className="mx-auto text-[var(--accent)]" />
                    <p className="mt-3 font-serif text-[18px] leading-snug tracking-[-0.01em] text-[var(--ink)]">
                      Unlock the full report
                    </p>
                    <p className="mt-2 text-[12px] leading-[1.6] text-[var(--body)]">
                      Enter your email to unlock the full citation-backed report and claim your 5
                      free daily runs.
                    </p>
                    <form
                      onSubmit={submitEmail}
                      className="mx-auto mt-4 flex w-full max-w-md flex-col items-center gap-3 sm:flex-row"
                    >
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full flex-1 rounded-md border border-zinc-700 bg-transparent px-4 py-2 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
                      />
                      <button
                        type="submit"
                        disabled={isCapturing}
                        className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-[var(--on-accent)] transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                      >
                        {isCapturing ? (
                          <>
                            <Loader2 size={14} className="animate-spin" /> Unlocking…
                          </>
                        ) : (
                          'Unlock Report'
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const trustItems = [
  { label: 'Groq', classes: 'font-mono text-[17px] font-semibold tracking-[0.05em]' },
  {
    label: 'LangChain',
    icon: Link2,
    classes: 'flex items-center gap-2 text-[17px] font-bold tracking-[-0.02em]',
  },
  { label: 'ChromaDB', classes: 'font-mono text-[15px] tracking-[0.02em]' },
  { label: 'PyTorch', classes: 'text-[17px] font-bold italic tracking-[-0.02em]' },
  { label: 'LangGraph', classes: 'font-mono text-[17px] font-semibold tracking-[0.05em]' },
  { label: 'Hugging Face', classes: 'font-mono text-[15px] tracking-[0.02em]' },
];

function TrustItem({ label, icon: Icon, classes }: (typeof trustItems)[number]) {
  return (
    <span className={`${classes} shrink-0 text-[var(--ink)]`}>
      {Icon ? <Icon size={15} strokeWidth={2} /> : null}
      {label}
    </span>
  );
}

function TrustStrip() {
  return (
    <section
      aria-label="Powered by enterprise-grade infrastructure"
      className="overflow-hidden border-t border-[var(--line)] bg-[var(--bg-surface)]"
    >
      <div className="mx-auto max-w-[1200px] px-5 py-12 sm:px-8 sm:py-16">
        <p className="text-center font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--muted)]">
          Powered by enterprise-grade infrastructure
        </p>
        <div className="mt-6">
          <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
            <div className="flex w-max animate-axiom-marquee items-center gap-x-12">
              {[...trustItems, ...trustItems, ...trustItems, ...trustItems].map(
                (item, i) => (
                  <TrustItem key={i} {...item} />
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const useCases = [
  {
    id: 'finance',
    label: 'Financial Analysis',
    icon: BarChart3,
    title: 'Q3 Tech Earnings & Supply Chain Forecast',
    summary:
      'Synthesized from earnings call transcripts, supplier disclosures, and analyst filings.',
    bullets: [
      'Margin compression across fabless leaders tracks closely with advanced-node pricing',
      'Supply chain inventories of AI accelerators remain near record lows entering Q3',
    ],
    tags: ['SEC filings', 'Earnings transcripts', '10-K disclosures'],
    confidence: 92,
  },
  {
    id: 'regulatory',
    label: 'Regulatory Review',
    icon: Scale,
    title: 'EU AI Act Compliance Mapping',
    summary: 'Provision-by-provision mapping of the AI Act against current system architecture.',
    bullets: [
      'High-risk obligations map to the governance layer, not the retrieval layer',
      'Transparency logging requirements are met by the existing claim-level audit trail',
    ],
    tags: ['EU AI Act', 'GDPR', 'ISO 42001'],
    confidence: 88,
  },
  {
    id: 'academic',
    label: 'Academic Synthesis',
    icon: BookOpen,
    title: 'Recent Advancements in Neural Vector Architectures',
    summary:
      'Distilled from recent preprints and peer-reviewed literature on retrieval at scale.',
    bullets: [
      'Sparse-dense hybrid retrieval narrows the gap between recall and latency',
      'Context-window compression techniques reduce retrieval cost without fidelity loss',
    ],
    tags: ['arXiv', 'NeurIPS', 'Nature Machine Intelligence'],
    confidence: 90,
  },
];

function UseCaseTabs() {
  const [activeId, setActiveId] = useState(useCases[0].id);
  const current = useCases.find((uc) => uc.id === activeId) ?? useCases[0];
  const ActiveIcon = current.icon;

  return (
    <motion.section
      id="usecases"
      aria-labelledby="usecases-heading"
      className="border-t border-[var(--line)] bg-[var(--bg-surface-soft)]"
      {...sectionMotion}
    >
      <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 sm:py-28">
        <div className="max-w-[680px]">
          <p className={eyebrow}>Precision workflows</p>
          <h2
            id="usecases-heading"
            className="mt-3 font-serif text-[clamp(34px,5vw,58px)] leading-[1.02] tracking-[-0.04em] text-[var(--ink)]"
          >
            Engineered for precision workflows.
          </h2>
          <p className="mt-4 max-w-[560px] text-[13.5px] leading-[1.7] text-[var(--body)]">
            One instrument, tuned to the research language of your industry — with the same
            claim-level evidence trail.
          </p>
        </div>

        <div role="tablist" aria-label="Industry use cases" className="mt-10 flex flex-wrap gap-2">
          {useCases.map((uc) => {
            const Icon = uc.icon;
            const selected = activeId === uc.id;
            return (
              <button
                key={uc.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveId(uc.id)}
                className={`relative inline-flex min-h-11 items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-medium transition-colors duration-300 ${
                  selected
                    ? 'text-[var(--ink)]'
                    : 'text-[var(--body)] hover:text-[var(--ink)]'
                }`}
              >
                {selected && (
                  <motion.span
                    layoutId="usecase-pill"
                    className="absolute inset-0 rounded-full border border-[var(--line-soft)] bg-[var(--bg-elevated)] shadow-[0_10px_30px_rgba(27,56,50,0.10)]"
                    transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                  />
                )}
                <Icon size={15} strokeWidth={1.8} className="relative" />
                <span className="relative">{uc.label}</span>
              </button>
            );
          })}
        </div>

        <motion.div layout className="mt-8">
          <AnimatePresence mode="wait">
            <motion.article
              key={current.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="rounded-2xl border border-[var(--line-soft)] bg-[var(--bg-elevated)] p-6 text-left shadow-[0_24px_60px_rgba(27,56,50,0.10)] sm:p-8"
            >
              <div className="flex flex-col gap-4 border-b border-[var(--line-soft)] pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--bg-chip)] text-[var(--accent)]">
                    <ActiveIcon size={19} strokeWidth={1.6} />
                  </div>
                  <div>
                    <p className={eyebrow}>{current.label}</p>
                    <p className="mt-1 font-serif text-[clamp(17px,3vw,21px)] leading-tight tracking-[-0.02em] text-[var(--ink)]">
                      {current.title}
                    </p>
                  </div>
                </div>
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#e2ece3] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-[#2f6a4f] dark:bg-[#15211b] dark:text-[#8ccfb0]">
                  <Check size={11} strokeWidth={2.5} /> Verified
                </span>
              </div>

              <p className="mt-5 text-[13px] leading-[1.75] text-[var(--body)]">
                {current.summary}
              </p>

              <ul className="mt-4 space-y-3 text-[13px] leading-[1.75] text-[var(--body)]">
                {current.bullets.map((bullet, i) => (
                  <li key={bullet}>
                    {bullet}
                    <a href="#usecases" className={citationBadge}>
                      [{i + 1}]
                    </a>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-[var(--line-soft)] pt-5">
                {current.tags.map((tag) => (
                  <span key={tag} className={sourceChip}>
                    {tag}
                  </span>
                ))}
                <div className="ml-auto flex items-center gap-3">
                  <div className="h-1.5 w-24 rounded-full bg-[var(--line-soft)]">
                    <div
                      className="h-full rounded-full bg-[var(--accent)]"
                      style={{ width: `${current.confidence}%` }}
                    />
                  </div>
                  <span className="font-mono text-[9px] text-[var(--muted)]">
                    {current.confidence}% claim confidence
                  </span>
                </div>
              </div>
            </motion.article>
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.section>
  );
}

function LeadMagnet() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sentTo, setSentTo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await sendEmail(import.meta.env.VITE_EMAILJS_TEMPLATE_LEAD, {
        email,
        source: 'Footer Lead Magnet',
      });
      setSentTo(email);
      setEmail('');
      setSubmitted(true);
      toast({
        title:
          "Blueprint sent! Please check your spam folder if it doesn't arrive in 60 seconds.",
      });
    } catch {
      toast({
        title: 'Failed to send. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.section
      id="blueprint"
      aria-labelledby="blueprint-heading"
      className="relative overflow-hidden border-t border-[#24362e] bg-[#1b3832] text-[#f3efe2]"
      {...sectionMotion}
    >
      <div
        aria-hidden="true"
        className="bg-grid absolute inset-0 opacity-[0.06] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,black,transparent)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(900px 400px at 50% -10%, rgba(94,194,124,0.14), transparent 60%)',
        }}
      />
      <div className="relative mx-auto max-w-[760px] px-5 py-20 text-center sm:px-8 sm:py-28">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl border border-[#3a5248] bg-[#243f38] text-[#5ec27c]">
          <Download size={20} strokeWidth={1.8} />
        </div>
        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-[#a9b7a9]">
          Free blueprint
        </p>
        <h2
          id="blueprint-heading"
          className="mx-auto mt-3 max-w-[560px] font-serif text-[clamp(34px,5vw,54px)] leading-[1.02] tracking-[-0.04em] text-[#f3efe2]"
        >
          Download the Architecture Blueprint.
        </h2>
        <p className="mx-auto mt-4 max-w-[560px] text-[13.5px] leading-[1.7] text-[#b9c3b4]">
          Discover how our multi-agent RAG pipeline eliminates AI hallucinations and maps
          claim-level citations.
        </p>

        {submitted ? (
          <div className="mx-auto mt-9 flex max-w-[480px] items-center justify-center gap-2.5 rounded-xl border border-[#3a5248] bg-[#243f38]/70 px-5 py-4">
            <Check size={16} className="shrink-0 text-[#5ec27c]" />
            <p className="text-[13px] text-[#f3efe2]">
              Check {sentTo} — the blueprint is on its way.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="mx-auto mt-9 flex max-w-[480px] flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Mail
                size={15}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8fa092]"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-xl border border-[#3a5248] bg-[#243f38] py-3 pl-11 pr-4 text-[13px] text-[#f3efe2] outline-none transition placeholder:text-[#8fa092] focus:border-[#5ec27c]"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full min-h-11 items-center justify-center gap-2 rounded-xl bg-[#f3efe2] px-6 py-3 text-[13.5px] font-semibold text-[#1b3832] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Sending…
                </>
              ) : (
                <>
                  Get the Blueprint <ArrowUpRight size={15} strokeWidth={2} />
                </>
              )}
            </button>
          </form>
        )}
        <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.16em] text-[#8fa092]">
          No spam · unsubscribe anytime
        </p>
      </div>
    </motion.section>
  );
}

export default function Landing() {
  const [isYearly, setIsYearly] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { toast } = useToast();
  const notifyComingSoon = () =>
    toast({ title: 'Payment integration coming soon.', description: 'This tier will be available for checkout shortly.' });
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-[100dvh] w-full overflow-x-clip bg-[var(--bg-surface)] font-sans text-[var(--ink)]">
        <SeoHead title={SITE_TITLE} description={SITE_DESCRIPTION} path="/" />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-[var(--accent)] focus:px-4 focus:py-2 focus:text-[var(--on-accent)]"
        >
          Skip to content
        </a>

        <header className="sticky top-0 z-50 border-b border-white/10 bg-background/90 backdrop-blur-md">
          <div className="mx-auto flex h-[68px] max-w-[1200px] items-center justify-between gap-3 px-5 sm:px-8">
            <Link href="/" aria-label="Axiom — home" className="inline-flex min-w-0 items-center">
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
            <div className="flex shrink-0 items-center gap-2.5">
              <ThemeToggle />
              <Link
                href="/login"
                className="hidden min-h-11 items-center rounded-lg px-4 text-[13px] font-medium text-[var(--ink)] transition hover:bg-[var(--bg-chip)] md:inline-flex"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="hidden min-h-11 items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 text-[13px] font-medium text-[var(--on-accent)] transition hover:bg-[var(--accent-strong)] md:inline-flex"
              >
                Open Workspace
              </Link>
              <button
                type="button"
                aria-label="Open menu"
                onClick={() => setMenuOpen(true)}
                className="grid size-11 shrink-0 place-items-center rounded-lg text-[var(--body)] transition hover:bg-[var(--bg-chip)] md:hidden"
              >
                <Menu size={20} strokeWidth={1.8} />
              </button>
            </div>
          </div>

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetContent side="right" className="border-l border-[var(--line)] bg-[var(--bg-surface)] text-[var(--ink)] sm:max-w-sm">
              <SheetHeader className="items-start">
                <SheetTitle className="sr-only">Navigation menu</SheetTitle>
                <Link
                  href="/"
                  aria-label="Axiom — home"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex items-center"
                >
                  <AxiomLogo variant="light" />
                </Link>
              </SheetHeader>
              <nav aria-label="Primary mobile" className="mt-8 flex flex-col gap-1">
                <a href="#systems" onClick={() => setMenuOpen(false)} className="flex min-h-11 items-center rounded-lg px-3 text-[13px] font-medium text-[var(--body)] transition hover:bg-[var(--bg-chip)] hover:text-[var(--ink)]">Systems</a>
                <a href="#security" onClick={() => setMenuOpen(false)} className="flex min-h-11 items-center rounded-lg px-3 text-[13px] font-medium text-[var(--body)] transition hover:bg-[var(--bg-chip)] hover:text-[var(--ink)]">Security</a>
                <a href="#faq" onClick={() => setMenuOpen(false)} className="flex min-h-11 items-center rounded-lg px-3 text-[13px] font-medium text-[var(--body)] transition hover:bg-[var(--bg-chip)] hover:text-[var(--ink)]">FAQ</a>
                <a href="#pricing" onClick={() => setMenuOpen(false)} className="flex min-h-11 items-center rounded-lg px-3 text-[13px] font-medium text-[var(--body)] transition hover:bg-[var(--bg-chip)] hover:text-[var(--ink)]">Pricing</a>
                <Link href="/contact" onClick={() => setMenuOpen(false)} className="flex min-h-11 items-center rounded-lg px-3 text-[13px] font-medium text-[var(--body)] transition hover:bg-[var(--bg-chip)] hover:text-[var(--ink)]">Contact</Link>
              </nav>
              <div className="mt-10 space-y-2.5 border-t border-[var(--line)] pt-6">
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-11 w-full items-center justify-center rounded-lg px-4 text-[13px] font-medium text-[var(--ink)] transition hover:bg-[var(--bg-chip)]"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-11 w-full items-center justify-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 text-[13px] font-medium text-[var(--on-accent)] transition hover:bg-[var(--accent-strong)]"
                >
                  Open Workspace
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </header>

        <main id="main">
          <motion.section
            className="relative flex min-h-[calc(100svh-68px)] items-center overflow-hidden"
            {...sectionMotion}
          >
            <div
              aria-hidden="true"
              className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,black,transparent)]"
            />
            <div className="relative mx-auto w-full max-w-[1200px] px-5 py-20 text-center sm:px-8 sm:py-24">
              <p className={`${eyebrow} mx-auto`}>Research instrument · enterprise AI deep research</p>
              <h1 className="mx-auto mt-5 max-w-[840px] font-serif text-3xl leading-[1.05] tracking-[-0.04em] text-[var(--ink)] sm:text-5xl md:text-6xl">
                <span className="sr-only">
                  Autonomous AI Deep Research &amp; Evidence Engine
                </span>
                <TypedHeadline />
              </h1>
              <p className="mx-auto mt-6 max-w-[640px] text-[15px] leading-[1.7] text-[var(--body)]">
                Axiom turns complex research questions into defensible, citation-backed reports.
                Powered by multi-agent web scraping and vector retrieval.
              </p>
              <HeroTeaser />
              <p className="mt-4 font-mono text-[10px] text-[var(--muted)]">
                No credit card · 5 deep reports / day · quota resets every 24h UTC
              </p>
            </div>
          </motion.section>

          <UseCaseTabs />

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

          <TrustStrip />

          <LeadMagnet />
        </main>

        <Footer />
      </div>
    </MotionConfig>
  );
}
