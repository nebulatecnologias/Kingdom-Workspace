import type { Metadata } from "next";
import { IntentLink as Link } from "@/components/shell/intent-link";
import { getLocale, getTranslations } from "next-intl/server";
import { ChevronRight, Search, Users } from "lucide-react";
import { MiniCover } from "@/components/admin/cover";
import { Avatar } from "@/components/shell/app-shell";
import { toLocale } from "@/i18n/config";
import { adminContext } from "@/lib/admin/context";
import { adminProducts, listMembers } from "@/lib/admin/queries";
import { relativeDays, shortDate } from "@/lib/admin/time";
import { signedImageUrls } from "@/lib/media";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("mem_title") };
}

export default async function MembersPage({ searchParams }: PageProps<"/admin/members">) {
  const { db } = await adminContext("/admin/members");
  const sp = await searchParams;
  const t = await getTranslations();
  const intlTag = await getLocale();
  const q = typeof sp.q === "string" ? sp.q.slice(0, 80) : "";
  const [{ rows, total }, products] = await Promise.all([listMembers(db, { q }), adminProducts(db, toLocale(intlTag))]);
  const covers = await signedImageUrls(products.map((p) => p.coverPath));
  const byId = new Map(products.map((p) => [p.id, p]));

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t("mem_title")}</h1>
          <p>{t("mem_lead")}</p>
        </div>
      </div>
      <section className="card">
        <div className="toolbar">
          <span className="muted tnum" style={{ fontSize: 14 }}>
            {rows.length} / {total}
          </span>
          <form className="mini-search" role="search" action="/admin/members">
            <Search className="icon icon-sm" aria-hidden="true" />
            <label className="sr" htmlFor="mem-search">
              {t("searchMembers")}
            </label>
            <input id="mem-search" name="q" type="search" defaultValue={q} placeholder={t("searchMembers")} />
          </form>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>{t("th_member")}</th>
                <th>{t("th_packs")}</th>
                <th>{t("th_lang")}</th>
                <th>{t("th_joined")}</th>
                <th>{t("th_lastSeen")}</th>
                <th>{t("th_status")}</th>
                <th>
                  <span className="sr">{t("th_actions")}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((m) => (
                  <tr key={m.id} className="clickable">
                    <td>
                      <div className="cell-person">
                        <Avatar name={m.fullName || m.email} size={34} />
                        <div>
                          <b>
                            <Link className="row-link" href={`/admin/members/${m.id}`}>
                              {m.fullName || m.email}
                            </Link>
                          </b>
                          <span>{m.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="stack-covers">
                        {m.productIds.slice(0, 4).map((id) => {
                          const p = byId.get(id);
                          return p ? <MiniCover key={id} className="mini-cover" path={p.coverPath} url={covers.get(p.coverPath ?? "")} colour={p.fieldColour} /> : null;
                        })}
                        <span className="muted tnum">
                          {m.productIds.length}
                          <span className="sr"> {t("th_packs")}</span>
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="pill pill-grey">{m.locale.toUpperCase()}</span>
                    </td>
                    <td className="muted tnum" style={{ whiteSpace: "nowrap" }}>{shortDate(m.createdAt, intlTag)}</td>
                    <td className="muted" style={{ whiteSpace: "nowrap" }}>{relativeDays(m.lastSeenAt, intlTag) ?? "—"}</td>
                    <td>
                      <div className="filters" style={{ flexWrap: "nowrap" }}>
                        {m.status === "active" ? (
                          <span className="pill pill-soft-green">
                            <span className="dot" />
                            {t("active")}
                          </span>
                        ) : (
                          <span className="pill pill-grey">
                            <span className="dot" />
                            {t("deactivated")}
                          </span>
                        )}
                        {m.role === "admin" ? <span className="pill pill-violet">{t("role_admin")}</span> : null}
                      </div>
                    </td>
                    <td style={{ textAlign: "right", color: "var(--faint)" }}>
                      <ChevronRight className="icon icon-sm" aria-hidden="true" />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7}>
                    <div className="empty">
                      <Users className="icon" aria-hidden="true" />
                      <p>{q ? t("empty_search", { q }) : t("mem_empty")}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
