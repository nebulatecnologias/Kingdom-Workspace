import type { Metadata } from "next";
import { IntentLink as Link } from "@/components/shell/intent-link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { MiniCover } from "@/components/admin/cover";
import { Feed } from "@/components/admin/feed";
import { AccessToggle, ChangeEmail, MemberActions, ResetTwoStep } from "@/components/admin/member-controls";
import { Avatar } from "@/components/shell/app-shell";
import { toLocale } from "@/i18n/config";
import { describeActivity } from "@/lib/admin/activity";
import { adminContext, UUID } from "@/lib/admin/context";
import { adminProducts, auditRows, memberDetail } from "@/lib/admin/queries";
import { relativeDays, shortDate } from "@/lib/admin/time";
import { formatZar } from "@/lib/format";
import { signedImageUrls } from "@/lib/media";
import { memberPlan } from "@/lib/plan";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("mem_title") };
}

const ORDER_TONE: Record<string, string> = {
  paid: "pill-soft-green",
  refunded: "pill-grey",
  partially_refunded: "pill-amber",
  disputed: "pill-soft-red",
  dispute_lost: "pill-soft-red",
};

export default async function MemberPage({ params }: PageProps<"/admin/members/[id]">) {
  const { id } = await params;
  const { db, profile } = await adminContext(`/admin/members/${id}`);
  if (!UUID.test(id)) notFound();
  const t = await getTranslations();
  const intlTag = await getLocale();
  const [detail, products, rows, { data: answers }, { data: sub }, { data: sends }, plan] = await Promise.all([
    memberDetail(db, id),
    adminProducts(db, toLocale(intlTag)),
    auditRows(db, { limit: 10, target: { type: "profile", id } }),
    db.from("onboarding_responses").select("id, skipped, content_types, challenges, faith_stage, daily_time, study_with, curation_opt_in, curation_spheres, created_at").eq("user_id", id).order("created_at", { ascending: false }).limit(20),
    db.from("curation_subscriptions").select("spheres, subscribed_at, unsubscribed_at").eq("user_id", id).maybeSingle(),
    db.from("curation_sends").select("month, product_ids, status").eq("user_id", id).order("month", { ascending: false }).limit(6),
    memberPlan(id),
  ]);
  if (!detail) notFound();
  const { member, grants, orders } = detail;
  const feed = await describeActivity(db, rows);
  const paid = products.filter((p) => p.access === "paid");
  const covers = await signedImageUrls(paid.map((p) => p.coverPath));
  const name = member.fullName || member.email;
  const spheres = (list: string[]) => list.map((x) => t(`sphere_${x}`)).join(", ");
  const monthName = (d: string) => new Intl.DateTimeFormat(intlTag, { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(d));

  const sourceLabel = (productId: string) => {
    const g = grants.find((x) => x.productId === productId);
    if (!g) return null;
    if (g.source === "order") return t("md_fromOrder", { ref: g.orderRef ?? "—" });
    return t("md_byHand", { date: shortDate(g.grantedAt, intlTag) });
  };

  return (
    <>
      <Link className="back" href="/admin/members">
        <ChevronLeft className="icon icon-sm" aria-hidden="true" />
        {t("mem_title")}
      </Link>
      <div className="page-head">
        <div style={{ display: "flex", gap: 16, alignItems: "center", minWidth: 0 }}>
          <Avatar name={name} size={56} />
          <div style={{ minWidth: 0 }}>
            <h1>{name}</h1>
            <p style={{ overflowWrap: "anywhere" }}>{member.email}</p>
          </div>
        </div>
      </div>
      <div className="filters" style={{ marginBottom: 18 }}>
        <span className="pill pill-grey">{member.locale.toUpperCase()}</span>
        {member.status === "active" ? (
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
        {member.role === "admin" ? <span className="pill pill-violet">{t("role_admin")}</span> : null}
        {member.twoStep ? (
          <span className="pill pill-blue">
            <ShieldCheck className="icon icon-sm" aria-hidden="true" />
            {t("mfa_on")}
          </span>
        ) : null}
        <span className="pill pill-grey">
          {t("th_joined")}: {shortDate(member.createdAt, intlTag)}
        </span>
        <span className="pill pill-grey">
          {t("th_lastSeen")}: {relativeDays(member.lastSeenAt, intlTag) ?? "—"}
        </span>
      </div>

      <div className="editor">
        <div className="stack">
          <section className="card card-pad stack" aria-labelledby="access-title">
            <div>
              <h2 id="access-title" style={{ fontSize: 18 }}>
                {t("md_access")}
              </h2>
              <p className="hint" style={{ marginTop: 4 }}>
                {t("md_accessP")}
              </p>
            </div>
            {paid.length ? (
              <div className="stack" style={{ gap: 8 }}>
                {paid.map((p) => {
                  const on = grants.some((g) => g.productId === p.id);
                  const hint = sourceLabel(p.id);
                  return (
                    <div className="bought" key={p.id}>
                      <MiniCover className="mini" size={40} path={p.coverPath} url={covers.get(p.coverPath ?? "")} colour={p.fieldColour} line={!on} />
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <b style={{ fontWeight: 500, fontSize: 14.5, display: "block" }}>{p.title}</b>
                        {hint ? (
                          <span className="hint" id={`src-${p.id}`}>
                            {hint}
                          </span>
                        ) : null}
                      </span>
                      <AccessToggle memberId={member.id} memberName={name} productId={p.id} title={p.title} on={on} describedBy={hint ? `src-${p.id}` : undefined} />
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="hint">{t("ni_noProducts")}</p>
            )}
          </section>

          <section className="card" aria-labelledby="orders-title">
            <div className="card-head">
              <h2 className="card-title" id="orders-title">
                {t("md_orders")}
              </h2>
            </div>
            {orders.length ? (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>{t("th_order")}</th>
                      <th>{t("th_time")}</th>
                      <th>{t("md_amount")}</th>
                      <th>{t("th_status")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td>
                          <span className="chip-code">{o.reference ?? o.gateway_order_id}</span>
                        </td>
                        <td className="muted tnum">{shortDate(o.created_at, intlTag)}</td>
                        <td className="tnum">
                          {formatZar(o.amount_cents, intlTag)}
                          {o.refunded_cents ? <span className="hint"> · −{formatZar(o.refunded_cents, intlTag)}</span> : null}
                        </td>
                        <td>
                          <span className={`pill ${ORDER_TONE[o.status] ?? "pill-grey"}`}>{t(`ord_${o.status}`)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty">
                <p>{t("md_noOrders")}</p>
              </div>
            )}
          </section>
        </div>

        <aside className="stack">
          <section className="card card-pad stack" aria-labelledby="actions-title">
            <h2 id="actions-title" style={{ fontSize: 16 }}>
              {t("md_actions")}
            </h2>
            <MemberActions memberId={member.id} name={name} email={member.email} active={member.status === "active"} self={member.id === profile.id} />
            <ChangeEmail memberId={member.id} email={member.email} />
            {member.twoStep && member.id !== profile.id ? (
              <div>
                <ResetTwoStep memberId={member.id} name={name} />
              </div>
            ) : null}
            {member.status !== "active" ? <p className="hint">{t("md_inactiveNote")}</p> : null}
          </section>
          <section className="card card-pad stack" aria-labelledby="history-title">
            <div>
              <h2 id="history-title" style={{ fontSize: 16 }}>
                {t("hist_title")}
              </h2>
              <p className="hint" style={{ marginTop: 4 }}>
                {t("hist_lead")}
              </p>
            </div>
            <div className="hist-sub">
              <b>{t("hist_plan")}</b>
              <span>
                {!plan
                  ? t("hist_planNone")
                  : plan.active
                    ? plan.status === "trialing" && plan.trialEndsAt
                      ? t("hist_planTrial", { date: shortDate(plan.trialEndsAt, intlTag) })
                      : plan.cancelAtPeriodEnd && plan.accessUntil
                        ? t("hist_planEnding", { date: shortDate(plan.accessUntil, intlTag) })
                        : plan.status === "past_due"
                          ? t("hist_planPastDue")
                          : t("hist_planActive", { date: shortDate(plan.currentPeriodEnd ?? plan.accessUntil ?? new Date(), intlTag) })
                    : t("hist_planEnded")}
              </span>
            </div>
            <div className="hist-sub">
              <b>{t("hist_curation")}</b>
              <span>
                {sub && !sub.unsubscribed_at
                  ? t("hist_subscribed", { date: shortDate(sub.subscribed_at, intlTag), spheres: spheres(sub.spheres) })
                  : sub?.unsubscribed_at
                    ? t("hist_stopped", { date: shortDate(sub.unsubscribed_at, intlTag) })
                    : t("hist_never")}
              </span>
              {sends?.length ? (
                <span className="hint">
                  {sends
                    .map((x) => `${monthName(x.month)}: ${x.status === "sent" ? t("hist_sent", { n: x.product_ids.length }) : t(`hist_send_${x.status}`)}`)
                    .join(" · ")}
                </span>
              ) : null}
            </div>
            {answers?.length ? (
              <ol className="hist-list">
                {answers.map((a) => (
                  <li key={a.id}>
                    <span className="muted tnum" style={{ fontSize: 13 }}>
                      {shortDate(a.created_at, intlTag)}
                    </span>
                    {a.skipped ? (
                      <span>{t("hist_skipped")}</span>
                    ) : (
                      <dl>
                        <dt>{t("hist_wants")}</dt>
                        <dd>{a.content_types.length ? a.content_types.map((c: string) => t(`wel_type_${c}`)).join(", ") : "—"}</dd>
                        <dt>{t("hist_challenges")}</dt>
                        <dd>{a.challenges.length ? spheres(a.challenges) : "—"}</dd>
                        {a.faith_stage ? (
                          <>
                            <dt>{t("hist_faith")}</dt>
                            <dd>{t(`wel_faith_${a.faith_stage}`)}</dd>
                          </>
                        ) : null}
                        {a.daily_time ? (
                          <>
                            <dt>{t("hist_time")}</dt>
                            <dd>{t(`wel_time_${a.daily_time}`)}</dd>
                          </>
                        ) : null}
                        {a.study_with?.length ? (
                          <>
                            <dt>{t("hist_with")}</dt>
                            <dd>{a.study_with.map((w: string) => t(`wel_with_${w}`)).join(", ")}</dd>
                          </>
                        ) : null}
                        <dt>{t("hist_curation")}</dt>
                        <dd>{a.curation_opt_in ? t("hist_yes", { spheres: spheres(a.curation_spheres) }) : t("hist_no")}</dd>
                      </dl>
                    )}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="hint">{t("hist_none")}</p>
            )}
          </section>
          <section className="card" aria-labelledby="member-feed">
            <div className="card-head">
              <h2 className="card-title" id="member-feed" style={{ fontSize: 16 }}>
                {t("feed_title")}
              </h2>
            </div>
            {feed.length ? (
              <Feed items={feed.map((f) => ({ ...f, href: undefined }))} />
            ) : (
              <div className="empty">
                <p>{t("feed_empty")}</p>
              </div>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}
