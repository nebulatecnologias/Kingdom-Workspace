"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useToast } from "@/components/shell/toaster";
import { Icon } from "@/components/ui/icon";
import { T } from "@/lib/texts";
import type { Stage, Tone } from "@/lib/types";
import { createFromTemplate, saveStages } from "../../actions";

const TONES: [Tone, string][] = [["neutral", "Cinza"], ["info", "Azul"], ["warning", "Âmbar"], ["danger", "Vermelho"], ["success", "Verde"]];
type Row = Omit<Stage, "id" | "pipeline_id" | "position"> & { id: string | null; key: string };

export function StagesForm({ pipelineId, pipelineName, stages, canEdit }: { pipelineId: string; pipelineName: string; stages: Stage[]; canEdit: boolean }) {
  const [rows, setRows] = useState<Row[]>(stages.map((s) => ({ ...s, key: s.id })));
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();
  const patch = (i: number, p: Partial<Row>) => setRows((r) => r.map((x, j) => (j === i ? { ...x, ...p } : x)));
  const move = (i: number, d: -1 | 1) =>
    setRows((r) => {
      const n = [...r];
      const j = i + d;
      if (j < 0 || j >= n.length) return r;
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });

  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        start(async () => {
          const res = await saveStages(pipelineId, rows.map((s) => ({ id: s.id, name: s.name, tone: s.tone, is_done: s.is_done, is_lost: s.is_lost, requires_note: s.requires_note, requires_reschedule: s.requires_reschedule })));
          if (!res.ok) return setError(res.error);
          toast(T.toast.stagesSaved);
          router.refresh();
        });
      }}
    >
      <fieldset className="card fieldset" disabled={!canEdit} style={{ border: 0, margin: 0 }}>
        <h2 className="h-section">Etapas de {pipelineName}</h2>
        <p className="caption" style={{ margin: "-6px 0 0" }}>A ordem é a ordem das colunas. As regras decidem o que o app pede ao mover um cartão.</p>
        <div className="repeat-list">
          {rows.map((s, i) => (
            <div key={s.key} className="repeat-row" style={{ gridTemplateColumns: "auto 1fr auto", alignItems: "center" }}>
              <span className="inline" style={{ flexDirection: "column", gap: 0 }}>
                <button type="button" className="btn btn-quiet btn-icon btn-sm" onClick={() => move(i, -1)} aria-label="Subir" disabled={i === 0}><Icon name="chevron-left" size="sm" className="rot90" /></button>
                <button type="button" className="btn btn-quiet btn-icon btn-sm" onClick={() => move(i, 1)} aria-label="Descer" disabled={i === rows.length - 1}><Icon name="chevron-right" size="sm" className="rot90" /></button>
              </span>
              <div className="fields cols-2">
                <div className="inline">
                  <span className={clsx("dot", s.tone)} />
                  <input className="input" value={s.name} onChange={(e) => patch(i, { name: e.target.value })} aria-label="Nome da etapa" />
                </div>
                <select className="select" value={s.tone} onChange={(e) => patch(i, { tone: e.target.value as Tone })} aria-label="Cor">
                  {TONES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <div className="inline" style={{ flexWrap: "wrap", gridColumn: "1 / -1", gap: 14 }}>
                  {([["is_done", "Conta como concluído"], ["is_lost", "Conta como perdido"], ["requires_note", "Pede motivo"], ["requires_reschedule", "Pede nova data"]] as const).map(([k, l]) => (
                    <label key={k} className="check"><input type="checkbox" checked={s[k]} onChange={(e) => patch(i, { [k]: e.target.checked })} />{l}</label>
                  ))}
                </div>
              </div>
              <button type="button" className="btn btn-quiet btn-icon btn-sm" onClick={() => setRows((r) => r.filter((_, j) => j !== i))} aria-label={T.actions.remove} disabled={rows.length === 1}>
                <Icon name="x" size="sm" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-sm repeat-add"
          onClick={() => setRows((r) => [...r, { id: null, key: `new-${r.length}-${Math.random()}`, name: "", tone: "neutral", is_done: false, is_lost: false, requires_note: false, requires_reschedule: false }])}
        >
          <Icon name="plus" size="sm" />
          {T.actions.addStage}
        </button>
      </fieldset>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {canEdit ? (
        <div className="form-foot">
          <button className={clsx("btn btn-primary", pending && "is-loading")} type="submit" disabled={pending}>{T.actions.save}</button>
        </div>
      ) : (
        <p className="caption">Só um admin pode mudar as etapas.</p>
      )}
    </form>
  );
}

const TEMPLATES = [
  { kind: "meetings", name: "Reuniões", icon: "calendar", n: 5 },
  { kind: "sales", name: "Vendas", icon: "target", n: 6 },
  { kind: "projects", name: "Projetos", icon: "briefcase", n: 5 },
  { kind: "campaigns", name: "Campanhas", icon: "megaphone", n: 5 },
  { kind: "tasks", name: "Tarefas", icon: "check-square", n: 4 },
  { kind: "custom", name: "Recrutamento", icon: "users", n: 5 },
];

export function Templates() {
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();
  return (
    <div className="inline" style={{ flexWrap: "wrap" }}>
      {TEMPLATES.map((t) => (
        <button
          key={t.kind}
          type="button"
          className="chip"
          disabled={pending}
          onClick={() => {
            start(async () => {
              const r = await createFromTemplate(t.kind, t.name);
              if (!r.ok) return toast(r.error);
              toast(T.toast.pipelineCreated);
              router.push(`/settings/pipelines/${r.slug}`);
            });
          }}
        >
          <Icon name={t.icon} size="sm" />
          {t.name}
          <span className="caption">· {t.n} etapas</span>
        </button>
      ))}
    </div>
  );
}
