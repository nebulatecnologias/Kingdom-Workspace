"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Download } from "lucide-react";

/** iPhone and iPad (iPadOS reports itself as a Mac with touch): Safari there blocks several downloads at once. */
function isIOS() {
  const ua = navigator.userAgent;
  return /iP(hone|ad|od)/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

/**
 * "Download everything": every material of the product, ZIPs and loose files alike, one after another.
 * Each file goes through the download route (access check, then a short-lived signed link), so nothing
 * is exposed that a single download would not expose. Browsers ask once before allowing several downloads.
 */
export function DownloadAll({ productId, fileIds, sizeLabel, primary }: { productId: string; fileIds: string[]; sizeLabel: string; primary: boolean }) {
  const t = useTranslations();
  const [state, setState] = useState<{ n: number } | "done" | "ios" | null>(null);

  const start = async () => {
    if (isIOS()) {
      setState("ios");
      document.getElementById("materials")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    for (const [i, id] of fileIds.entries()) {
      setState({ n: i + 1 });
      const a = document.createElement("a");
      a.href = `/api/products/${productId}/download?asset=${id}`;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      // A pause between files keeps browsers from dropping downloads started in the same instant.
      if (i < fileIds.length - 1) await new Promise((r) => setTimeout(r, 1200));
    }
    setState("done");
  };

  const busy = state !== null && typeof state === "object";
  return (
    <>
      <button type="button" className={primary ? "btn btn-primary btn-lg" : "btn btn-quiet btn-lg"} onClick={start} disabled={busy}>
        <Download className="icon" aria-hidden="true" />
        {t("dl_all")}
      </button>
      <span className="muted" style={{ alignSelf: "center", fontSize: 13.5 }}>
        {sizeLabel}
      </span>
      {/* Always present so screen readers announce the progress; visually hidden while empty. */}
      <p className={state ? "muted" : "sr"} role="status" style={{ flexBasis: "100%", fontSize: 13.5, margin: 0 }}>
        {busy
          ? `${t("dl_progress", { n: state.n, total: fileIds.length })} ${t("dl_allow")}`
          : state === "done"
            ? t("dl_doneAll", { total: fileIds.length })
            : state === "ios"
              ? t("dl_ios")
              : ""}
      </p>
    </>
  );
}
