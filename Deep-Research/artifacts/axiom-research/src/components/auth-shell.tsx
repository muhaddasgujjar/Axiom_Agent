import { ArrowLeft, Check, FlaskConical } from 'lucide-react';
import { Link } from 'wouter';
import type { ReactNode } from 'react';

const benefits = ['One source of truth for every query', 'Private, role-based workspace'];

export const authInputClass =
  'w-full rounded-lg border border-[var(--line-soft)] bg-[var(--bg-elevated)] px-3.5 py-2.5 text-[13px] text-[var(--ink)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30';

export function AuthField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-medium text-[var(--body)]">{label}</label>
      {children}
    </div>
  );
}

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen w-full grid lg:grid-cols-2 bg-[var(--bg-surface)] text-[var(--ink)]">
      <Link
        href="/"
        aria-label="Back to home"
        data-testid="link-back-home"
        className="absolute top-8 left-8 z-10 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-medium text-[var(--body)] transition hover:bg-[var(--bg-chip)] hover:text-[var(--ink)]"
      >
        <ArrowLeft size={15} strokeWidth={1.8} /> Back to Home
      </Link>
      <main className="flex flex-col items-center justify-center w-full min-h-screen px-8 py-12 relative">
        <div className="w-full max-w-[380px] mx-auto">{children}</div>
      </main>
      <aside className="hidden lg:flex flex-col items-center justify-center w-full min-h-screen bg-[#0a0f0d] relative p-12 overflow-hidden bg-[linear-gradient(to_right,rgba(27,56,50,0.35)_1px,transparent_1px),linear-gradient(to_bottom,rgba(27,56,50,0.35)_1px,transparent_1px)] bg-[size:24px_24px]">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-xl bg-[#2b6f64] text-[#f5f3eb]">
            <FlaskConical size={18} strokeWidth={1.7} />
          </div>
          <p className="font-serif text-xl tracking-[-.02em] text-white">Axiom Research</p>
        </div>
        <h2 className="mt-14 max-w-[420px] font-serif text-4xl leading-[1.1] tracking-[-.03em] text-white">
          Deep research, accelerated.
        </h2>
        <ul className="mt-10 space-y-4 text-[14px] leading-snug text-slate-300">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-3">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[#2b6f64] text-white">
                <Check size={12} strokeWidth={2.5} />
              </span>
              {benefit}
            </li>
          ))}
        </ul>
        <p className="mt-14 font-mono text-[9px] uppercase tracking-[.2em] text-slate-500">
          Research instrument
        </p>
      </aside>
    </div>
  );
}
