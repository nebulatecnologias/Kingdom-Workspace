import clsx from "clsx";

/** CSS bars (prototype Bars): lime fill, the tone lives in the label's dot. */
export function Bars({ rows }: { rows: { label: string; value: number; dot?: string; text?: string }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="bars">
      {rows.map((r) => (
        <div className="bar" key={r.label}>
          <span className="bar-label">
            {r.dot ? <span className={clsx("dot", r.dot)} /> : null}
            {r.label}
          </span>
          <span className="bar-track">
            <span className="bar-fill" style={{ width: `${Math.round((r.value / max) * 100)}%` }} />
          </span>
          <span className="bar-value num">{r.text ?? r.value}</span>
        </div>
      ))}
    </div>
  );
}
