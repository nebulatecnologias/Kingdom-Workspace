import Link from "next/link";
import { Pill } from "@/components/ui/bits";
import { fmtDateTime, fmtDayLong, fmtDayShort } from "@/lib/format";
import { T } from "@/lib/texts";
import type { Card, Minutes, Profile } from "@/lib/types";

const hm = (t: string | null) => (t ? t.slice(0, 5) : "");

export function StatusPill({ status }: { status: Minutes["status"] }) {
  return status === "final" ? <Pill stage={{ tone: "success", name: T.minutes.final }} /> : <Pill stage={{ tone: "warning", name: T.minutes.draft }} />;
}

/** The minutes as a document (reading view and print). */
export function MinutesDoc({ m, card, writer, approver }: { m: Minutes; card: Pick<Card, "id" | "title" | "company_name">; writer: Profile | null; approver: Profile | null }) {
  const agenda = m.agenda.filter((a) => a.topic);
  const decisions = m.decisions.filter((x) => x.text);
  const actions = m.actions.filter((a) => a.what);
  return (
    <article className="minutes-doc">
      <header>
        <div className="inline" style={{ justifyContent: "space-between" }}>
          <span className="caption">Ata de reunião{card.company_name ? ` · ${card.company_name}` : ""}</span>
          <StatusPill status={m.status} />
        </div>
        <h1>{m.title}</h1>
        <dl className="kv">
          <dt>Data</dt>
          <dd className="num">
            {m.held_at ? fmtDayLong(m.held_at) : "—"}
            {m.started_at ? `, ${hm(m.started_at)}` : ""}
            {m.ended_at ? `–${hm(m.ended_at)}` : ""}
          </dd>
          <dt>Local</dt>
          <dd>{m.location || "—"}</dd>
          <dt>Reunião</dt>
          <dd>
            <Link href={`/cards/${card.id}`} style={{ textDecoration: "underline" }}>{card.title}</Link>
          </dd>
        </dl>
      </header>
      <h2>{T.minutes.sections.attendees}</h2>
      <ul>
        {m.attendees.filter((a) => a.name).map((a, i) => (
          <li key={i}>
            {a.name}
            {a.org ? ` (${a.org}${a.role ? `, ${a.role}` : ""})` : a.role ? ` (${a.role})` : ""}
            {a.present ? null : <span className="muted"> — ausente</span>}
          </li>
        ))}
      </ul>
      <h2>{T.minutes.sections.agenda}</h2>
      <ol>
        {agenda.length ? agenda.map((a, i) => (
          <li key={i}>
            <div className="item-title">{a.topic}</div>
            {a.summary ? <div className="item-body">{a.summary}</div> : null}
          </li>
        )) : <li className="muted">—</li>}
      </ol>
      <h2>{T.minutes.sections.decisions}</h2>
      <ol>{decisions.length ? decisions.map((x, i) => <li key={i}>{x.text}</li>) : <li className="muted">Sem decisões registadas.</li>}</ol>
      <h2>{T.minutes.sections.actions}</h2>
      {actions.length ? (
        <table>
          <thead><tr><th>Ação</th><th>Responsável</th><th>Prazo</th><th>Estado</th></tr></thead>
          <tbody>
            {actions.map((a, i) => (
              <tr key={i}>
                <td>{a.what}</td>
                <td>{a.who}</td>
                <td className="num">{a.due ? fmtDayShort(a.due) : "—"}</td>
                <td>{a.status === "done" ? <span className="inline"><span className="dot success" />Feita</span> : <span className="inline"><span className="dot" />Pendente</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : <p className="muted">Sem ações.</p>}
      {m.next_steps || m.next_meeting_at ? (
        <>
          <h2>{T.minutes.sections.next}</h2>
          {m.next_steps ? <p style={{ whiteSpace: "pre-wrap" }}>{m.next_steps}</p> : null}
          {m.next_meeting_at ? <p className="num">Próxima reunião: {fmtDateTime(m.next_meeting_at)}</p> : null}
        </>
      ) : null}
      <div className="sign">
        <div>
          <div className="line">{T.minutes.writtenBy}</div>
          {writer ? `${writer.full_name}${writer.job_title ? `, ${writer.job_title}` : ""}` : "—"}
        </div>
        <div>
          <div className="line">{T.minutes.approvedBy}</div>
          {approver ? `${approver.full_name}${approver.job_title ? `, ${approver.job_title}` : ""}` : <span className="muted">—</span>}
        </div>
      </div>
      <p className="watermark">
        Kingdom Ops · {m.status === "final" && m.finalized_at ? `final em ${fmtDateTime(m.finalized_at)}` : `rascunho atualizado em ${fmtDateTime(m.updated_at)}`}
      </p>
    </article>
  );
}
