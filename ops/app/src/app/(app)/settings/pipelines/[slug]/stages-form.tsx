"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ConfirmSheet } from "@/components/confirm";
import { useToast } from "@/components/shell/toaster";
import { Icon } from "@/components/ui/icon";
import { T } from "@/lib/texts";
import type { Stage, Tone } from "@/lib/types";
import { createFromTemplate, removePipeline, renamePipeline, saveStages } from "../../actions";

const TONES: [Tone, string][] = [["neutral", "Cinza"], ["info", "Azul"], ["warning", "Âmbar"], ["danger", "Vermelho"], ["success", "Verde"]];
type Row = Omit<Stage, "id" | "pipeline_id" | "position"> & { id: string | null; key: string };
type Outcome = "open" | "done" | "lost";
const outcomeOf = (s: Row): Outcome => (s.is_done ? "done" : s.is_lost ? "lost" : "open");

export function StagesForm({ pipelineId, pipelineName, stages, counts, canEdit }: { pipelineId: string; pipelineName: string; stages: Stage[]; counts: Record<string, number>; canEdit: boolean }) {
  const [rows, setRows] = useState<Row[]>(stages.map((s) => ({ ...s, key: s.id })));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();
  const patch = (i: number, p: Partial<Row>) => {
    setSaved(false);
    setRows((r) => r.map((x, j) => (j === i ? { ...x, ...p } : x)));
  };
  const move = (i: number, d: -1 | 1) =>
    setRows((r) => {
      const n = [...r];
      const j = i + d;
      if (j < 0 || j >= n.length) return r;
      [n[i], n[j]] = [n[j], n[i]];
      setSaved(false);
      return n;
    });
  const dupes = new Set(rows.map((r) => r.name.trim().toLocaleLowerCase("pt")).filter((n, i, a) => n && a.indexOf(n) !== i));

  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        if (dupes.size) return setError("Há etapas com o mesmo nome. Use nomes diferentes.");
        start(async () => {
          const res = await saveStages(pipelineId, rows.map((s) => ({ id: s.id, name: s.name, tone: s.tone, is_done: s.is_done, is_lost: s.is_lost, requires_note: s.requires_note, requires_reschedule: s.requires_reschedule })));
          if (!res.ok) return setError(res.error);
          toast(T.toast.stagesSaved);
          setSaved(true);
          router.refresh();
        });
      }}
    >
      <fieldset className="card fieldset" disabled={!canEdit} style={{ border: 0, margin: 0 }}>
        <h2 className="h-section">Etapas de {pipelineName}</h2>
        <p className="caption" style={{ margin: "-6px 0 0" }}>A ordem é a ordem das colunas. As regras decidem o que o app pede ao mover um cartão.</p>
        <div className="repeat-list">
          {rows.map((s, i) => {
            const n = s.id ? counts[s.id] ?? 0 : 0;
            const dupe = dupes.has(s.name.trim().toLocaleLowerCase("pt"));
            return (
              <div key={s.key} className="repeat-row" style={{ gridTemplateColumns: "auto 1fr auto", alignItems: "center" }}>
                <span className="inline" style={{ flexDirection: "column", gap: 0 }}>
                  <button type="button" className="btn btn-quiet btn-icon btn-sm" onClick={() => move(i, -1)} aria-label={`Subir ${s.name}`} disabled={i === 0}><Icon name="chevron-left" size="sm" className="rot90" /></button>
                  <button type="button" className="btn btn-quiet btn-icon btn-sm" onClick={() => move(i, 1)} aria-label={`Descer ${s.name}`} disabled={i === rows.length - 1}><Icon name="chevron-right" size="sm" className="rot90" /></button>
                </span>
                <div className="fields cols-2">
                  <div className={clsx("inline", dupe && "has-error")}>
                    <span className={clsx("dot", s.tone)} />
                    <input className="input" value={s.name} maxLength={60} onChange={(e) => patch(i, { name: e.target.value })} aria-label={`Nome da etapa ${i + 1}`} aria-invalid={dupe || undefined} />
                  </div>
                  <select className="select" value={s.tone} onChange={(e) => patch(i, { tone: e.target.value as Tone })} aria-label={`Cor da etapa ${s.name || i + 1}`}>
                    {TONES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                  <div className="inline" style={{ flexWrap: "wrap", gridColumn: "1 / -1", gap: 14 }}>
                    {/* #33 Open, done or lost: one of the three. */}
                    <select
                      className="select"
                      style={{ width: "auto" }}
                      value={outcomeOf(s)}
                      aria-label={`Estado da etapa ${s.name || i + 1}`}
                      onChange={(e) => {
                        const o = e.target.value as Outcome;
                        patch(i, { is_done: o === "done", is_lost: o === "lost" });
                      }}
                    >
                      <option value="open">Aberta</option>
                      <option value="done">Conta como concluída</option>
                      <option value="lost">Conta como perdida</option>
                    </select>
                    {([["requires_note", "Pede motivo"], ["requires_reschedule", "Pede data"]] as const).map(([k, l]) => (
                      <label key={k} className="check">
                        <input type="checkbox" checked={s[k]} onChange={(e) => patch(i, { [k]: e.target.checked })} aria-label={`${l} (${s.name || `etapa ${i + 1}`})`} />
                        {l}
                      </label>
                    ))}
                    {n ? <span className="caption num">{n} {n === 1 ? "cartão" : "cartões"}</span> : null}
                  </div>
                </div>
                {/* #36 A stage with cards cannot be removed: say so up front. */}
                <button
                  type="button"
                  className="btn btn-quiet btn-icon btn-sm"
                  onClick={() => {
                    setSaved(false);
                    setRows((r) => r.filter((_, j) => j !== i));
                  }}
                  aria-label={n ? `${s.name} tem ${n} cartões: mova-os antes de remover` : `${T.actions.remove} ${s.name}`}
                  title={n ? "Mova os cartões desta etapa antes de a remover" : undefined}
                  disabled={rows.length === 1 || n > 0}
                >
                  <Icon name="x" size="sm" />
                </button>
              </div>
            );
          })}
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
          {saved ? <span className="caption inline" role="status"><Icon name="check" size="sm" />Guardado</span> : null}
          <button className={clsx("btn btn-primary", pending && "is-loading")} type="submit" disabled={pending}>{T.actions.save}</button>
        </div>
      ) : (
        <p className="caption">Só um admin pode mudar as etapas.</p>
      )}
    </form>
  );
}

/** #32 Rename or remove the pipeline (admins). */
export function PipelineAdmin({ id, name, kind, cardCount }: { id: string; name: string; kind: string; cardCount: number }) {
  const [value, setValue] = useState(name);
  const [error, setError] = useState<string | null>(null);
  const [ask, setAsk] = useState(false);
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();
  return (
    <div className="card card-pad">
      <form
        className="inline"
        style={{ flexWrap: "wrap", alignItems: "flex-end" }}
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          start(async () => {
            const r = await renamePipeline(id, value);
            if (!r.ok) return setError(r.error);
            toast("Nome guardado");
            router.refresh();
          });
        }}
      >
        <div className="field" style={{ flex: "1 1 220px", margin: 0 }}>
          <label htmlFor="pl-name">Nome do pipeline</label>
          <input className="input" id="pl-name" value={value} maxLength={60} onChange={(e) => setValue(e.target.value)} />
        </div>
        <button className={clsx("btn btn-ghost", pending && "is-loading")} type="submit" disabled={pending || value.trim() === name}>Mudar nome</button>
        {kind === "meetings" ? null : (
          <button type="button" className="btn btn-ghost" onClick={() => setAsk(true)}>
            <Icon name={cardCount ? "archive" : "trash"} size="sm" />
            {cardCount ? "Arquivar pipeline" : "Apagar pipeline"}
          </button>
        )}
      </form>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {ask ? (
        <ConfirmSheet
          title={cardCount ? `Arquivar "${name}"?` : `Apagar "${name}"?`}
          confirmLabel={cardCount ? "Arquivar" : "Apagar"}
          pending={pending}
          error={error}
          onClose={() => setAsk(false)}
          onConfirm={() =>
            start(async () => {
              const r = await removePipeline(id);
              if (!r.ok) return setError(r.error);
              toast(r.archived ? "Pipeline arquivado" : "Pipeline apagado");
              router.replace("/settings/pipelines/reunioes");
            })
          }
        >
          {cardCount
            ? `Tem ${cardCount} ${cardCount === 1 ? "cartão" : "cartões"}: o pipeline sai do menu e das contagens, mas os dados ficam guardados.`
            : "O pipeline está vazio e é apagado com as suas etapas."}
        </ConfirmSheet>
      ) : null}
    </div>
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

/** #32 Pick a template, then give the new pipeline its own name (a free one is suggested). */
export function Templates({ existing }: { existing: string[] }) {
  const [chosen, setChosen] = useState<(typeof TEMPLATES)[number] | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();
  const taken = new Set(existing.map((n) => n.toLocaleLowerCase("pt")));
  const suggest = (base: string) => {
    if (!taken.has(base.toLocaleLowerCase("pt"))) return base;
    for (let i = 2; ; i++) if (!taken.has(`${base} ${i}`.toLocaleLowerCase("pt"))) return `${base} ${i}`;
  };
  return (
    <>
      <div className="inline" style={{ flexWrap: "wrap" }} role="radiogroup" aria-label="Modelos">
        {TEMPLATES.map((t) => (
          <button
            key={t.kind}
            type="button"
            role="radio"
            aria-checked={chosen?.kind === t.kind}
            className={clsx("chip", chosen?.kind === t.kind && "is-active")}
            onClick={() => {
              setChosen(t);
              setName(suggest(t.name));
              setError(null);
            }}
          >
            <Icon name={t.icon} size="sm" />
            {t.name}
            <span className="caption">· {t.n} etapas</span>
          </button>
        ))}
      </div>
      {chosen ? (
        <form
          className="inline"
          style={{ flexWrap: "wrap", alignItems: "flex-end", marginTop: 12 }}
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            if (taken.has(name.trim().toLocaleLowerCase("pt"))) return setError(`Já existe um pipeline "${name.trim()}". Escolha outro nome.`);
            start(async () => {
              const r = await createFromTemplate(chosen.kind, name);
              if (!r.ok) return setError(r.error);
              toast(T.toast.pipelineCreated);
              router.push(`/settings/pipelines/${r.slug}`);
            });
          }}
        >
          <div className="field" style={{ flex: "1 1 220px", margin: 0 }}>
            <label htmlFor="tpl-name">Nome do novo pipeline</label>
            <input className="input" id="tpl-name" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <button className={clsx("btn btn-primary", pending && "is-loading")} type="submit" disabled={pending || !name.trim()}>{T.actions.create}</button>
        </form>
      ) : null}
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </>
  );
}
