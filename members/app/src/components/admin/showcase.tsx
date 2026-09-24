"use client";

import { IntentLink as Link } from "@/components/shell/intent-link";
import { useActionState, useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { ArrowDown, ArrowUp, GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { deleteSection, moveSection, reorderProducts, saveSection, setSection, setVisibility, type FormResult } from "@/app/(admin)/admin/_actions/catalogue";
import { Art } from "@/components/catalogue/art";
import { toast } from "./toaster";
import { keepValues } from "./keep-form";

export type ShowcaseRow = {
  id: string;
  title: string;
  meta: string;
  coverPath: string | null;
  coverUrl?: string;
  fieldColour: string;
  sectionId: string | null;
  visibility: "visible" | "soon" | "hidden";
};

type Section = { id: string; name: string; names: Record<"en" | "pt" | "es", string>; items: number };

const VIS = ["visible", "soon", "hidden"] as const;

/**
 * The showcase order. Drag a row by its handle, or focus the handle and use the arrow keys.
 * Every change is saved straight away.
 */
export function ShowcaseList({ rows, sections }: { rows: ShowcaseRow[]; sections: { id: string; name: string }[] }) {
  const t = useTranslations();
  const [items, setItems] = useState(rows);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [announce, setAnnounce] = useState("");
  const [, start] = useTransition();

  // New data from the server (after a save elsewhere) replaces the local order.
  const [seen, setSeen] = useState(rows);
  if (seen !== rows) {
    setSeen(rows);
    setItems(rows);
  }

  const save = (next: ShowcaseRow[], message?: string) => {
    setItems(next);
    if (message) setAnnounce(message);
    start(async () => {
      const r = await reorderProducts(next.map((x) => x.id));
      toast(r.ok ? t("sc_moved") : t(r.error), r.ok ? "ok" : "error");
    });
  };

  const move = (id: string, to: number) => {
    const from = items.findIndex((x) => x.id === id);
    if (from < 0 || to < 0 || to >= items.length || from === to) return;
    const next = [...items];
    const [row] = next.splice(from, 1);
    next.splice(to, 0, row);
    save(next, t("sc_position", { title: row.title, n: to + 1, total: next.length }));
  };

  const update = (id: string, patch: Partial<ShowcaseRow>) => setItems((list) => list.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  return (
    <div>
      <p className="sr" aria-live="polite">
        {announce}
      </p>
      {items.map((p, index) => (
        <div
          key={p.id}
          className={`sc-row${dragId === p.id ? " dragging" : ""}${overId === p.id && dragId !== p.id ? " drop-before" : ""}`}
          onDragOver={(e) => {
            if (!dragId) return;
            e.preventDefault();
            setOverId(p.id);
          }}
          onDrop={(e) => {
            e.preventDefault();
            if (dragId && dragId !== p.id) {
              const to = items.findIndex((x) => x.id === p.id);
              const from = items.findIndex((x) => x.id === dragId);
              move(dragId, from < to ? to - 1 : to);
            }
            setDragId(null);
            setOverId(null);
          }}
        >
          <button
            type="button"
            className="handle"
            draggable
            aria-label={`${t("sc_drag")}: ${p.title}`}
            aria-describedby="sc-drag-help"
            onDragStart={(e) => {
              setDragId(p.id);
              e.dataTransfer.effectAllowed = "move";
              e.dataTransfer.setData("text/plain", p.id);
            }}
            onDragEnd={() => {
              setDragId(null);
              setOverId(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                e.preventDefault();
                move(p.id, index + (e.key === "ArrowUp" ? -1 : 1));
                const target = e.currentTarget;
                requestAnimationFrame(() => target.focus());
              }
            }}
          >
            <GripVertical className="icon" aria-hidden="true" />
          </button>
          <span className="sc-thumb" style={{ background: p.fieldColour }} aria-hidden="true">
            <Art path={p.coverPath} url={p.coverUrl} />
          </span>
          <div className="sc-info" style={{ minWidth: 0 }}>
            <b>{p.title}</b>
            <span className="tnum">{p.meta}</span>
          </div>
          <div className="sc-controls">
            <label className="sr" htmlFor={`sec-${p.id}`}>
              {t("ed_section")}: {p.title}
            </label>
            <select
              className="select sc-sec"
              id={`sec-${p.id}`}
              value={p.sectionId ?? ""}
              onChange={(e) => {
                const sectionId = e.target.value;
                update(p.id, { sectionId: sectionId || null });
                start(async () => {
                  const r = await setSection(p.id, sectionId);
                  toast(r.ok ? t("saved") : t(r.error), r.ok ? "ok" : "error");
                });
              }}
            >
              <option value="">{t("sc_noSection")}</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <div className="seg seg-sm" role="group" aria-label={`${t("ed_visibility")}: ${p.title}`}>
              {VIS.map((v) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={p.visibility === v}
                  onClick={() => {
                    if (p.visibility === v) return;
                    update(p.id, { visibility: v });
                    start(async () => {
                      const r = await setVisibility(p.id, v);
                      toast(r.ok ? t("saved") : t(r.error), r.ok ? "ok" : "error");
                    });
                  }}
                >
                  {t(`vis_${v}`)}
                </button>
              ))}
            </div>
            <Link className="btn btn-ghost btn-sm" href={`/admin/products/${p.id}`} aria-label={`${t("edit")}: ${p.title}`}>
              <Pencil className="icon icon-sm" aria-hidden="true" />
              {t("edit")}
            </Link>
          </div>
        </div>
      ))}
      <p id="sc-drag-help" className="sr">
        {t("sc_dragHelp")}
      </p>
    </div>
  );
}

function SectionForm({ section, onDone }: { section?: Section; onDone: () => void }) {
  const t = useTranslations();
  const [state, action, pending] = useActionState<FormResult, FormData>(saveSection, { status: "idle" });
  useEffect(() => {
    if (state.status === "saved") {
      toast(t("saved"));
      onDone();
    }
  }, [state, onDone, t]);
  const idp = section?.id ?? "new";
  return (
    <form onSubmit={keepValues(action)} className="stack" style={{ gap: 10, padding: 12, borderRadius: 16, background: "var(--surface-2)", border: "1px solid var(--line)" }}>
      {section ? <input type="hidden" name="id" value={section.id} /> : null}
      {(["en", "pt", "es"] as const).map((l) => (
        <div key={l} className={state.fieldErrors?.[`name_${l}`] ? "field has-error" : "field"}>
          <label htmlFor={`sec-${idp}-${l}`}>
            {t("sc_sectionName")} · {l.toUpperCase()}
            {l === "en" ? "" : ` (${t("optional")})`}
          </label>
          <input className="input" id={`sec-${idp}-${l}`} name={`name_${l}`} defaultValue={section?.names[l] ?? ""} maxLength={60} required={l === "en"} />
          {state.fieldErrors?.[`name_${l}`] ? (
            <span className="error-text" role="alert">
              {t(state.fieldErrors[`name_${l}`])}
            </span>
          ) : null}
        </div>
      ))}
      {state.status === "error" && state.message ? <p className="error-text">{t(state.message)}</p> : null}
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" className="btn btn-quiet btn-sm" onClick={onDone}>
          {t("cancel")}
        </button>
        <button type="submit" className="btn btn-primary btn-sm" disabled={pending}>
          {t("save")}
        </button>
      </div>
    </form>
  );
}

export function SectionsPanel({ sections }: { sections: Section[] }) {
  const t = useTranslations();
  const [editing, setEditing] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const done = () => setEditing(null);
  const act = (fn: () => Promise<{ ok: boolean; error?: string }>, ok: string) =>
    start(async () => {
      const r = await fn();
      toast(r.ok ? ok : t(r.error ?? "err_generic"), r.ok ? "ok" : "error");
    });

  return (
    <section className="card card-pad stack" style={{ gap: 10 }} aria-labelledby="sections-title">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <h2 id="sections-title" style={{ fontSize: 17 }}>
          {t("sc_sections")}
        </h2>
        {editing !== "new" ? (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing("new")}>
            <Plus className="icon icon-sm" aria-hidden="true" />
            {t("sc_addSection")}
          </button>
        ) : null}
      </div>
      {editing === "new" ? <SectionForm onDone={done} /> : null}
      {sections.map((s, i) =>
        editing === s.id ? (
          <SectionForm key={s.id} section={s} onDone={done} />
        ) : (
          <div key={s.id} className="bought" style={{ padding: "8px 8px 8px 14px", gap: 4 }}>
            <span style={{ flex: 1, minWidth: 0 }}>
              <b style={{ fontWeight: 500, display: "block" }}>{s.name}</b>
              <span className="hint">{t("sc_sectionItems", { n: s.items })}</span>
            </span>
            <button type="button" className="icon-btn" style={{ width: 34, height: 34 }} disabled={pending || i === 0} aria-label={`${t("moveUp")}: ${s.name}`} onClick={() => act(() => moveSection(s.id, -1), t("sc_moved"))}>
              <ArrowUp className="icon icon-sm" aria-hidden="true" />
            </button>
            <button type="button" className="icon-btn" style={{ width: 34, height: 34 }} disabled={pending || i === sections.length - 1} aria-label={`${t("moveDown")}: ${s.name}`} onClick={() => act(() => moveSection(s.id, 1), t("sc_moved"))}>
              <ArrowDown className="icon icon-sm" aria-hidden="true" />
            </button>
            <button type="button" className="icon-btn" style={{ width: 34, height: 34 }} aria-label={`${t("rename")}: ${s.name}`} onClick={() => setEditing(s.id)}>
              <Pencil className="icon icon-sm" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="icon-btn"
              style={{ width: 34, height: 34 }}
              disabled={pending}
              aria-label={`${t("delete")}: ${s.name}`}
              onClick={() => {
                if (s.items) toast(t("err_section_not_empty"), "error");
                else if (window.confirm(t("sc_deleteQ", { name: s.name }))) act(() => deleteSection(s.id), t("sc_deleted"));
              }}
            >
              <Trash2 className="icon icon-sm" aria-hidden="true" />
            </button>
          </div>
        ),
      )}
    </section>
  );
}
