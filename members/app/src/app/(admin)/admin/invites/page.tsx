import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Mail, Search } from "lucide-react";
import { InviteActions } from "@/components/admin/invite-actions";
import { InvitePill } from "@/components/admin/invite-pill";
import { NewInviteDrawer } from "@/components/admin/new-invite";
import { Avatar } from "@/components/shell/app-shell";
import { toLocale } from "@/i18n/config";
import { adminContext } from "@/lib/admin/context";
import { adminProducts, listInvites, type InviteStatus } from "@/lib/admin/queries";
import { shortDate, timeLeft, withinADay } from "@/lib/admin/time";
import { signedImageUrls } from "@/lib/media";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("inv_ad_title") };
}

const FILTERS = ["all", "sent", "opened", "accepted", "expired", "revoked"] as const;
type Filter = (typeof FILTERS)[number];

export default async function InvitesPage({ searchParams }: PageProps<"/admin/invites">) {
  const { db } = await adminContext("/admin/invites");
  const sp = await searchParams;
  const t = await getTranslations();
  const intlTag = await getLocale();
  const locale = toLocale(intlTag);
  const filter: Filter = FILTERS.includes(sp.status as Filter) ? (sp.status as Filter) : "all";
  const q = typeof sp.q === "string" ? sp.q.slice(0, 80) : "";

  const [all, products] = await Promise.all([listInvites(db, { q }), adminProducts(db, locale)]);
  const counts = Object.fromEntries(FILTERS.map((f) => [f, f === "all" ? all.length : all.filter((i) => i.status === f).length])) as Record<Filter, number>;
  const rows = filter === "all" ? all : all.filter((i) => i.status === filter);
  const title = (id: string) => products.find((p) => p.id === id)?.title ?? "—";

  const href = (params: { status?: string; q?: string; new?: string }) => {
    const u = new URLSearchParams();
    if (params.status && params.status !== "all") u.set("status", params.status);
    if (params.q) u.set("q", params.q);
    if (params.new) u.set("new", params.new);
    const s = u.toString();
    return s ? `/admin/invites?${s}` : "/admin/invites";
  };

  const creating = sp.new === "1";
  const invitable = products.filter((p) => p.access === "paid");
  const covers = creating ? await signedImageUrls(invitable.map((p) => p.coverPath)) : new Map<string, string>();

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t("inv_ad_title")}</h1>
          <p>{t("inv_ad_lead")}</p>
        </div>
        <Link className="btn btn-primary" href={href({ status: filter, q, new: "1" })} scroll={false}>
          <Mail className="icon icon-sm" aria-hidden="true" />
          {t("newInvite")}
        </Link>
      </div>
      <section className="card">
        <div className="toolbar">
          <nav className="filters scroll" aria-label={t("th_status")}>
            {FILTERS.map((f) => (
              <Link key={f} className="filter" href={href({ status: f, q })} aria-current={filter === f ? "page" : undefined}>
                {f === "all" ? t("all") : t(`st_${f}`)}
                <span className="count">{counts[f]}</span>
              </Link>
            ))}
          </nav>
          <form className="mini-search" role="search" action="/admin/invites">
            <Search className="icon icon-sm" aria-hidden="true" />
            <label className="sr" htmlFor="inv-search">
              {t("searchInvites")}
            </label>
            <input id="inv-search" name="q" type="search" defaultValue={q} placeholder={t("searchInvites")} />
            {filter !== "all" ? <input type="hidden" name="status" value={filter} /> : null}
          </form>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>{t("th_person")}</th>
                <th>{t("th_packs")}</th>
                <th>{t("th_lang")}</th>
                <th>{t("th_source")}</th>
                <th>{t("th_sent")}</th>
                <th>{t("th_expires")}</th>
                <th>{t("th_status")}</th>
                <th>
                  <span className="sr">{t("th_actions")}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((i) => {
                  const live = i.status === "sent" || i.status === "opened";
                  const soon = withinADay(i.expiresAt);
                  return (
                    <tr key={i.id}>
                      <td>
                        <div className="cell-person">
                          <Avatar name={i.fullName || i.email} size={34} />
                          <div>
                            <b>{i.fullName || "—"}</b>
                            <span>{i.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        {i.productIds.map((id) => (
                          <div key={id}>{title(id)}</div>
                        ))}
                      </td>
                      <td>
                        <span className="pill pill-grey">{i.locale.toUpperCase()}</span>
                      </td>
                      <td className="muted">{t(i.source === "gateway" ? "src_gateway" : "src_manual")}</td>
                      <td className="muted tnum" style={{ whiteSpace: "nowrap" }}>{shortDate(i.createdAt, intlTag)}</td>
                      <td className="tnum" style={{ whiteSpace: "nowrap" }}>
                        {live ? (
                          <span className={soon ? undefined : "muted"} style={soon ? { color: "var(--red-ink)", fontWeight: 500 } : undefined}>
                            {t("expiresIn", { t: timeLeft(i.expiresAt, (n) => t("days", { n })) })}
                          </span>
                        ) : i.status === "expired" ? (
                          shortDate(i.expiresAt, intlTag)
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        <InvitePill status={i.status as InviteStatus} />
                      </td>
                      <td>
                        <InviteActions id={i.id} status={i.status} email={i.email} />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8}>
                    <div className="empty">
                      <Mail className="icon" aria-hidden="true" />
                      <p>{q ? t("empty_search", { q }) : t("inv_empty")}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      {creating ? (
        <NewInviteDrawer
          closeHref={href({ status: filter, q })}
          defaultLocale={locale}
          products={invitable.map((p) => ({ id: p.id, title: p.title, coverPath: p.coverPath, coverUrl: covers.get(p.coverPath ?? ""), fieldColour: p.fieldColour, visibility: p.visibility }))}
        />
      ) : null}
    </>
  );
}
