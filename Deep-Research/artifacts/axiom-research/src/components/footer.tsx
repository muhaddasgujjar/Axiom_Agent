import { useState, type ReactNode } from 'react';
import { Link } from 'wouter';
import AxiomLogo from '@/components/axiom-logo';
import { useToast } from '@/hooks/use-toast';
import { ArrowUpRight, Check, Copy, Mail } from 'lucide-react';

const CONTACT_EMAIL = 'muhaddas.workspace@gmail.com';

type FooterLinkItem = { label: string; href: string };

const PLATFORM_LINKS: FooterLinkItem[] = [
  { label: 'Workspace', href: '/workspace' },
  { label: 'Architecture Blueprint', href: '/docs' },
  { label: 'Multi-Agent Graph', href: '#systems' },
  { label: 'LPU Performance', href: '#systems' },
  { label: 'Benchmark Data', href: '#pricing' },
];

const RESOURCE_LINKS: FooterLinkItem[] = [
  { label: 'Documentation', href: '/docs' },
  { label: 'API Reference', href: '/docs' },
  { label: 'Research Paper PDF', href: '#blueprint' },
  { label: 'System Architecture', href: '#systems' },
];

const COMPANY_LINKS: FooterLinkItem[] = [
  { label: 'Contact Us', href: '/contact' },
  { label: 'Enterprise Sales', href: '/contact' },
  { label: 'Security & Tenant Isolation', href: '#security' },
  { label: 'Status Page', href: '#main' },
];

const LEGAL_LINKS: FooterLinkItem[] = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Acceptable Use', href: '/terms' },
  { label: 'Data Retention', href: '/privacy' },
];

const SOCIALS: { name: string; href: string; path: string }[] = [
  {
    name: 'GitHub',
    href: 'https://github.com',
    path: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
  },
  {
    name: 'X (Twitter)',
    href: 'https://x.com',
    path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  },
  {
    name: 'Discord',
    href: 'https://discord.com',
    path: 'M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.058a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.873-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.009c.12.099.246.198.373.292a.077.077 0 0 1-.006.128 12.299 12.299 0 0 1-1.873.891.077.077 0 0 0-.041.107c.36.698.772 1.363 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z',
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com',
    path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z',
  },
];

function FooterLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  if (href.startsWith('/')) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={className} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

function FooterCol({ title, links }: { title: string; links: FooterLinkItem[] }) {
  return (
    <div>
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500">{title}</p>
      <ul className="mt-4 space-y-0.5">
        {links.map((link) => (
          <li key={link.label}>
            <FooterLink
              href={link.href}
              className="flex min-h-[44px] items-center text-[13px] text-slate-400 transition-colors hover:text-white"
            >
              {link.label}
            </FooterLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(true);
      toast({ title: 'Email address copied to clipboard.' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Could not copy automatically.', variant: 'destructive' });
    }
  };

  return (
    <footer className="relative w-full overflow-hidden bg-[#0b0f0d] text-slate-400">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 select-none overflow-hidden"
      >
        <p className="translate-y-[38%] whitespace-nowrap text-center text-6xl font-extrabold tracking-tighter text-slate-50 opacity-10 md:text-9xl">
          AXIOM RESEARCH
        </p>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-10">
        <div className="flex justify-center pt-8 sm:justify-start sm:pt-10">
          <span className="inline-flex items-center gap-2.5 rounded-full border border-[#22312a] bg-[#111812] px-4 py-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#5ec27c] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#5ec27c]" />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-300">
              Groq LPU Engine • All Systems Operational
            </span>
          </span>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-[#243a30] bg-gradient-to-br from-[#1b3832] via-[#14251f] to-[#0e1713]">
          <div className="flex flex-col gap-8 p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-[500px]">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#b98a4d]">
                Deploy Axiom inside your org
              </p>
              <h2 className="mt-3 font-serif text-[clamp(26px,4vw,38px)] leading-[1.05] tracking-[-0.03em] text-[#f3efe2]">
                Run your next deep research run today.
              </h2>
              <p className="mt-3 text-[13.5px] leading-[1.7] text-[#b9c3b4]">
                Enterprise agents, verified citations, and a defensible evidence trail — built for
                research teams that need answers they can stand behind.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#f3efe2] px-5 text-[13px] font-semibold text-[#1b3832] transition hover:bg-white"
                >
                  <Mail size={15} strokeWidth={2} />
                  Email the team
                </a>
                <button
                  type="button"
                  onClick={copyEmail}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[#3a5248] bg-[#243f38]/70 px-5 font-mono text-[12px] text-[#f3efe2] transition hover:border-[#5ec27c] hover:bg-[#2f4a41]"
                >
                  {copied ? (
                    <Check size={15} className="text-[#5ec27c]" />
                  ) : (
                    <Copy size={15} className="text-[#b9c3b4]" />
                  )}
                  {copied ? 'Copied!' : CONTACT_EMAIL}
                </button>
              </div>
            </div>
            <a
              href="#blueprint"
              className="group inline-flex w-fit shrink-0 items-center gap-2 rounded-xl border border-[#3a5248] bg-[#243f38] px-5 py-3 text-[13px] font-semibold text-[#f3efe2] transition hover:border-[#5ec27c] hover:bg-[#2f4a41]"
            >
              Get the blueprint
              <ArrowUpRight
                size={16}
                strokeWidth={2}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 pb-16 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <Link href="/" aria-label="Axiom — home" className="inline-flex items-center">
              <AxiomLogo variant="dark" />
            </Link>
            <p className="mt-4 text-[12.5px] leading-[1.7] text-slate-400">
              Deterministic, citation-grounded research powered by multi-agent graph topologies.
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-2 inline-flex min-h-[44px] items-center gap-2 text-[12px] text-slate-400 transition-colors hover:text-white"
            >
              <Mail size={14} className="shrink-0" />
              {CONTACT_EMAIL}
            </a>
          </div>
          <FooterCol title="Platform" links={PLATFORM_LINKS} />
          <FooterCol title="Resources" links={RESOURCE_LINKS} />
          <FooterCol title="Company & Contact" links={COMPANY_LINKS} />
          <FooterCol title="Legal" links={LEGAL_LINKS} />
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-[#1c251f] py-8 sm:flex-row">
          <p className="text-center font-mono text-[10px] text-slate-500">
            © 2026 Axiom Research Technologies Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            {SOCIALS.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                className="grid size-11 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden="true">
                  <path d={social.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
