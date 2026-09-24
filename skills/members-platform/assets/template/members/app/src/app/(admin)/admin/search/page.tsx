import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Search } from "lucide-react";
import { InvitePill } from "@/components/admin/invite-pill";
import { Avatar } from "@/components/shell/app-shell";
import { adminContext } from "@/lib/admin/context";
import { listInvites, listMembers, searchTerm } from "@/lib/admin/queries";
import { shortDate } from "@/lib/admin/time";
import { formatZar } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("search_title") };
}

/** Top-bar search: members, invites and orders (by reference, gateway order id or email). */
export default async function SearchPage({ searchParams }: PageProps<"/admin/search">) {
  const { db } = await adminContext("/admin/search");
  const sp = await searchParams;
  const t = await getTranslations();
  const intlTag = await getLocale();
  const q = searchTerm(sp.q);
  const [members, invites, orders] = q
    ? await Promise.all([
        listMembers(db, { q, limit: 20 }),
        listInvites(db, { q, limit: 20 }),
        db
          .from("orders")
          .select("id, gateway_order_id, reference, email, user_id, amount_cents, status, created_at")
          .or(`reference.ilike.*${q}*,gateway_order_id.ilike.*${q}*,email.ilike.*${q}*`)
          .order("created_at", { ascending: false })
          .limit(20)
          .then((r) => r.data ?? []),
      ])
    : [{ rows: [], total: 0 }, [], []];
  const nothing = !members.rows.length && !invites.length && !orders.length;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t("search_title")}</h1>
          <p>{q ? t("search_for", { q }) : t("search_lead")}</p>
        </div>
      </div>
      {q && nothing ? (
        <div className="card empty">
          <Search className="icon" aria-hidden="true" />
          <p>{t("empty_search", { q })}</p>
        </div>
      ) : null}
      <div className="stack">
        {members.rows.length ? (
          <section className="card" aria-labelledby="res-members">
            <div className="card-head">
              <h2 className="card-title" id="res-members">
                {t("nav_members")}
              </h2>
            </div>
            <div className="table-wrap">
              <table className="table">
                <tbody>
                  {members.rows.map((m) => (
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
                      <td className="muted tnum">{t("th_joined")}: {shortDate(m.createdAt, intlTag)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
        {invites.length ? (
          <section className="card" aria-labelledby="res-invites">
            <div className="card-head">
              <h2 className="card-title" id="res-invites">
                {t("nav_invites")}
              </h2>
              <Link className="btn btn-ghost btn-sm" href={`/admin/invites?q=${encodeURIComponent(q)}`}>
                {t("viewAll")}
              </Link>
            </div>
            <div className="table-wrap">
              <table className="table">
                <tbody>
                  {invites.map((i) => (
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
                      <td className="muted tnum">{shortDate(i.createdAt, intlTag)}</td>
                      <td>
                        <InvitePill status={i.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
        {orders.length ? (
          <section className="card" aria-labelledby="res-orders">
            <div className="card-head">
              <h2 className="card-title" id="res-orders">
                {t("md_orders")}
              </h2>
            </div>
            <div className="table-wrap">
              <table className="table">
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className={o.user_id ? "clickable" : undefined}>
                      <td>
                        {o.user_id ? (
                          <Link className="row-link chip-code" href={`/admin/members/${o.user_id}`}>
                            {o.reference ?? o.gateway_order_id}
                          </Link>
                        ) : (
                          <span className="chip-code">{o.reference ?? o.gateway_order_id}</span>
                        )}
                      </td>
                      <td>{o.email}</td>
                      <td className="tnum">{formatZar(o.amount_cents, intlTag)}</td>
                      <td className="muted">{t(`ord_${o.status}`)}</td>
                      <td className="muted tnum">{shortDate(o.created_at, intlTag)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
}
