"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import { concludeMeeting, saveMinutes, type MinutesInput } from "@/app/(app)/atas/actions";
import { useToast } from "@/components/shell/toaster";
import { Icon } from "@/components/ui/icon";
import { T } from "@/lib/texts";

type Draft = Required<Omit<MinutesInput, "status">>;
type ListKey = "attendees" | "agenda" | "decisions" | "actions";
const BLANK = {
  attendees: { name: "", org: "", role: "", present: true },
  agenda: { topic: "", summary: "" },
  decisions: { text: "" },
  actions: { what: "", who: "", due: "", status: "pending" as const },
};

export function MinutesForm({ initial, meeting, writer, team, back }: { initial: Draft; meeting: ReactNode; writer: string; team: { id: string; full_name: string }[]; back: string }) {
  const [d, setD] = useState<Draft>(initial);
  const [err, setErr] = useState<{ text: string; field?: string } | null>(null);
  const [ask, setAsk] = useState<{ id: string } | null>(null);
  const [pending, start] = useTransition();
  const [which, setWhich] = useState<"draft" | "final" | null>(null);
  const router = useRouter();
  const toast = useToast();

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));
  const setRow = <K extends ListKey>(k: K, i: number, patch: Partial<Draft[K][number]>) =>
    setD((x) => ({ ...x, [k]: (x[k] as Draft[K]).map((r, j) => (j === i ? { ...r, ...patch } : r)) }));
  const addRow = (k: ListKey) => setD((x) => ({ ...x, [k]: [...(x[k] as unknown[]), { ...BLANK[k] }] }));
  const removeRow = (k: ListKey, i: number) => setD((x) => ({ ...x, [k]: (x[k] as unknown[]).filter((_, j) => j !== i) }));

  const submit = (status: "draft" | "final") => {
    setErr(null);
    setWhich(status);
    start(async () => {
      const res = await saveMinutes({ ...d, status });
      if (!res.ok) return setErr({ text: res.error, field: res.field });
      setD((x) => ({ ...x, id: res.id }));
      toast(status === "final" ? T.toast.minutesFinal : T.toast.minutesSaved);
      if (res.askConclude) setAsk({ id: res.id });
      else router.push(`/atas/${res.id}`);
    });
  };

  const remove = (k: ListKey, i: number) => (
    <button type="button" className="btn btn-quiet btn-icon btn-sm" onClick={() => removeRow(k, i)} aria-label={T.actions.remove}>
      <Icon name="x" size="sm" />
    </button>
  );
  const add = (k: ListKey, label: string) => (
    <button type="button" className="btn btn-ghost btn-sm repeat-add" onClick={() => addRow(k)}>
      <Icon name="plus" size="sm" />
      {label}
    </button>
  );
  const sec = (key: keyof typeof T.minutes.sections, body: ReactNode, hint?: string) => (
    <section className="card fieldset">
      <h2 className="h-section">{T.minutes.sections[key]}</h2>
      {hint ? <p className="caption" style={{ margin: "-6px 0 0" }}>{hint}</p> : null}
      {body}
    </section>
  );
  const input = (value: string | undefined, onChange: (v: string) => void, props: Record<string, unknown> = {}) => (
    <input className="input" value={value ?? ""} onChange={(e) => onChange(e.target.value)} {...props} />
  );

  return (
    <form className="form" noValidate onSubmit={(e) => e.preventDefault()}>
      {sec(
        "meeting",
        <>
          {meeting}
          <div className={clsx("field", err?.field === "title" && "has-error")}>
            <label htmlFor="m-title">Título da ata</label>
            {input(d.title, (v) => set("title", v), { id: "m-title" })}
            {err?.field === "title" ? <span className="error">{err.text}</span> : null}
          </div>
          <div className="field-row-3">
            <div className="field"><label htmlFor="m-date">Data</label>{input(d.held_at, (v) => set("held_at", v), { id: "m-date", type: "date" })}</div>
            <div className="field"><label htmlFor="m-start">Início</label>{input(d.started_at, (v) => set("started_at", v), { id: "m-start", type: "time" })}</div>
            <div className="field"><label htmlFor="m-end">Fim</label>{input(d.ended_at, (v) => set("ended_at", v), { id: "m-end", type: "time" })}</div>
          </div>
          <div className="field"><label htmlFor="m-loc">Local</label>{input(d.location, (v) => set("location", v), { id: "m-loc" })}</div>
        </>,
      )}
      {sec(
        "attendees",
        <>
          <div className="repeat-list">
            {d.attendees.map((a, i) => (
              <div className="repeat-row" key={i}>
                <div className="fields cols-3">
                  {input(a.name, (v) => setRow("attendees", i, { name: v }), { placeholder: "Nome", "aria-label": "Nome" })}
                  {input(a.org, (v) => setRow("attendees", i, { org: v }), { placeholder: "Organização", "aria-label": "Organização" })}
                  {input(a.role, (v) => setRow("attendees", i, { role: v }), { placeholder: "Função", "aria-label": "Função" })}
                  <label className="toggle">
                    <input type="checkbox" checked={a.present} onChange={(e) => setRow("attendees", i, { present: e.target.checked })} /> Presente
                  </label>
                </div>
                {remove("attendees", i)}
              </div>
            ))}
          </div>
          {add("attendees", "Participante")}
        </>,
      )}
      {sec(
        "agenda",
        <>
          <div className="repeat-list">
            {d.agenda.map((a, i) => (
              <div className="repeat-row" key={i}>
                <div className="fields">
                  {input(a.topic, (v) => setRow("agenda", i, { topic: v }), { placeholder: `Tópico ${i + 1}`, "aria-label": `Tópico ${i + 1}` })}
                  <textarea className="textarea" value={a.summary} onChange={(e) => setRow("agenda", i, { summary: e.target.value })} placeholder="O que foi discutido" aria-label="Resumo" style={{ minHeight: 64 }} />
                </div>
                {remove("agenda", i)}
              </div>
            ))}
          </div>
          {add("agenda", "Tópico")}
        </>,
        "Um ponto por tópico, com o resumo da discussão.",
      )}
      {sec(
        "decisions",
        <>
          <div className="repeat-list">
            {d.decisions.map((x, i) => (
              <div className="repeat-row" key={i}>
                <div className="fields">{input(x.text, (v) => setRow("decisions", i, { text: v }), { placeholder: "O que ficou decidido", "aria-label": "Decisão" })}</div>
                {remove("decisions", i)}
              </div>
            ))}
          </div>
          {add("decisions", "Decisão")}
        </>,
      )}
      {sec(
        "actions",
        <>
          <div className="repeat-list">
            {d.actions.map((a, i) => (
              <div className="repeat-row" key={i}>
                <div className="fields cols-4">
                  {input(a.what, (v) => setRow("actions", i, { what: v }), { placeholder: "O quê", "aria-label": "O quê" })}
                  {input(a.who, (v) => setRow("actions", i, { who: v }), { placeholder: "Quem", "aria-label": "Quem", list: "team-names" })}
                  {input(a.due, (v) => setRow("actions", i, { due: v }), { type: "date", "aria-label": "Prazo" })}
                  <select className="select" value={a.status} onChange={(e) => setRow("actions", i, { status: e.target.value as "pending" | "done" })} aria-label="Estado">
                    <option value="pending">Pendente</option>
                    <option value="done">Feita</option>
                  </select>
                </div>
                {remove("actions", i)}
              </div>
            ))}
          </div>
          <datalist id="team-names">{team.map((p) => <option key={p.id} value={p.full_name} />)}</datalist>
          {add("actions", "Ação")}
        </>,
      )}
      {sec(
        "next",
        <>
          <div className="field">
            <label htmlFor="m-next">O que fica combinado a seguir</label>
            <textarea className="textarea" id="m-next" value={d.next_steps} onChange={(e) => set("next_steps", e.target.value)} placeholder="Ex.: preparar o ambiente e validar o design na primeira revisão" />
          </div>
          <div className="field-row">
            <div className="field"><label htmlFor="m-nd">Próxima reunião (data)</label>{input(d.next_meeting_date, (v) => set("next_meeting_date", v), { id: "m-nd", type: "date" })}</div>
            <div className="field"><label htmlFor="m-nt">Hora</label>{input(d.next_meeting_time, (v) => set("next_meeting_time", v), { id: "m-nt", type: "time" })}</div>
          </div>
        </>,
      )}
      {sec(
        "close",
        <div className="field-row">
          <div className="field"><label htmlFor="m-wb">{T.minutes.writtenBy}</label><input className="input" id="m-wb" value={writer} disabled /></div>
          <div className="field">
            <label htmlFor="m-ab">{T.minutes.approvedBy}</label>
            <select className="select" id="m-ab" value={d.approved_by} onChange={(e) => set("approved_by", e.target.value)}>
              <option value="">—</option>
              {team.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
            </select>
          </div>
        </div>,
      )}
      {err && err.field !== "title" ? <p className="form-error" role="alert">{err.text}</p> : null}
      {ask ? (
        <div className="alert" role="status">
          <Icon name="check" />
          <div>
            <b>{T.toast.concludeAsk}</b>
            <div className="inline" style={{ marginTop: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() =>
                  start(async () => {
                    await concludeMeeting(d.card_id);
                    router.push(`/atas/${ask.id}`);
                  })
                }
              >
                {T.actions.conclude}
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => router.push(`/atas/${ask.id}`)}>Agora não</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="form-foot">
          <a className="btn btn-quiet only-desktop" href={back}>{T.actions.cancel}</a>
          <button className={clsx("btn btn-ghost", pending && which === "draft" && "is-loading")} type="button" disabled={pending} onClick={() => submit("draft")}>{T.actions.saveDraft}</button>
          <button className={clsx("btn btn-primary", pending && which === "final" && "is-loading")} type="button" disabled={pending} onClick={() => submit("final")}>{T.actions.finalize}</button>
        </div>
      )}
    </form>
  );
}
