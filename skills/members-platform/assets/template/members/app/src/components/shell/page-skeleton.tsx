import { getTranslations } from "next-intl/server";

/**
 * Shown the instant a link is tapped, while the next page loads on the server. Without it the
 * old page stays on screen with no sign the tap worked, which on a phone feels like a frozen app.
 */
export async function PageSkeleton({ variant = "grid" }: { variant?: "grid" | "detail" | "list" }) {
  const t = await getTranslations();
  return (
    <div className="skeleton-page" aria-busy="true">
      <p className="sr" role="status">{t("loading_page")}</p>
      <div className="page-head" aria-hidden="true">
        <div>
          <div className="sk sk-title" />
          <div className="sk sk-line" style={{ width: "min(340px, 70%)" }} />
        </div>
      </div>
      {variant === "grid" ? (
        <div className="lib-grid" aria-hidden="true">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="sk sk-card" />
          ))}
        </div>
      ) : variant === "detail" ? (
        <div className="pack-hero" aria-hidden="true">
          <div className="sk cover-lg" />
          <div>
            <div className="sk sk-line" style={{ width: "40%" }} />
            <div className="sk sk-title" />
            <div className="sk sk-line" />
            <div className="sk sk-line" style={{ width: "85%" }} />
            <div className="sk sk-button" />
          </div>
        </div>
      ) : (
        <div className="card" aria-hidden="true" style={{ padding: 18 }}>
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="sk sk-row" />
          ))}
        </div>
      )}
    </div>
  );
}
