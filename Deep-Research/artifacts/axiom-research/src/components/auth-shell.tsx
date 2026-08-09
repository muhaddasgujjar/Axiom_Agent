import { Check, FlaskConical } from 'lucide-react';
import type { ReactNode } from 'react';

const benefits = ['One source of truth for every query', 'Private, role-based workspace'];

export const authInputClass =
  'w-full rounded-lg border border-[#d3d5cc] bg-white px-3.5 py-2.5 text-[13px] text-[#344b46] outline-none transition placeholder:text-[#a0a8a1] focus:border-[#83a99e] focus:ring-2 focus:ring-[#83a99e]/30';

export function AuthField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-medium text-[#52605b]">{label}</label>
      {children}
    </div>
  );
}

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-white text-[#1d2d2c] lg:flex-row">
      <main className="flex flex-1 flex-col justify-center px-8 py-12 sm:px-16">{children}</main>
      <aside className="relative hidden flex-1 flex-col justify-center overflow-hidden bg-slate-950 px-16 text-white lg:flex bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
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
