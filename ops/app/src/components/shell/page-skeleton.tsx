/** Placeholder shown while a dynamic page loads (makes taps feel instant; see 11-gotchas.md). */
export function PageSkeleton() {
  return (
    <div className="page" aria-busy="true" aria-label="A carregar">
      <div className="page-head">
        <div className="skeleton" style={{ height: 28, width: 180 }} />
      </div>
      <div className="stack">
        <div className="skeleton" style={{ height: 120, borderRadius: 20 }} />
        <div className="skeleton" style={{ height: 68, borderRadius: 20 }} />
        <div className="skeleton" style={{ height: 68, borderRadius: 20 }} />
      </div>
    </div>
  );
}
