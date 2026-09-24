import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Check, CreditCard, Plug, X } from "lucide-react";
import { MiniCover } from "@/components/admin/cover";
import { CopyButton, SecretField, TestEventButton } from "@/components/admin/integrations";
import { toLocale } from "@/i18n/config";
import { adminContext } from "@/lib/admin/context";
import { adminProducts } from "@/lib/admin/queries";
import { daysSince, timeOrDate } from "@/lib/admin/time";
import { formatZar } from "@/lib/format";
import { ORDER_EVENTS } from "@/lib/gateway/events";
import { signedImageUrls } from "@/lib/media";
import { siteUrl } from "@/lib/request";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("int_title") };
}

type Delivery = { event_id: string; type: string; received_at: string; signature_ok: boolean; result: string; error: string | null; payload: unknown };

function mask(secret: string) {
  const prefix = secret.startsWith("whsec_") ? "whsec_" : "";
  return `${prefix}${"•".repeat(20)}${secret.slice(-4)}`;
}

export default async function IntegrationsPage() {
  const { db } = await adminContext("/admin/integrations");
  const t = await getTranslations();
  const intlTag = await getLocale();
  const [{ data: stored }, { data: events }, products, { data: unmappedRows }] = await Promise.all([
    db.from("integration_secrets").select("secret_current, secret_previous, previous_valid_until").eq("name", "gateway").maybeSingle(),
    db.from("webhook_events").select("event_id, type, received_at, signature_ok, result, error, payload").order("received_at", { ascending: false }).limit(25),
    adminProducts(db, toLocale(intlTag)),
    db.from("audit_log").select("meta").like("action", "gateway.order.%").order("id", { ascending: false }).limit(200),
  ]);
  const deliveries = (events ?? []) as Delivery[];
  const envSecret = process.env.GATEWAY_WEBHOOK_SECRET ?? null;
  const secret = stored?.secret_current ?? envSecret;
  const rotatingUntil =
    stored?.secret_previous && stored.previous_valid_until && new Date(stored.previous_valid_until) > new Date() ? timeOrDate(stored.previous_valid_until, intlTag) : null;

  const paid = products.filter((p) => p.access === "paid");
  const covers = await signedImageUrls(paid.map((p) => p.coverPath));
  const mapped = new Set(products.map((p) => p.gatewayProductId).filter(Boolean));
  const unknown = [...new Set((unmappedRows ?? []).flatMap((r) => ((r.meta as { unmapped?: string[] } | null)?.unmapped ?? [])))].filter((id) => !mapped.has(id));

  const signed = deliveries.filter((d) => d.signature_ok);
  const lastSigned = signed[0];
  const connected = !!lastSigned && daysSince(lastSigned.received_at) < 30;
  const testOk = signed.some((d) => d.type === "integration.test" && d.result === "processed");
  const listed = paid.filter((p) => p.visibility !== "hidden");
  const steps = [
    { key: "ck1", done: signed.length > 0 },
    { key: "ck2", done: !!secret },
    { key: "ck3", done: listed.length > 0 && listed.every((p) => p.gatewayProductId) },
    { key: "ck4", done: testOk },
  ];

  const endpoint = `${siteUrl()}/api/webhooks/gateway`;
  const orderRef = (d: Delivery) => {
    const o = (d.payload as { data?: { order?: { reference?: string; id?: string } } } | null)?.data?.order;
    return o?.reference ?? o?.id ?? "—";
  };
  const resultPill = (d: Delivery) => {
    if (!d.signature_ok)
      return (
        <span className="pill pill-soft-red">
          <X className="icon icon-sm" aria-hidden="true" />
          {t("res_bad")}
        </span>
      );
    if (d.type === "integration.test" && d.result === "processed")
      return (
        <span className="pill pill-violet">
          <Check className="icon icon-sm" aria-hidden="true" />
          {t("res_test")}
        </span>
      );
    if (d.result === "processed")
      return (
        <span className="pill pill-soft-green">
          <Check className="icon icon-sm" aria-hidden="true" />
          {t("res_ok")}
        </span>
      );
    if (d.result === "duplicate") return <span className="pill pill-grey">{t("res_dup")}</span>;
    if (d.result === "processing") return <span className="pill pill-blue">{t("res_processing")}</span>;
    return <span className="pill pill-soft-red">{t(d.result === "rejected" ? "res_rejected" : "res_error")}</span>;
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t("int_title")}</h1>
          <p>{t("int_lead")}</p>
        </div>
      </div>
      <div className="editor">
        <div className="stack">
          <section className="card card-pad stack" aria-labelledby="gw-title">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <h2 className="card-title" id="gw-title">
                <span className="sc-thumb" style={{ width: 42, height: 42, borderRadius: 12, background: "var(--orange-soft)", color: "var(--orange-ink)" }} aria-hidden="true">
                  <CreditCard className="icon" />
                </span>
                {t("int_gateway")}
              </h2>
              {connected ? (
                <span className="pill pill-soft-green">
                  <span className="status-dot" style={{ width: 8, height: 8, boxShadow: "none" }} />
                  {t("int_connected")} · {t("int_lastEvent", { t: timeOrDate(lastSigned!.received_at, intlTag) })}
                </span>
              ) : (
                <span className="pill pill-grey">{t("int_waiting")}</span>
              )}
            </div>
            <div className="field">
              <span className="label">{t("int_endpoint")}</span>
              <div className="code-field">
                <span id="endpoint" style={{ overflowWrap: "anywhere" }}>
                  {endpoint}
                </span>
                <CopyButton value={endpoint} label={t("int_endpoint")} />
              </div>
              <span className="hint">{t("int_endpointP")}</span>
            </div>
            <SecretField masked={secret ? mask(secret) : null} hasSecret={!!secret} rotatingUntil={rotatingUntil} />
            {envSecret && stored ? <p className="hint">{t("int_envSecret")}</p> : null}
            <div className="field">
              <span className="label">{t("int_events")}</span>
              <div className="filters">
                {[...ORDER_EVENTS, "integration.test"].map((e) => (
                  <span key={e} className="chip-code" style={{ padding: "5px 10px" }}>
                    {e}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <TestEventButton disabled={!secret} />
            </div>
          </section>

          <section className="card" aria-labelledby="map-title">
            <div className="card-head">
              <div>
                <h2 className="card-title" id="map-title">
                  {t("int_mapping")}
                </h2>
                <p className="muted" style={{ fontSize: 13.5 }}>
                  {t("int_mappingP2")}
                </p>
              </div>
            </div>
            {unknown.length ? (
              <div style={{ padding: "0 20px" }}>
                <div className="notice notice-warn" role="status">
                  <span>
                    {t("int_unknown")}{" "}
                    {unknown.map((id) => (
                      <span key={id} className="chip-code" style={{ marginRight: 6 }}>
                        {id}
                      </span>
                    ))}
                  </span>
                </div>
              </div>
            ) : null}
            <div className="table-wrap" style={{ padding: "8px 6px 6px" }}>
              <table className="table" style={{ minWidth: 520 }}>
                <thead>
                  <tr>
                    <th>{t("th_gateway")}</th>
                    <th>{t("th_pack")}</th>
                    <th>{t("ed_price")}</th>
                  </tr>
                </thead>
                <tbody>
                  {paid.map((p) => (
                    <tr key={p.id} className="clickable">
                      <td>{p.gatewayProductId ? <span className="chip-code">{p.gatewayProductId}</span> : <span className="pill pill-amber">{t("int_missing")}</span>}</td>
                      <td>
                        <div className="cell-person">
                          <MiniCover size={34} path={p.coverPath} url={covers.get(p.coverPath ?? "")} colour={p.fieldColour} />
                          <b>
                            <Link className="row-link" href={`/admin/products/${p.id}?tab=sales`}>
                              {p.title}
                            </Link>
                          </b>
                        </div>
                      </td>
                      <td className="tnum">{formatZar(p.priceCents, intlTag)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card" aria-labelledby="log-title">
            <div className="card-head">
              <h2 className="card-title" id="log-title">
                {t("int_log")}
              </h2>
            </div>
            {deliveries.length ? (
              <div className="table-wrap" style={{ padding: "8px 6px 6px" }}>
                <table className="table" style={{ minWidth: 600 }}>
                  <thead>
                    <tr>
                      <th>{t("th_event")}</th>
                      <th>{t("th_order")}</th>
                      <th>{t("th_time")}</th>
                      <th>{t("th_result")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveries.map((d) => (
                      <tr key={d.event_id}>
                        <td>
                          <span className="chip-code">{d.type}</span>
                        </td>
                        <td className="tnum">{orderRef(d)}</td>
                        <td className="muted tnum" style={{ whiteSpace: "nowrap" }}>
                          {timeOrDate(d.received_at, intlTag)}
                        </td>
                        <td>
                          {resultPill(d)}
                          {d.error ? (
                            <span className="hint" style={{ display: "block", marginTop: 4, maxWidth: 360 }}>
                              {d.error}
                            </span>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty">
                <Plug className="icon" aria-hidden="true" />
                <p>{t("int_noEvents")}</p>
              </div>
            )}
          </section>
        </div>
        <aside className="stack">
          <section className="card card-pad stack" aria-labelledby="ck-title">
            <h2 className="card-title" id="ck-title">
              {t("int_checklist")}
            </h2>
            <ol className="stack" style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {steps.map((s, i) => (
                <li key={s.key} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      flex: "none",
                      background: s.done ? "var(--green)" : "var(--sunken)",
                      color: s.done ? "#fff" : "var(--muted)",
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                    aria-hidden="true"
                  >
                    {s.done ? <Check className="icon icon-sm" /> : i + 1}
                  </span>
                  <span style={{ fontSize: 14, ...(s.done ? { color: "var(--muted)" } : {}) }}>
                    {t(s.key)}
                    <span className="sr"> · {s.done ? t("int_done") : t("int_todo")}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>
          <section className="card card-pad stack" aria-labelledby="more-title">
            <h2 className="card-title" id="more-title">
              <Plug className="icon" aria-hidden="true" />
              {t("int_more")}
            </h2>
            <p className="muted" style={{ fontSize: 14 }}>
              {t("int_moreP")}
            </p>
          </section>
        </aside>
      </div>
    </>
  );
}
