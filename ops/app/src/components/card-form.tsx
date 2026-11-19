"use client";

import clsx from "clsx";
import Link from "next/link";
import { startTransition, useActionState, useState, type ReactNode } from "react";
import { saveCard, type CardFormState } from "@/app/(app)/cards/actions";
import { Icon } from "@/components/ui/icon";
import { locationIcon } from "@/lib/cards";
import { initials } from "@/lib/format";
import { T, type Kind } from "@/lib/texts";

export type CardDraft = {
  id: string | null;
  pipeline_id: string;
  kind: Kind;
  title: string;
  owner_id: string;
  date: string;
  time: string;
  duration: number;
  location_kind: "in_person" | "online" | "phone";
  location: string;
  contact_name: string;
  contact_role: string;
  contact_phone: string;
  contact_email: string;
  company_name: string;
  company_sector: string;
  value: string;
  due: string;
  description: string;
  channel: string;
  participants: string[];
};

type Person = { id: string; full_name: string };
const DURATIONS: [number, string][] = [[30, "30 min"], [45, "45 min"], [60, "1 h"], [90, "1 h 30"], [120, "2 h"], [180, "3 h"]];
const CHANNELS = ["LinkedIn", "Instagram", "Email", "Webinar", "Rádio", "Evento"];

export function CardForm({ initial, team, back, submitLabel }: { initial: CardDraft; team: Person[]; back: string; submitLabel: string }) {
  const [d, setD] = useState(initial);
  const [state, dispatch, pending] = useActionState<CardFormState, FormData>(saveCard, {});
  const e = state.errors ?? {};
  const set = <K extends keyof CardDraft>(k: K, v: CardDraft[K]) => setD((x) => ({ ...x, [k]: v }));

  const F = (key: string, label: string, input: ReactNode, hint?: string) => (
    <div className={clsx("field", e[key] && "has-error")}>
      <label htmlFor={`f-${key}`}>{label}</label>
      {input}
      {e[key] ? <span className="error">{e[key]}</span> : hint ? <span className="hint">{hint}</span> : null}
    </div>
  );
  const inp = (key: keyof CardDraft, type = "text", extra: Record<string, unknown> = {}) => (
    <input className="input" id={`f-${key}`} name={key} type={type} value={String(d[key] ?? "")} onChange={(ev) => set(key, ev.target.value as never)} {...extra} />
  );
  const owners = (
    <select className="select" id="f-owner_id" name="owner_id" value={d.owner_id} onChange={(ev) => set("owner_id", ev.target.value)}>
      {team.map((p) => (
        <option key={p.id} value={p.id}>
          {p.full_name}
        </option>
      ))}
    </select>
  );
  const notes = (key: string, label: string, placeholder?: string, hint?: string) =>
    F(
      key,
      label,
      <textarea className="textarea" id={`f-${key}`} name="description" value={d.description} placeholder={placeholder} onChange={(ev) => set("description", ev.target.value)} />,
      hint,
    );

  let fields: ReactNode;
  if (d.kind === "meetings") {
    fields = (
      <>
        <div className="card fieldset">
          <h2 className="h-section">Reunião</h2>
          {F("title", "Assunto", inp("title", "text", { placeholder: "Ex.: Diagnóstico de processos comerciais", autoFocus: !d.id }))}
          <div className="field-row">
            {F("date", "Data", inp("date", "date"))}
            {F("time", "Hora", inp("time", "time"))}
          </div>
          <div className="field-row">
            {F(
              "duration",
              "Duração",
              <select className="select" id="f-duration" name="duration" value={d.duration} onChange={(ev) => set("duration", Number(ev.target.value))}>
                {DURATIONS.some(([v]) => v === d.duration) ? null : <option value={d.duration}>{d.duration} min</option>}
                {DURATIONS.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>,
            )}
            {F("owner_id", "Responsável", owners)}
          </div>
          <div className="field">
            <span className="field-label">Local</span>
            <input type="hidden" name="location_kind" value={d.location_kind} />
            <div className="radio-cards" role="radiogroup" aria-label="Local">
              {(["in_person", "online", "phone"] as const).map((k) => (
                <button key={k} type="button" role="radio" aria-checked={d.location_kind === k} className={clsx("radio-card", d.location_kind === k && "is-active")} onClick={() => set("location_kind", k)}>
                  <Icon name={locationIcon(k)} size="sm" />
                  {T.location[k]}
                </button>
              ))}
            </div>
          </div>
          {d.location_kind === "phone"
            ? null
            : F(
                "location",
                d.location_kind === "online" ? "Link da reunião" : "Morada",
                inp("location", d.location_kind === "online" ? "url" : "text", { placeholder: d.location_kind === "online" ? "https://meet.google.com/…" : "Av. 25 de Setembro, Maputo" }),
              )}
          <div className="field">
            <span className="field-label">Participantes internos</span>
            <div className="inline" style={{ flexWrap: "wrap" }}>
              {team
                .filter((p) => p.id !== d.owner_id)
                .map((p) => {
                  const on = d.participants.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      aria-pressed={on}
                      className={clsx("chip", on && "is-active")}
                      onClick={() => set("participants", on ? d.participants.filter((x) => x !== p.id) : [...d.participants, p.id])}
                    >
                      <span className="avatar sm">{initials(p.full_name)}</span>
                      {p.full_name.split(" ")[0]}
                    </button>
                  );
                })}
            </div>
            {d.participants.filter((p) => p !== d.owner_id).map((p) => (
              <input key={p} type="hidden" name="participants" value={p} />
            ))}
          </div>
        </div>
        <div className="card fieldset">
          <h2 className="h-section">Pessoa</h2>
          <div className="field-row">
            {F("contact_name", "Nome", inp("contact_name"))}
            {F("contact_role", "Cargo", inp("contact_role"))}
          </div>
          <div className="field-row">
            {F("contact_phone", "Telemóvel", inp("contact_phone", "tel", { placeholder: "+258 8x xxx xxxx" }))}
            {F("contact_email", "Email", inp("contact_email", "email"))}
          </div>
        </div>
        <div className="card fieldset">
          <h2 className="h-section">Empresa</h2>
          <div className="field-row">
            {F("company_name", "Nome da empresa", inp("company_name"))}
            {F("company_sector", "Sector", inp("company_sector", "text", { placeholder: "Ex.: Logística" }))}
          </div>
        </div>
        <div className="card fieldset">
          <h2 className="h-section">Notas</h2>
          {notes("description", "Notas internas", "O que levar, quem decide, contexto…", "Só a equipa vê estas notas.")}
        </div>
      </>
    );
  } else if (d.kind === "sales") {
    fields = (
      <>
        <div className="card fieldset">
          <h2 className="h-section">Oportunidade</h2>
          {F("title", "Título", inp("title", "text", { placeholder: "Ex.: ERP com módulo de frota", autoFocus: !d.id }))}
          <div className="field-row">
            {F("value", "Valor (MZN)", inp("value", "number", { inputMode: "decimal", placeholder: "0", min: 0 }))}
            {F("due", "Fecho previsto", inp("due", "date"))}
          </div>
          {F("owner_id", "Responsável", owners)}
        </div>
        <div className="card fieldset">
          <h2 className="h-section">Empresa e contacto</h2>
          <div className="field-row">
            {F("company_name", "Empresa", inp("company_name"))}
            {F("company_sector", "Sector", inp("company_sector"))}
          </div>
          <div className="field-row">
            {F("contact_name", "Pessoa", inp("contact_name"))}
            {F("contact_role", "Cargo", inp("contact_role"))}
          </div>
          <div className="field-row">
            {F("contact_phone", "Telemóvel", inp("contact_phone", "tel"))}
            {F("contact_email", "Email", inp("contact_email", "email"))}
          </div>
        </div>
        <div className="card fieldset">
          <h2 className="h-section">Notas</h2>
          {notes("description", "Contexto")}
        </div>
      </>
    );
  } else if (d.kind === "projects") {
    fields = (
      <div className="card fieldset">
        <h2 className="h-section">Projeto</h2>
        {F("title", "Título", inp("title", "text", { autoFocus: !d.id }))}
        <div className="field-row">
          {F("company_name", "Cliente", inp("company_name"))}
          {F("contact_name", "Pessoa de contacto", inp("contact_name"))}
        </div>
        <div className="field-row">
          {F("due", "Prazo de entrega", inp("due", "date"))}
          {F("owner_id", "Responsável", owners)}
        </div>
        {notes("description", "Descrição")}
      </div>
    );
  } else if (d.kind === "campaigns") {
    fields = (
      <div className="card fieldset">
        <h2 className="h-section">Campanha</h2>
        {F("title", "Título", inp("title", "text", { autoFocus: !d.id }))}
        <div className="field-row">
          {F(
            "channel",
            "Canal",
            <select className="select" id="f-channel" name="channel" value={d.channel} onChange={(ev) => set("channel", ev.target.value)}>
              {CHANNELS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>,
          )}
          {F("value", "Orçamento (MZN)", inp("value", "number", { inputMode: "decimal", min: 0 }))}
        </div>
        <div className="field-row">
          {F("due", "Lançamento", inp("due", "date"))}
          {F("owner_id", "Responsável", owners)}
        </div>
        {notes("description", "Descrição")}
      </div>
    );
  } else {
    fields = (
      <div className="card fieldset">
        <h2 className="h-section">{T.kind[d.kind] ?? T.kind.custom}</h2>
        {F("title", "Título", inp("title", "text", { autoFocus: !d.id }))}
        <div className="field-row">
          {F("owner_id", "Responsável", owners)}
          {F("due", "Prazo", inp("due", "date"))}
        </div>
        {F("company_name", "Cliente (opcional)", inp("company_name"))}
        {notes("description", "Descrição")}
      </div>
    );
  }

  return (
    <form
      className="form"
      noValidate
      onSubmit={(ev) => {
        // Dispatch manually: a plain form action would reset the fields after a validation error.
        ev.preventDefault();
        const fd = new FormData(ev.currentTarget);
        startTransition(() => dispatch(fd));
      }}
    >
      <input type="hidden" name="id" value={d.id ?? ""} />
      <input type="hidden" name="pipeline_id" value={d.pipeline_id} />
      <input type="hidden" name="kind" value={d.kind} />
      {fields}
      {state.message ? (
        <p className="form-error" role="alert">
          {state.message}
        </p>
      ) : Object.keys(e).length ? (
        <p className="form-error" role="alert">
          Reveja os campos assinalados.
        </p>
      ) : null}
      <div className="form-foot">
        <Link className="btn btn-ghost only-phone" href={back}>
          {T.actions.cancel}
        </Link>
        <button className={clsx("btn btn-primary", pending && "is-loading")} type="submit" disabled={pending}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
