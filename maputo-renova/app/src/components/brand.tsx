// Marca provisória (sem logótipo fornecido): monograma MR sobre um bloco de fracções.

export function BrandMark({ className = "size-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <rect width="40" height="40" rx="10" fill="var(--color-brand)" />
      <g fill="#fff">
        <rect x="10" y="9" width="5" height="5" rx="1" />
        <rect x="17.5" y="9" width="5" height="5" rx="1" opacity="0.55" />
        <rect x="25" y="9" width="5" height="5" rx="1" />
        <rect x="10" y="16.5" width="5" height="5" rx="1" opacity="0.55" />
        <rect x="17.5" y="16.5" width="5" height="5" rx="1" />
        <rect x="25" y="16.5" width="5" height="5" rx="1" />
        <rect x="10" y="24" width="5" height="7" rx="1" />
        <rect x="17.5" y="24" width="5" height="7" rx="1" />
        <rect x="25" y="24" width="5" height="7" rx="1" opacity="0.55" />
      </g>
    </svg>
  );
}
