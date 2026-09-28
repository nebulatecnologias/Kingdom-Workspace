"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ImageUp, Pencil, Trash2, X } from "lucide-react";
import { deleteBanner, saveBanner, setBannerActive } from "@/app/(admin)/admin/_actions/banners";
import type { FormResult } from "@/app/(admin)/admin/_actions/catalogue";
import { IntentLink } from "@/components/shell/intent-link";
import { keepValues } from "./keep-form";
import { toast } from "./toaster";
import { uploadBannerImage } from "./upload";

export type BannerRow = {
  id: string;
  title: string;
  body: string | null;
  ctaLabel: string | null;
  link: string | null;
  locale: "en" | "pt" | "es" | null;
  audience: "all" | "not_owner";
  productId: string | null;
  startsAt: string | null;
  endsAt: string | null;
  active: boolean;
  sortOrder: number;
  imagePath: string | null;
  imageMobilePath: string | null;
  imageUrl?: string;
  imageMobileUrl?: string;
  status: "live" | "scheduled" | "ended" | "off";
};

/** ISO time -> "2026-10-01T09:00" in the admin's own time zone, for a datetime-local input. */
function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function ImageSlot({ name, label, hint, path, url, error }: { name: string; label: string; hint: string; path: string | null; url?: string; error?: string }) {
  const t = useTranslations();
  const [value, setValue] = useState(path ?? "");
  const [preview, setPreview] = useState(url ?? "");
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const id = `bn-${name}`;
  return (
    <div className={error ? "field has-error" : "field"}>
      <span className="label" id={`${id}-label`}>
        {label}
      </span>
      <input type="hidden" name={name} value={value} />
      <div className="bn-slot">
        <span className="bn-thumb" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element -- a local preview or a short-lived signed URL */}
          {preview ? <img src={preview} alt="" /> : <ImageUp className="icon" />}
        </span>
        <input
          ref={input}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr"
          id={id}
          aria-labelledby={`${id}-label`}
          tabIndex={-1}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            setBusy(true);
            const up = await uploadBannerImage(file);
            setBusy(false);
            if (!up.ok) return toast(t(up.error), "error");
            setValue(up.path);
            setPreview(URL.createObjectURL(file));
          }}
        />
        <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => input.current?.click()}>
          <ImageUp className="icon icon-sm" aria-hidden="true" />
          {busy ? t("ed_uploading") : value ? t("bn_replace") : t("bn_upload")}
        </button>
        {value ? (
          <button
            type="button"
            className="icon-btn"
            aria-label={`${t("bn_remove")}: ${label}`}
            onClick={() => {
              setValue("");
              setPreview("");
            }}
          >
            <X className="icon icon-sm" aria-hidden="true" />
          </button>
        ) : null}
      </div>
      <span className="hint">{hint}</span>
      {error ? (
        <span className="error-text" role="alert">
          {t(error)}
        </span>
      ) : null}
    </div>
  );
}

export function BannerForm({ banner, products }: { banner?: BannerRow; products: { id: string; title: string }[] }) {
  const t = useTranslations();
  const [state, action] = useActionState(saveBanner, { status: "idle" } as FormResult);
  const err = state.fieldErrors ?? {};
  const [audience, setAudience] = useState<BannerRow["audience"]>(banner?.audience ?? "all");
  // Filled after hydration: the times are shown in the admin's own time zone, which the server doesn't know.
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [tz, setTz] = useState(0);
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- one-time sync with the browser's clock and zone */
    setStartsAt(toLocalInput(banner?.startsAt ?? null));
    setEndsAt(toLocalInput(banner?.endsAt ?? null));
    setTz(new Date().getTimezoneOffset());
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [banner?.startsAt, banner?.endsAt]);
  useEffect(() => {
    if (state.status === "saved") toast(t("saved"));
    if (state.status === "error" && state.message) toast(t(state.message), "error");
  }, [state, t]);
  const f = (name: string) => ({ "aria-invalid": err[name] ? true : undefined, "aria-describedby": err[name] ? `bn-${name}-error` : undefined });
  const fieldError = (name: string) =>
    err[name] ? (
      <span className="error-text" id={`bn-${name}-error`} role="alert">
        {t(err[name])}
      </span>
    ) : null;

  return (
    <form onSubmit={keepValues(action)} className="stack bn-form" noValidate>
      {banner ? <input type="hidden" name="id" value={banner.id} /> : null}
      <input type="hidden" name="tz" value={tz} />
      <div className="grid-2">
        <ImageSlot name="image_path" label={t("bn_image")} hint={t("bn_imageHint")} path={banner?.imagePath ?? null} url={banner?.imageUrl} error={err.image_path} />
        <ImageSlot
          name="image_mobile_path"
          label={t("bn_imageMobile")}
          hint={t("bn_imageMobileHint")}
          path={banner?.imageMobilePath ?? null}
          url={banner?.imageMobileUrl}
          error={err.image_mobile_path}
        />
      </div>
      <div className={err.title ? "field has-error" : "field"}>
        <label htmlFor="bn-title">{t("bn_title")}</label>
        <input className="input" id="bn-title" name="title" defaultValue={banner?.title} maxLength={120} required {...f("title")} />
        {fieldError("title") ?? <span className="hint">{t("bn_titleHint")}</span>}
      </div>
      <div className="field">
        <label htmlFor="bn-body">
          {t("bn_body")} ({t("optional")})
        </label>
        <textarea className="textarea" id="bn-body" name="body" defaultValue={banner?.body ?? ""} maxLength={280} rows={2} />
      </div>
      <div className="grid-2">
        <div className="field">
          <label htmlFor="bn-cta">
            {t("bn_cta")} ({t("optional")})
          </label>
          <input className="input" id="bn-cta" name="cta_label" defaultValue={banner?.ctaLabel ?? ""} maxLength={40} />
        </div>
        <div className={err.link ? "field has-error" : "field"}>
          <label htmlFor="bn-link">
            {t("bn_link")} ({t("optional")})
          </label>
          <input className="input" id="bn-link" name="link" defaultValue={banner?.link ?? ""} maxLength={500} inputMode="url" {...f("link")} />
          {fieldError("link") ?? <span className="hint">{t("bn_linkHint")}</span>}
        </div>
      </div>
      <div className="grid-2">
        <div className="field">
          <label htmlFor="bn-locale">{t("bn_locale")}</label>
          <select className="select" id="bn-locale" name="locale" defaultValue={banner?.locale ?? ""}>
            <option value="">{t("bn_allLocales")}</option>
            <option value="en">English</option>
            <option value="pt">Português</option>
            <option value="es">Español</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="bn-order">{t("bn_order")}</label>
          <input className="input tnum" id="bn-order" name="sort_order" type="number" min={0} max={999} defaultValue={banner?.sortOrder ?? 0} />
        </div>
      </div>
      <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="label">{t("bn_audience")}</legend>
        <label className="check">
          <input type="radio" name="audience" value="all" checked={audience === "all"} onChange={() => setAudience("all")} />
          {t("bn_audienceAll")}
        </label>
        <label className="check">
          <input type="radio" name="audience" value="not_owner" checked={audience === "not_owner"} onChange={() => setAudience("not_owner")} />
          {t("bn_audienceNotOwner")}
        </label>
      </fieldset>
      {audience === "not_owner" ? (
        <div className={err.product_id ? "field has-error" : "field"}>
          <label htmlFor="bn-product">{t("bn_product")}</label>
          <select className="select" id="bn-product" name="product_id" defaultValue={banner?.productId ?? ""} {...f("product_id")}>
            <option value="">—</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
          {fieldError("product_id")}
        </div>
      ) : null}
      <div className="grid-2">
        <div className={err.starts_at ? "field has-error" : "field"}>
          <label htmlFor="bn-start">
            {t("bn_starts")} ({t("optional")})
          </label>
          <input className="input" id="bn-start" name="starts_at" type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} {...f("starts_at")} />
          {fieldError("starts_at")}
        </div>
        <div className={err.ends_at ? "field has-error" : "field"}>
          <label htmlFor="bn-end">
            {t("bn_ends")} ({t("optional")})
          </label>
          <input className="input" id="bn-end" name="ends_at" type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} {...f("ends_at")} />
          {fieldError("ends_at")}
        </div>
      </div>
      <label className="check">
        <input type="checkbox" name="active" defaultChecked={banner?.active ?? true} />
        {t("bn_active")}
      </label>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button type="submit" className="btn btn-primary">
          {t(banner ? "save" : "bn_create")}
        </button>
        {banner ? (
          <IntentLink className="btn btn-ghost" href="/admin/banners">
            {t("cancel")}
          </IntentLink>
        ) : null}
      </div>
    </form>
  );
}

export function BannerActions({ id, title, active }: { id: string; title: string; active: boolean }) {
  const t = useTranslations();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [on, setOn] = useState(active);
  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, done: string) =>
    start(async () => {
      const r = await fn();
      toast(r.ok ? done : t(r.error ?? "err_generic"), r.ok ? "ok" : "error");
      router.refresh();
    });
  return (
    <span className="asset-btns">
      <label className="check" style={{ fontSize: 13.5 }}>
        {/* The name starts with the visible "On", so voice control users can say what they see. */}
        <input
          type="checkbox"
          checked={on}
          disabled={pending}
          aria-label={`${t("bn_on")}: ${title}`}
          onChange={(e) => {
            // Shown at once; put back if the save fails.
            const next = e.target.checked;
            setOn(next);
            run(async () => {
              const r = await setBannerActive(id, next);
              if (!r.ok) setOn(!next);
              return r;
            }, t("saved"));
          }}
        />
        {t("bn_on")}
      </label>
      <IntentLink className="btn btn-quiet btn-sm" href={`/admin/banners?edit=${id}`} aria-label={`${t("edit")}: ${title}`}>
        <Pencil className="icon icon-sm" aria-hidden="true" />
        {t("edit")}
      </IntentLink>
      <button
        type="button"
        className="btn btn-danger btn-sm"
        disabled={pending}
        aria-label={`${t("delete")}: ${title}`}
        onClick={() => {
          if (window.confirm(t("bn_deleteQ", { title }))) run(() => deleteBanner(id), t("bn_deleted"));
        }}
      >
        <Trash2 className="icon icon-sm" aria-hidden="true" />
      </button>
    </span>
  );
}
