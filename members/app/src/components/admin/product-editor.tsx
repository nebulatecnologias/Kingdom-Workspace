"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowDown, ArrowUp, BookOpen, FileArchive, FileText, Headphones, Image as ImageIcon, ImageUp, Plus, Trash2, Upload } from "lucide-react";
import { deleteProduct, saveDetails, saveSales, type FormResult } from "@/app/(admin)/admin/_actions/catalogue";
import { addAssets, addPages, deleteAsset, deletePage, movePage, reorderAssets, saveAssets, saveChapters, savePages, setCover, type ContentResult } from "@/app/(admin)/admin/_actions/content";
import { Art } from "@/components/catalogue/art";
import { Notice } from "@/components/ui/notice";
import { toast } from "./toaster";
import { makePreview, titleFromFileName, uploadToStorage } from "./upload";
import { keepValues } from "./keep-form";

type Locale = "en" | "pt" | "es";
export const PRODUCT_FORM = "product-form";

function useSaved(state: FormResult | ContentResult) {
  const t = useTranslations();
  useEffect(() => {
    if (state.status === "saved") toast(t("saved"));
    if (state.status === "error" && "message" in state && state.message) toast(t(state.message), "error");
  }, [state, t]);
}

function FieldError({ id, error }: { id: string; error?: string }) {
  const t = useTranslations();
  return error ? (
    <span className="error-text" id={`${id}-error`} role="alert">
      {t(error)}
    </span>
  ) : null;
}

// ---------------------------------------------------------------------------
// Details
// ---------------------------------------------------------------------------
export function DetailsForm(props: {
  id: string;
  locale: Locale;
  type: string;
  sectionId: string | null;
  sections: { id: string; name: string }[];
  slug: string;
  fieldColour: string;
  text: { title: string; description: string; verse: string; verseRef: string };
}) {
  const t = useTranslations();
  const [state, action] = useActionState(saveDetails, { status: "idle" } as FormResult);
  useSaved(state);
  const err = state.fieldErrors ?? {};
  const [colour, setColour] = useState(props.fieldColour);
  const f = (name: string) => ({ "aria-invalid": err[name] ? true : undefined, "aria-describedby": err[name] ? `ed-${name}-error` : undefined });
  return (
    <form id={PRODUCT_FORM} onSubmit={keepValues(action)} className="stack" noValidate>
      <input type="hidden" name="id" value={props.id} />
      <input type="hidden" name="locale" value={props.locale} />
      <div className="grid-2">
        <div className="field">
          <label htmlFor="ed-type">{t("ed_type")}</label>
          <select className="select" id="ed-type" name="type" defaultValue={props.type}>
            {(["colouring", "book", "guide", "workbook", "kit"] as const).map((ty) => (
              <option key={ty} value={ty}>
                {t(`type_${ty}`)}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="ed-sec">{t("ed_section")}</label>
          <select className="select" id="ed-sec" name="section" defaultValue={props.sectionId ?? ""}>
            <option value="">{t("sc_noSection")}</option>
            {props.sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className={err.title ? "field has-error" : "field"}>
        <label htmlFor="ed-title">
          {t("ed_title")}
          {props.locale === "en" ? "" : ` (${t("optional")})`}
        </label>
        <input className="input" id="ed-title" name="title" defaultValue={props.text.title} maxLength={120} {...f("title")} />
        {err.title ? <FieldError id="ed-title" error={err.title} /> : props.locale !== "en" ? <span className="hint">{t("ed_fallbackHint")}</span> : null}
      </div>
      <div className="field">
        <label htmlFor="ed-desc">{t("ed_desc")}</label>
        <textarea className="textarea" id="ed-desc" name="description" defaultValue={props.text.description} maxLength={2000} />
      </div>
      <div className="grid-2">
        <div className="field">
          <label htmlFor="ed-verse">{t("ed_verse")}</label>
          <input className="input" id="ed-verse" name="verse" defaultValue={props.text.verse} maxLength={300} />
        </div>
        <div className="field">
          <label htmlFor="ed-ref">{t("ed_verseRef")}</label>
          <input className="input" id="ed-ref" name="verse_ref" defaultValue={props.text.verseRef} maxLength={60} />
        </div>
      </div>
      <div className="grid-2">
        <div className={err.slug ? "field has-error" : "field"}>
          <label htmlFor="ed-slug">{t("ed_slug")}</label>
          <input className="input" id="ed-slug" name="slug" defaultValue={props.slug} maxLength={60} style={{ fontFamily: "ui-monospace, Menlo, Consolas, monospace" }} {...f("slug")} />
          {err.slug ? <FieldError id="ed-slug" error={err.slug} /> : <span className="hint">{t("ed_slugHint", { slug: props.slug })}</span>}
        </div>
        <div className={err.field_colour ? "field has-error" : "field"}>
          <label htmlFor="ed-colour">{t("ed_colour")}</label>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="color" aria-label={t("ed_colour")} value={colour} onChange={(e) => setColour(e.target.value)} style={{ width: 48, height: 48, border: 0, background: "none", padding: 0, flex: "none" }} />
            <input className="input tnum" id="ed-colour" name="field_colour" value={colour} onChange={(e) => setColour(e.target.value)} maxLength={7} {...f("field_colour")} />
          </div>
          <FieldError id="ed-field_colour" error={err.field_colour} />
        </div>
      </div>
    </form>
  );
}

export function CoverUpload({ productId, coverPath, coverUrl, fieldColour }: { productId: string; coverPath: string | null; coverUrl?: string; fieldColour: string }) {
  const t = useTranslations();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className="field">
      <span className="label">{t("ed_cover")}</span>
      <div className="bought" style={{ padding: 10 }}>
        <span className="mini" style={{ width: 64, height: 64, background: fieldColour }} aria-hidden="true">
          <Art path={coverPath} url={coverUrl} />
        </span>
        <span className="hint" style={{ flex: 1 }}>
          {t("ed_coverHint")}
        </span>
        <input
          ref={input}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr"
          id="ed-cover-file"
          aria-label={t("ed_cover")}
          tabIndex={-1}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            setBusy(true);
            const up = await uploadToStorage(productId, "cover", file);
            const r = up.ok ? await setCover(productId, up.path) : up;
            setBusy(false);
            toast(r.ok ? t("saved") : t(r.error), r.ok ? "ok" : "error");
            if (r.ok) router.refresh();
          }}
        />
        <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => input.current?.click()}>
          <ImageUp className="icon icon-sm" aria-hidden="true" />
          {busy ? t("ed_uploading") : t("ed_coverUpload")}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sales & access
// ---------------------------------------------------------------------------
export function SalesForm(props: { id: string; priceCents: number; access: "paid" | "free"; gatewayProductId: string | null; checkoutUrl: string | null; visibility: string; intlTag: string }) {
  const t = useTranslations();
  const [state, action] = useActionState(saveSales, { status: "idle" } as FormResult);
  useSaved(state);
  const err = state.fieldErrors ?? {};
  const [vis, setVis] = useState(props.visibility);
  const price = new Intl.NumberFormat(props.intlTag, { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false }).format(props.priceCents / 100);
  const f = (name: string) => ({ "aria-invalid": err[name] ? true : undefined, "aria-describedby": err[name] ? `ed-${name}-error` : `ed-${name}-hint` });
  return (
    <form id={PRODUCT_FORM} onSubmit={keepValues(action)} className="stack" noValidate>
      <input type="hidden" name="id" value={props.id} />
      <div className="grid-2">
        <div className={err.price ? "field has-error" : "field"}>
          <label htmlFor="ed-price">{t("ed_price")}</label>
          <input className="input tnum" id="ed-price" name="price" inputMode="decimal" defaultValue={price} {...f("price")} />
          <FieldError id="ed-price" error={err.price} />
        </div>
        <div className="field">
          <label htmlFor="ed-access">{t("ed_access")}</label>
          <select className="select" id="ed-access" name="access" defaultValue={props.access}>
            <option value="paid">{t("acc_paid")}</option>
            <option value="free">{t("acc_free")}</option>
          </select>
        </div>
      </div>
      <div className={err.gateway_product_id ? "field has-error" : "field"}>
        <label htmlFor="ed-gateway_product_id">{t("ed_gid")}</label>
        <input className="input" id="ed-gateway_product_id" name="gateway_product_id" defaultValue={props.gatewayProductId ?? ""} placeholder="prod_…" style={{ fontFamily: "ui-monospace, Menlo, Consolas, monospace" }} {...f("gateway_product_id")} />
        {err.gateway_product_id ? <FieldError id="ed-gateway_product_id" error={err.gateway_product_id} /> : <span className="hint" id="ed-gateway_product_id-hint">{t("ed_gidP")}</span>}
      </div>
      <div className={err.checkout_url ? "field has-error" : "field"}>
        <label htmlFor="ed-checkout_url">{t("ed_checkout")}</label>
        <input className="input" id="ed-checkout_url" name="checkout_url" type="url" defaultValue={props.checkoutUrl ?? ""} placeholder="https://" {...f("checkout_url")} />
        {err.checkout_url ? <FieldError id="ed-checkout_url" error={err.checkout_url} /> : <span className="hint" id="ed-checkout_url-hint">{t("ed_checkoutP")}</span>}
      </div>
      <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="label" style={{ marginBottom: 8 }}>
          {t("ed_visibility")}
        </legend>
        <input type="hidden" name="visibility" value={vis} />
        <div className="seg" style={{ width: "fit-content" }}>
          {(["visible", "soon", "hidden"] as const).map((v) => (
            <button key={v} type="button" aria-pressed={vis === v} onClick={() => setVis(v)}>
              {t(`vis_${v}`)}
            </button>
          ))}
        </div>
        <span className="hint" style={{ marginTop: 6 }}>
          {t(`vis_${vis}_hint`)}
        </span>
      </fieldset>
    </form>
  );
}

export function DeleteProduct({ id, title, inUse }: { id: string; title: string; inUse: boolean }) {
  const t = useTranslations();
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <section className="card card-pad stack" style={{ gap: 10 }} aria-labelledby="danger-title">
      <h2 id="danger-title" style={{ fontSize: 16 }}>
        {t("ed_deleteTitle")}
      </h2>
      <p className="hint">{inUse ? t("ed_deleteInUse") : t("ed_deleteHint")}</p>
      <div>
        <button
          type="button"
          className="btn btn-danger btn-sm"
          disabled={pending || inUse}
          onClick={() => {
            if (!window.confirm(t("ed_deleteQ", { title }))) return;
            start(async () => {
              const r = await deleteProduct(id);
              if (r.ok) {
                toast(t("ed_deleted"));
                router.push("/admin/showcase");
              } else toast(t(r.error), "error");
            });
          }}
        >
          <Trash2 className="icon icon-sm" aria-hidden="true" />
          {t("ed_delete")}
        </button>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Content: printable pages
// ---------------------------------------------------------------------------
export type PageRow = { position: number; title: string; previewPath: string | null; lineartPath: string | null; previewUrl?: string };

export function PagesEditor({ productId, locale, pages, pageCount }: { productId: string; locale: Locale; pages: PageRow[]; pageCount: number }) {
  const t = useTranslations();
  const router = useRouter();
  const [state, action] = useActionState(savePages, { status: "idle" } as ContentResult);
  useSaved(state);
  const [progress, setProgress] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const [pending, start] = useTransition();
  const input = useRef<HTMLInputElement>(null);

  const upload = async (files: File[]) => {
    const images = files.filter((f) => /^image\/(png|jpeg|webp)$/.test(f.type));
    if (!images.length) return toast(t("err_image_type"), "error");
    const added: { path: string; previewPath: string | null; title: string }[] = [];
    for (const [i, file] of images.entries()) {
      setProgress(t("ed_uploadingN", { n: i + 1, total: images.length }));
      const up = await uploadToStorage(productId, "page", file);
      if (!up.ok) {
        toast(`${file.name}: ${t(up.error)}`, "error");
        continue;
      }
      const preview = await makePreview(file);
      const pv = preview ? await uploadToStorage(productId, "preview", preview) : null;
      added.push({ path: up.path, previewPath: pv?.ok ? pv.path : null, title: titleFromFileName(file.name) });
    }
    if (added.length) {
      const r = await addPages(productId, added);
      toast(r.ok ? t("ed_pagesAdded", { n: added.length }) : t(r.error), r.ok ? "ok" : "error");
      router.refresh();
    }
    setProgress(null);
  };

  const act = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => {
      const r = await fn();
      if (!r.ok) toast(t(r.error ?? "err_generic"), "error");
      router.refresh();
    });

  return (
    <form id={PRODUCT_FORM} onSubmit={keepValues(action)} className="stack">
      <input type="hidden" name="id" value={productId} />
      <input type="hidden" name="locale" value={locale} />
      <div
        className={over ? "dropzone over" : "dropzone"}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          void upload([...e.dataTransfer.files]);
        }}
      >
        <Upload className="icon" aria-hidden="true" />
        <b style={{ color: "var(--ink)", fontWeight: 500 }}>{progress ?? t("ed_drop")}</b>
        <span style={{ fontSize: 13.5 }}>{t("ed_dropP")}</span>
        <input ref={input} type="file" multiple accept="image/png,image/jpeg,image/webp" className="sr" id="ed-pages-file" aria-label={t("ed_drop")} tabIndex={-1} onChange={(e) => {
          const files = [...(e.target.files ?? [])];
          e.target.value = "";
          void upload(files);
        }} />
        <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 6 }} disabled={!!progress} onClick={() => input.current?.click()}>
          {t("ed_browse")}
        </button>
      </div>
      <div className="grid-2">
        <p className="hint" style={{ alignSelf: "center" }}>
          {t("ed_pagesCount", { n: pages.length })}
        </p>
        <div className="field">
          <label htmlFor="ed-page-count">{t("ed_pageTotal")}</label>
          <input className="input tnum" id="ed-page-count" name="page_count" type="number" min={pages.length} max={10000} defaultValue={Math.max(pageCount, pages.length)} aria-describedby="ed-page-count-hint" />
          <span className="hint" id="ed-page-count-hint">
            {t("ed_pageTotalHint")}
          </span>
        </div>
      </div>
      {pages.length ? (
        <ol className="stack" style={{ gap: 8, listStyle: "none", padding: 0, margin: 0 }}>
          {pages.map((p, i) => (
            <li key={p.position} className="bought" style={{ padding: 8, gap: 10 }}>
              <span className="mini" style={{ width: 48, height: 64, background: "#fff", border: "1px solid var(--line)" }} aria-hidden="true">
                <Art path={p.lineartPath ?? p.previewPath} url={p.previewUrl} mode="line" />
              </span>
              <span className="toc-n tnum" aria-hidden="true">
                {p.position}
              </span>
              <label className="sr" htmlFor={`pg-${p.position}`}>
                {t("page", { n: p.position })}
              </label>
              <input className="input" id={`pg-${p.position}`} name={`page_${p.position}`} defaultValue={p.title} maxLength={120} style={{ flex: 1, minWidth: 0 }} />
              <button type="button" className="icon-btn" style={{ width: 34, height: 34 }} disabled={pending || i === 0} aria-label={`${t("moveUp")}: ${t("page", { n: p.position })}`} onClick={() => act(() => movePage(productId, p.position, p.position - 1))}>
                <ArrowUp className="icon icon-sm" aria-hidden="true" />
              </button>
              <button type="button" className="icon-btn" style={{ width: 34, height: 34 }} disabled={pending || i === pages.length - 1} aria-label={`${t("moveDown")}: ${t("page", { n: p.position })}`} onClick={() => act(() => movePage(productId, p.position, p.position + 1))}>
                <ArrowDown className="icon icon-sm" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="icon-btn"
                style={{ width: 34, height: 34 }}
                disabled={pending}
                aria-label={`${t("delete")}: ${t("page", { n: p.position })}`}
                onClick={() => window.confirm(t("ed_deletePageQ", { n: p.position })) && act(() => deletePage(productId, p.position))}
              >
                <Trash2 className="icon icon-sm" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ol>
      ) : null}
    </form>
  );
}

// ---------------------------------------------------------------------------
// Materials: any number of files (PDF, EPUB, images, audio, ZIP). Owning the product opens all of them.
// ---------------------------------------------------------------------------
export type AssetKind = "pdf" | "epub" | "image" | "audio" | "zip";
export type AssetRow = { id: string; kind: AssetKind; title: string; locale: Locale | null; size: string | null; duration: string | null };

const ASSET_ICON = { pdf: FileText, epub: BookOpen, image: ImageIcon, audio: Headphones, zip: FileArchive } as const;
const ASSET_ACCEPT = ".pdf,.epub,.png,.jpg,.jpeg,.webp,.mp3,.m4a,.zip,application/pdf,application/epub+zip,image/png,image/jpeg,image/webp,audio/mpeg,audio/mp4,application/zip";

/** The one content type the bucket accepts for each file, whatever the browser reports (e.g. "audio/x-m4a"). */
function assetType(file: File) {
  const ext = file.name.slice(file.name.lastIndexOf(".") + 1).toLowerCase();
  const byExt: Record<string, string> = {
    pdf: "application/pdf",
    epub: "application/epub+zip",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    mp3: "audio/mpeg",
    m4a: "audio/mp4",
    zip: "application/zip",
  };
  return byExt[ext] ?? null;
}

/** Length of an audio file in seconds, read in the browser (null when it can't be read). */
function audioDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    const done = (v: number | null) => {
      URL.revokeObjectURL(url);
      resolve(v);
    };
    audio.preload = "metadata";
    audio.onloadedmetadata = () => done(Number.isFinite(audio.duration) ? Math.round(audio.duration) : null);
    audio.onerror = () => done(null);
    setTimeout(() => done(null), 10_000);
    audio.src = url;
  });
}

export function MaterialsEditor({ productId, assets }: { productId: string; assets: AssetRow[] }) {
  const t = useTranslations();
  const router = useRouter();
  const [state, action] = useActionState(saveAssets, { status: "idle" } as ContentResult);
  useSaved(state);
  const [progress, setProgress] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const [uploadLang, setUploadLang] = useState<"all" | Locale>("all");
  const [pending, start] = useTransition();
  const input = useRef<HTMLInputElement>(null);

  const upload = async (files: File[]) => {
    if (!files.length) return;
    const added: { path: string; title: string; durationSeconds: number | null }[] = [];
    for (const [i, file] of files.entries()) {
      setProgress(t("ed_uploadingN", { n: i + 1, total: files.length }));
      const type = assetType(file);
      if (!type) {
        toast(`${file.name}: ${t("err_file_type")}`, "error");
        continue;
      }
      const up = await uploadToStorage(productId, "asset", file.type === type ? file : new Blob([file], { type }));
      if (!up.ok) {
        toast(`${file.name}: ${t(up.error)}`, "error");
        continue;
      }
      added.push({ path: up.path, title: titleFromFileName(file.name), durationSeconds: type.startsWith("audio/") ? await audioDuration(file) : null });
    }
    if (added.length) {
      const r = await addAssets(productId, uploadLang, added);
      toast(r.ok ? t("ma_added", { n: added.length }) : t(r.error), r.ok ? "ok" : "error");
      router.refresh();
    }
    setProgress(null);
  };

  const act = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => {
      const r = await fn();
      if (!r.ok) toast(t(r.error ?? "err_generic"), "error");
      router.refresh();
    });
  const move = (i: number, by: -1 | 1) => {
    const ids = assets.map((a) => a.id);
    [ids[i], ids[i + by]] = [ids[i + by], ids[i]];
    act(() => reorderAssets(productId, ids));
  };
  const name = (a: AssetRow) => a.title || t(`kind_${a.kind}`);
  const langOptions = (
    <>
      <option value="all">{t("ma_allLangs")}</option>
      {(["en", "pt", "es"] as const).map((l) => (
        <option key={l} value={l}>
          {t(`lang_${l}`)}
        </option>
      ))}
    </>
  );

  return (
    <form id={PRODUCT_FORM} onSubmit={keepValues(action)} className="stack">
      <input type="hidden" name="id" value={productId} />
      <div
        className={over ? "dropzone over" : "dropzone"}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          void upload([...e.dataTransfer.files]);
        }}
      >
        <Upload className="icon" aria-hidden="true" />
        <b style={{ color: "var(--ink)", fontWeight: 500 }}>{progress ?? t("ma_drop")}</b>
        <span style={{ fontSize: 13.5 }}>{t("ma_dropP")}</span>
        <input
          ref={input}
          type="file"
          multiple
          accept={ASSET_ACCEPT}
          className="sr"
          id="ed-assets-file"
          aria-label={t("ma_drop")}
          tabIndex={-1}
          onChange={(e) => {
            const files = [...(e.target.files ?? [])];
            e.target.value = "";
            void upload(files);
          }}
        />
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "center", marginTop: 6 }}>
          <label className="sr" htmlFor="ed-assets-lang">
            {t("ma_uploadLang")}
          </label>
          <select className="select" id="ed-assets-lang" style={{ width: "auto", height: 34 }} value={uploadLang} onChange={(e) => setUploadLang(e.target.value as "all" | Locale)} disabled={!!progress}>
            {langOptions}
          </select>
          <button type="button" className="btn btn-ghost btn-sm" disabled={!!progress} onClick={() => input.current?.click()}>
            {t("ed_browse")}
          </button>
        </div>
      </div>
      <p className="hint">{t("ma_hint")}</p>
      {assets.length ? (
        <ol className="stack" style={{ gap: 8, listStyle: "none", padding: 0, margin: 0 }}>
          {assets.map((a, i) => {
            const Icon = ASSET_ICON[a.kind];
            return (
              <li key={a.id} className="bought asset-row" style={{ padding: 8, gap: 10 }}>
                <span className="mini" style={{ width: 40, height: 40, background: "var(--orange-soft)", color: "var(--orange-ink)" }} aria-hidden="true">
                  <Icon className="icon" />
                </span>
                <span className="asset-fields">
                  <label className="sr" htmlFor={`as-t-${a.id}`}>
                    {t("ma_title")}: {t(`kind_${a.kind}`)} {i + 1}
                  </label>
                  <input className="input" id={`as-t-${a.id}`} name={`title_${a.id}`} defaultValue={a.title} placeholder={t(`kind_${a.kind}`)} maxLength={150} />
                  <span className="hint tnum">{[t(`kind_${a.kind}`), a.duration, a.size].filter(Boolean).join(" · ")}</span>
                </span>
                <label className="sr" htmlFor={`as-l-${a.id}`}>
                  {t("ma_lang")}: {name(a)}
                </label>
                <select className="select asset-lang" id={`as-l-${a.id}`} name={`locale_${a.id}`} defaultValue={a.locale ?? "all"}>
                  {langOptions}
                </select>
                <span className="asset-btns">
                  <button type="button" className="icon-btn" style={{ width: 34, height: 34 }} disabled={pending || i === 0} aria-label={`${t("moveUp")}: ${name(a)}`} onClick={() => move(i, -1)}>
                    <ArrowUp className="icon icon-sm" aria-hidden="true" />
                  </button>
                  <button type="button" className="icon-btn" style={{ width: 34, height: 34 }} disabled={pending || i === assets.length - 1} aria-label={`${t("moveDown")}: ${name(a)}`} onClick={() => move(i, 1)}>
                    <ArrowDown className="icon icon-sm" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    style={{ width: 34, height: 34 }}
                    disabled={pending}
                    aria-label={`${t("delete")}: ${name(a)}`}
                    onClick={() => window.confirm(t("ma_deleteQ", { title: name(a) })) && act(() => deleteAsset(productId, a.id))}
                  >
                    <Trash2 className="icon icon-sm" aria-hidden="true" />
                  </button>
                </span>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="hint">{t("ma_empty")}</p>
      )}
    </form>
  );
}

// ---------------------------------------------------------------------------
// Content: chapters for one language
// ---------------------------------------------------------------------------
export type ChapterRow = { title: string; body: string; sample: boolean; minutes: number | null };

let nextKey = 1;

export function ChaptersEditor(props: { productId: string; locale: Locale; chapters: ChapterRow[]; pageCount: number; type: string; fallback: boolean }) {
  const t = useTranslations();
  const [state, action] = useActionState(saveChapters, { status: "idle" } as ContentResult);
  useSaved(state);
  const [list, setList] = useState(() => props.chapters.map((c) => ({ ...c, key: nextKey++ })));
  const [open, setOpen] = useState<number | null>(null);

  const move = (i: number, d: number) =>
    setList((l) => {
      const next = [...l];
      [next[i], next[i + d]] = [next[i + d], next[i]];
      return next;
    });
  const patch = (key: number, p: Partial<ChapterRow>) => setList((l) => l.map((c) => (c.key === key ? { ...c, ...p } : c)));
  const unit = props.type === "guide" ? "step" : "chapter";

  return (
    <form id={PRODUCT_FORM} onSubmit={keepValues(action)} className="stack">
      <input type="hidden" name="id" value={props.productId} />
      <input type="hidden" name="locale" value={props.locale} />
      <input type="hidden" name="chapters" value={JSON.stringify(list.map(({ title, body, sample }) => ({ title, body, sample })))} />
      {props.fallback ? <Notice tone="info">{t("ed_chaptersFallback")}</Notice> : null}
      <div className="field">
        <span className="label">{t("ed_chapters")}</span>
        <span className="hint">{t("ed_sampleHint")}</span>
        {list.length ? (
          <ol className="stack" style={{ gap: 8, listStyle: "none", padding: 0, margin: 0 }}>
            {list.map((c, i) => (
              <li key={c.key} className="card" style={{ padding: 10, display: "grid", gap: 8, boxShadow: "none" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span className="toc-n tnum" aria-hidden="true">
                    {i + 1}
                  </span>
                  <label className="sr" htmlFor={`ch-${c.key}`}>
                    {t(unit === "step" ? "ed_stepTitle" : "ed_chapterTitle", { n: i + 1 })}
                  </label>
                  <input className="input" id={`ch-${c.key}`} value={c.title} maxLength={150} required onChange={(e) => patch(c.key, { title: e.target.value })} style={{ flex: 1, minWidth: 0 }} />
                  <button type="button" className="icon-btn" style={{ width: 34, height: 34 }} disabled={i === 0} aria-label={`${t("moveUp")}: ${c.title}`} onClick={() => move(i, -1)}>
                    <ArrowUp className="icon icon-sm" aria-hidden="true" />
                  </button>
                  <button type="button" className="icon-btn" style={{ width: 34, height: 34 }} disabled={i === list.length - 1} aria-label={`${t("moveDown")}: ${c.title}`} onClick={() => move(i, 1)}>
                    <ArrowDown className="icon icon-sm" aria-hidden="true" />
                  </button>
                  <button type="button" className="icon-btn" style={{ width: 34, height: 34 }} aria-label={`${t("delete")}: ${c.title}`} onClick={() => window.confirm(t("ed_deleteChapterQ", { title: c.title || i + 1 })) && setList((l) => l.filter((x) => x.key !== c.key))}>
                    <Trash2 className="icon icon-sm" aria-hidden="true" />
                  </button>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", paddingLeft: 4 }}>
                  <label className="check" style={{ fontSize: 13.5 }}>
                    <input type="checkbox" checked={c.sample} onChange={(e) => patch(c.key, { sample: e.target.checked })} />
                    {t("ed_isSample")}
                  </label>
                  {c.minutes ? <span className="hint tnum">{t("min_read", { n: c.minutes })}</span> : null}
                  <button type="button" className="btn btn-quiet btn-sm" aria-expanded={open === c.key} aria-controls={`body-${c.key}`} onClick={() => setOpen(open === c.key ? null : c.key)}>
                    {open === c.key ? t("ed_hideText") : t("ed_editText")}
                  </button>
                </div>
                {open === c.key ? (
                  <div className="field" id={`body-${c.key}`}>
                    <label htmlFor={`chb-${c.key}`}>{t("ed_chapterText")}</label>
                    <textarea className="textarea" id={`chb-${c.key}`} rows={14} value={c.body} onChange={(e) => patch(c.key, { body: e.target.value })} aria-describedby={`chh-${c.key}`} style={{ fontFamily: "ui-monospace, Menlo, Consolas, monospace", fontSize: 14 }} />
                    <span className="hint" id={`chh-${c.key}`}>
                      {t("ed_markdownHint")}
                    </span>
                  </div>
                ) : null}
              </li>
            ))}
          </ol>
        ) : (
          <p className="hint">{t("ed_noChapters")}</p>
        )}
        <div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              const key = nextKey++;
              setList((l) => [...l, { key, title: "", body: "", sample: false, minutes: null }]);
              setOpen(key);
              requestAnimationFrame(() => document.getElementById(`ch-${key}`)?.focus());
            }}
          >
            <Plus className="icon icon-sm" aria-hidden="true" />
            {t(unit === "step" ? "ed_addStep" : "ed_addChapter")}
          </button>
        </div>
      </div>
      <div className="field" style={{ maxWidth: 260 }}>
        <label htmlFor="ed-page-count">{t("ed_printedPages")}</label>
        <input className="input tnum" id="ed-page-count" name="page_count" type="number" min={0} max={10000} defaultValue={props.pageCount} />
      </div>
    </form>
  );
}
