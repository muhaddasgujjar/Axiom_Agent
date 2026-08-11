import type { ReactNode } from 'react';
import { Link } from 'wouter';
import AxiomLogo from '@/components/axiom-logo';
import SeoHead from '@/components/seo-head';

type DocumentPageProps = {
  title: string;
  path: string;
  updated: string;
  children: ReactNode;
};

export function DocumentPage({ title, path, updated, children }: DocumentPageProps) {
  return (
    <div className="min-h-[100dvh] w-full overflow-x-clip bg-[var(--bg-surface)] font-sans text-[var(--ink)]">
      <SeoHead title={`${title} · Axiom`} description="Axiom Research policies and documentation." path={path} />
      <header className="border-b border-[var(--line)]">
        <div className="mx-auto flex h-[68px] max-w-[1200px] items-center justify-between gap-3 px-5 sm:px-8">
          <Link href="/" aria-label="Axiom — home" className="inline-flex min-w-0 items-center">
            <AxiomLogo variant="light" />
          </Link>
          <Link
            href="/contact"
            className="hidden min-h-11 shrink-0 items-center rounded-lg border border-[var(--line)] bg-[var(--bg-elevated)] px-4 text-[13px] font-medium text-[var(--body)] transition hover:border-[var(--accent-mid)] md:inline-flex"
          >
            Contact
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-[820px] px-4 py-12 sm:px-8 sm:py-16">
        <p className="font-mono text-[9px] uppercase tracking-[.18em] text-[var(--muted)]">Axiom Research · {updated}</p>
        <h1 className="mt-3 font-serif text-3xl leading-none tracking-[-.04em] text-[var(--ink)] sm:text-4xl">{title}</h1>
        <div className="mt-8 space-y-5 text-[13px] leading-[1.75] text-[var(--body)]">{children}</div>
      </main>
      <footer className="border-t border-[var(--line)] py-6 text-center font-mono text-[9px] text-[var(--muted)]">
        © {new Date().getFullYear()} Axiom Research. All rights reserved.
      </footer>
    </div>
  );
}
