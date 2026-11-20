"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { moveCard } from "@/app/(app)/cards/actions";
import { useToast } from "@/components/shell/toaster";
import { Icon } from "@/components/ui/icon";
import { dayKey } from "@/lib/format";
import { T } from "@/lib/texts";
import type { Stage } from "@/lib/types";

/** "Mover para": stage stepper in a glass bottom sheet (dialog on desktop), with inline fields for stage rules. */
export function MoveSheet({ cardId, current, stages, onClose, onMoved, initial, position, meeting = true }: { cardId: string; current: string; stages: Stage[]; onClose: () => void; onMoved?: (stageId: string) => void; initial?: string; position?: number | null; meeting?: boolean }) {
  const [chosen, setChosen] = useState<string | null>(initial ?? null);
  const [note, setNote] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [err, setErr] = useState<{ text: string; field?: string } | null>(null);
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();
  const target = stages.find((s) => s.id === chosen);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const confirm = () => {
    if (!target) return;
    if (target.requires_note && !note.trim()) return setErr({ text: "Escreva o motivo.", field: "note" });
    if (target.requires_reschedule && !date) return setErr({ text: "Escolha a nova data.", field: "date" });
    if (target.requires_reschedule && date < dayKey(new Date())) return setErr({ text: "A nova data tem de ser hoje ou depois.", field: "date" });
    start(async () => {
      const res = await moveCard({ cardId, stageId: target.id, position: position ?? null, note, date, time });
      if (!res.ok) return setErr({ text: res.error, field: res.field });
      toast(`${T.toast.moved} ${target.name}`);
      onMoved?.(target.id);
      onClose();
      router.refresh();
    });
  };

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="move-title">
        <div className="sheet-handle" />
        <div className="sheet-head">
          <h2 className="h-title" id="move-title">
            {T.actions.move}
          </h2>
          <button className="btn btn-quiet btn-icon" type="button" onClick={onClose} aria-label="Fechar">
            <Icon name="x" />
          </button>
        </div>
        <div className="stepper">
          {stages.map((s) => {
            const isCurrent = s.id === current;
            const isChosen = s.id === chosen;
            return (
              <div key={s.id}>
                <button
                  type="button"
                  className={clsx(isCurrent && "is-current", isChosen && "is-selected")}
                  disabled={isCurrent}
                  aria-pressed={isChosen}
                  onClick={() => {
                    setChosen(s.id);
                    setErr(null);
                  }}
                >
                  <span className="mark">
                    <Icon name="check" />
                  </span>
                  <span className={clsx("dot", s.tone)} />
                  <span>{s.name}</span>
                  <span className="rule">{isCurrent ? "atual" : s.requires_reschedule ? T.stageRules.reschedule : s.requires_note ? T.stageRules.note : ""}</span>
                </button>
                {isChosen && s.requires_reschedule ? (
                  <div className="inline-fields">
                    <div className="field-row">
                      <div className={clsx("field", err?.field === "date" && "has-error")}>
                        <label htmlFor="mv-date">{meeting ? "Nova data" : "Data"}</label>
                        {/* #6 Never in the past. */}
                        <input className="input" id="mv-date" type="date" min={dayKey(new Date())} value={date} onChange={(e) => setDate(e.target.value)} />
                      </div>
                      {meeting ? (
                        <div className="field">
                          <label htmlFor="mv-time">Hora</label>
                          <input className="input" id="mv-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                          <span className="hint">Vazio: mantém a hora atual.</span>
                        </div>
                      ) : null}
                    </div>
                    {/* #33 One reason field: required when the stage asks for one. */}
                    {s.requires_note ? null : (
                      <div className="field">
                        <label htmlFor="mv-note">Motivo (opcional)</label>
                        <input className="input" id="mv-note" value={note} onChange={(e) => setNote(e.target.value)} />
                      </div>
                    )}
                  </div>
                ) : null}
                {isChosen && s.requires_note ? (
                  <div className="inline-fields">
                    <div className={clsx("field", err?.field === "note" && "has-error")}>
                      <label htmlFor="mv-note">Motivo</label>
                      <textarea className="textarea" id="mv-note" value={note} onChange={(e) => setNote(e.target.value)} style={{ minHeight: 64 }} />
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
        {err ? (
          <p className="form-error" role="alert" style={{ margin: "8px 0 0" }}>
            {err.text}
          </p>
        ) : null}
        <div className="form-foot" style={{ marginTop: 12 }}>
          <button className="btn btn-ghost" type="button" onClick={onClose}>
            {T.actions.cancel}
          </button>
          <button className={clsx("btn btn-primary", pending && "is-loading")} type="button" disabled={!chosen || pending} onClick={confirm}>
            {T.actions.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}

/** The "Mover para" button that opens the sheet (card page). */
export function MoveButton({ cardId, current, stages, meeting = true }: { cardId: string; current: string; stages: Stage[]; meeting?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="btn btn-primary" type="button" onClick={() => setOpen(true)}>
        <Icon name="arrow-right" size="sm" />
        {T.actions.move}
      </button>
      {open ? <MoveSheet cardId={cardId} current={current} stages={stages} meeting={meeting} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
