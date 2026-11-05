import { IconCheck, IconClock, IconRefresh } from "@/components/icons";
import type { Dict } from "@/lib/content";

export default function DossierCard({ dossier }: { dossier: Dict["hero"]["dossier"] }) {
  return (
    <div className="dossier" role="img" aria-label={`${dossier.heading} — ${dossier.note}`}>
      <div className="dossier__sheet" aria-hidden />
      <div className="dossier__card">
        <header className="dossier__head">
          <span className="dossier__mark" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-navy.png" alt="" width={618} height={272} />
          </span>
          <div>
            <p className="dossier__title">{dossier.heading}</p>
            <p className="dossier__note">{dossier.note}</p>
          </div>
        </header>
        <ul className="dossier__rows">
          {dossier.rows.map((row) => (
            <li key={row.item} className={`dossier__row dossier__row--${row.state}`}>
              <span className="dossier__icon" aria-hidden>
                {row.state === "done" && <IconCheck size={14} />}
                {row.state === "active" && <IconRefresh size={14} />}
                {row.state === "scheduled" && <IconClock size={14} />}
              </span>
              <span className="dossier__item">{row.item}</span>
              <span className="dossier__status">{row.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
