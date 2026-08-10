type AxiomLogoProps = {
  variant?: 'light' | 'dark';
  showSubtitle?: boolean;
  className?: string;
  titleClassName?: string;
};

export default function AxiomLogo({
  variant = 'light',
  showSubtitle = true,
  className = '',
  titleClassName = '',
}: AxiomLogoProps) {
  const dark = variant === 'dark';
  const titleColor = dark ? 'text-[#f3efe2]' : 'text-[var(--ink)]';
  const subtitleColor = dark ? 'text-[#a9b7a9]' : 'text-[var(--muted)]';

  return (
    <span className={`inline-flex items-center gap-3 ${titleColor} ${className}`}>
      <svg viewBox="0 0 40 40" aria-hidden="true" className="size-10 shrink-0" fill="none">
        <circle cx="20" cy="20" r="16" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.25" />
        <g stroke="currentColor" strokeWidth="1.25" strokeOpacity="0.7">
          <line x1="20" y1="3" x2="20" y2="6.5" />
          <line x1="20" y1="33.5" x2="20" y2="37" />
          <line x1="3" y1="20" x2="6.5" y2="20" />
          <line x1="33.5" y1="20" x2="37" y2="20" />
        </g>
        <g stroke="currentColor" strokeWidth="1.1" strokeOpacity="0.85">
          <path d="M20 8.5 L31.5 13.5 L31.5 26.5 L20 31.5 L8.5 26.5 L8.5 13.5 Z" />
          <path d="M20 8.5 L20 15" />
          <path d="M31.5 13.5 L20 20 L20 31.5 L8.5 26.5 L20 20 L8.5 13.5" />
        </g>
        <g fill="currentColor">
          <circle cx="20" cy="8.5" r="1.7" />
          <circle cx="31.5" cy="13.5" r="1.7" />
          <circle cx="31.5" cy="26.5" r="1.7" />
          <circle cx="20" cy="31.5" r="1.7" />
          <circle cx="8.5" cy="26.5" r="1.7" />
          <circle cx="8.5" cy="13.5" r="1.7" />
        </g>
        <path d="M20 9.5 L24.2 21 L20 19.2 L15.8 21 Z" fill={dark ? '#f3efe2' : '#1b3832'} />
        <path d="M20 30.5 L24.2 19 L20 20.8 L15.8 19 Z" fill="#b98a4d" />
        <circle cx="20" cy="20" r="1.5" fill="currentColor" />
      </svg>
      <span className={`leading-none ${titleColor}`}>
        <span className={`block font-serif text-[22px] tracking-[-0.03em] ${titleClassName}`}>Axiom</span>
        {showSubtitle && (
          <span
            className={`mt-1.5 block font-mono text-[8px] uppercase tracking-[0.22em] ${subtitleColor}`}
          >
            Research instrument
          </span>
        )}
      </span>
    </span>
  );
}
