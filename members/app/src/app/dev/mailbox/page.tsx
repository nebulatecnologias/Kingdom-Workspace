import { notFound } from "next/navigation";
import { devMailboxEnabled } from "@/lib/email/send";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata = { title: "Dev mailbox", robots: { index: false } };

/** Development/preview only: emails that would have been sent (no RESEND_API_KEY). */
export default async function DevMailbox() {
  if (!devMailboxEnabled()) notFound();
  const { data } = await createAdminClient()
    .from("email_log")
    .select("id, to_email, template, locale, created_at, payload")
    .order("created_at", { ascending: false })
    .limit(30);
  return (
    <main className="main" style={{ maxWidth: 960, margin: "0 auto" }}>
      <div className="page-head">
        <div>
          <h1>Dev mailbox</h1>
          <p>Emails stored instead of sent because RESEND_API_KEY is not set.</p>
        </div>
      </div>
      <section className="card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>To</th><th>Template</th><th>Subject</th><th>When</th><th>Link</th></tr>
            </thead>
            <tbody>
              {(data ?? []).map((m) => {
                const p = (m.payload ?? {}) as { subject?: string; link?: string | null };
                return (
                  <tr key={m.id}>
                    <td>{m.to_email}</td>
                    <td><span className="pill pill-grey">{m.template} · {m.locale}</span></td>
                    <td>{p.subject}</td>
                    <td className="muted tnum">{new Date(m.created_at).toLocaleString("en-ZA")}</td>
                    <td>{p.link ? <a href={p.link}>Open</a> : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
