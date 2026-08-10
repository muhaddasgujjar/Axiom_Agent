import { useState, type FormEvent } from 'react';
import { Link } from 'wouter';
import { motion, MotionConfig } from 'framer-motion';
import { ArrowUpRight, Check, ChevronDown, Sparkles } from 'lucide-react';
import AxiomLogo from '@/components/axiom-logo';
import ThemeToggle from '@/components/theme-toggle';
import SeoHead from '@/components/seo-head';

const tiers = ['Researcher', 'Professional', 'Enterprise'];

const pitchPoints = [
  {
    title: 'Enterprise RAG integration',
    body: 'Index your private documents and internal data sources, then query them alongside the live web — in one auditable pipeline.',
  },
  {
    title: 'Custom AI research pipelines',
    body: 'Agents tuned to your domain: routing, scoping, and citation formats shaped around your team\u2019s workflow.',
  },
  {
    title: 'Dedicated, isolated infrastructure',
    body: 'Row-level tenant isolation with SLA-backed uptime and compliance review on every deployment.',
  },
];

const inputClass =
  'w-full rounded-xl border border-zinc-800 bg-transparent px-4 py-3 text-[13px] text-[var(--ink)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]';

const labelClass =
  'mb-1.5 block font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--muted)]';

type FormState = {
  name: string;
  email: string;
  company: string;
  tier: string;
  message: string;
};

const initialForm: FormState = { name: '', email: '', company: '', tier: '', message: '' };

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitted, setSubmitted] = useState(false);

  const update =
    (key: keyof FormState) =>
    (e: { target: { value: string } }) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-[100dvh] bg-[var(--bg-surface)] font-sans text-[var(--ink)]">
        <SeoHead
          title="Contact | Axiom Research"
          description="Talk to the Axiom team about enterprise RAG integration and custom AI research pipelines. Send a request and we'll respond within one business day."
          path="/contact"
        />
        <div className="grid min-h-[100dvh] lg:grid-cols-2">
          <motion.aside
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="relative flex flex-col justify-between overflow-hidden bg-[#1b3832] px-6 py-10 text-[#f3efe2] sm:px-12 lg:py-14"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-grid opacity-[0.05]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(1200px 500px at 85% -10%, rgba(94,194,124,0.12), transparent 60%)',
              }}
            />
            <div className="relative">
              <Link href="/" aria-label="Axiom — home" className="inline-flex items-center">
                <AxiomLogo variant="dark" />
              </Link>
            </div>

            <div className="relative mt-16 max-w-[520px] lg:mt-0">
              <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#a9b7a9]">
                <Sparkles size={13} strokeWidth={1.8} /> Let&apos;s talk
              </p>
              <h1 className="mt-5 font-serif text-[clamp(38px,5vw,58px)] leading-[1.02] tracking-[-0.04em] text-[#f3efe2]">
                Let&apos;s build your intelligence engine.
              </h1>
              <p className="mt-6 max-w-[440px] text-[14px] leading-[1.75] text-[#c2cdc2]">
                Tell us how your team does research today. We&apos;ll scope a deployment that
                brings your data and the live web into one auditable instrument.
              </p>

              <ul className="mt-10 space-y-6">
                {pitchPoints.map((point) => (
                  <li key={point.title} className="flex gap-4">
                    <div className="mt-1 grid size-7 shrink-0 place-items-center rounded-lg border border-[#3a5248] bg-[#243f38]">
                      <Check size={13} className="text-[#5ec27c]" strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="font-serif text-[17px] leading-tight tracking-[-0.01em] text-[#f3efe2]">
                        {point.title}
                      </p>
                      <p className="mt-1.5 text-[12.5px] leading-[1.6] text-[#c2cdc2]">
                        {point.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <p className="relative mt-14 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#a9b7a9]">
              <span className="size-2 rounded-full bg-[#5ec27c]" /> Responses within one business day
            </p>
          </motion.aside>

          <motion.main
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
            className="flex flex-col bg-[var(--bg-surface)]"
          >
            <div className="flex items-center justify-between px-6 pt-6 sm:px-12">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--muted)]">
                Axiom Research
              </p>
              <div className="flex items-center gap-2.5">
                <ThemeToggle />
                <Link
                  href="/"
                  className="inline-flex items-center rounded-lg px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)] transition hover:text-[var(--ink)]"
                >
                  Back to home
                </Link>
              </div>
            </div>

            <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-12">
              <div className="w-full max-w-[460px]">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="flex flex-col items-start"
                  >
                    <div className="grid size-12 place-items-center rounded-xl border border-zinc-800 bg-transparent text-[var(--accent)]">
                      <Check size={22} strokeWidth={2} />
                    </div>
                    <h2 className="mt-6 font-serif text-[30px] leading-tight tracking-[-0.03em] text-[var(--ink)]">
                      Request received
                    </h2>
                    <p className="mt-3 max-w-[360px] text-[13.5px] leading-[1.75] text-[var(--body)]">
                      Thanks{form.name ? `, ${form.name}` : ''}. Our team will reach out to
                      {form.email ? ` ${form.email}` : ' your inbox'} within one business day to
                      scope your {form.tier.toLowerCase() || 'workspace'} deployment.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setForm(initialForm);
                        setSubmitted(false);
                      }}
                      className="mt-8 inline-flex items-center gap-2 rounded-lg border border-zinc-800 px-4 py-2.5 text-[12px] font-medium text-[var(--ink)] transition hover:border-[var(--accent)]"
                    >
                      Send another request
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={onSubmit} noValidate={false}>
                    <h2 className="font-serif text-[26px] leading-tight tracking-[-0.03em] text-[var(--ink)]">
                      Tell us about your research workload.
                    </h2>
                    <p className="mt-2 text-[12.5px] leading-[1.6] text-[var(--body)]">
                      No sales scripts — just a scoping conversation with the team.
                    </p>

                    <div className="mt-8 space-y-5">
                      <div>
                        <label htmlFor="contact-name" className={labelClass}>
                          Full name
                        </label>
                        <input
                          id="contact-name"
                          name="name"
                          type="text"
                          required
                          autoComplete="name"
                          value={form.name}
                          onChange={update('name')}
                          placeholder="Ada Lovelace"
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label htmlFor="contact-email" className={labelClass}>
                          Work email
                        </label>
                        <input
                          id="contact-email"
                          name="email"
                          type="email"
                          required
                          autoComplete="email"
                          value={form.email}
                          onChange={update('email')}
                          placeholder="ada@yourcompany.com"
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label htmlFor="contact-company" className={labelClass}>
                          Company name
                        </label>
                        <input
                          id="contact-company"
                          name="company"
                          type="text"
                          required
                          autoComplete="organization"
                          value={form.company}
                          onChange={update('company')}
                          placeholder="Analytical Engine Ltd."
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label htmlFor="contact-tier" className={labelClass}>
                          Which tier are you interested in?
                        </label>
                        <div className="relative">
                          <select
                            id="contact-tier"
                            name="tier"
                            required
                            value={form.tier}
                            onChange={update('tier')}
                            className={`${inputClass} appearance-none pr-10 ${
                              form.tier === '' ? 'text-[var(--muted)]' : ''
                            }`}
                          >
                            <option value="" disabled>
                              Select a tier
                            </option>
                            {tiers.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={15}
                            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="contact-message" className={labelClass}>
                          Message / use case
                        </label>
                        <textarea
                          id="contact-message"
                          name="message"
                          rows={4}
                          required
                          value={form.message}
                          onChange={update('message')}
                          placeholder="What research questions does your team need answered?"
                          className={`${inputClass} resize-none`}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-3.5 text-[14px] font-semibold text-[var(--on-accent)] transition hover:bg-[var(--accent-strong)]"
                    >
                      Send Request <ArrowUpRight size={16} strokeWidth={2} />
                    </button>
                    <p className="mt-3 text-center font-mono text-[9px] text-[var(--muted)]">
                      We respond within one business day
                    </p>
                  </form>
                )}
              </div>
            </div>
          </motion.main>
        </div>
      </div>
    </MotionConfig>
  );
}
