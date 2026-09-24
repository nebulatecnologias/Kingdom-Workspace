"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Check, Clock, Loader2 } from "lucide-react";

const POLL_MS = 2000;
const WAIT_MS = 60_000;

type Phase = "waiting" | "unlocked" | "slow";

/**
 * After the gateway sends the member back: checks every 2 seconds, for up to a minute, whether the webhook
 * has unlocked the product, then opens it. The browser coming back never unlocks anything by itself.
 */
export function UnlockWaiter({ productId, slug, title, supportEmail }: { productId: string; slug: string; title: string; supportEmail: string }) {
  const t = useTranslations();
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("waiting");
  const [round, setRound] = useState(0);

  useEffect(() => {
    if (phase !== "waiting") return;
    let stopped = false;
    let timer: number | undefined;
    const started = Date.now();
    const check = async () => {
      try {
        const res = await fetch(`/api/purchase/status?product=${productId}`, { cache: "no-store" });
        if (res.status === 401) return router.replace(`/login?next=${encodeURIComponent(`/purchase/return?product=${productId}`)}`);
        const body = res.ok ? ((await res.json()) as { owned?: boolean }) : {};
        if (stopped) return;
        if (body.owned) return setPhase("unlocked");
      } catch {
        /* network blip: try again on the next tick */
      }
      if (stopped) return;
      if (Date.now() - started >= WAIT_MS) setPhase("slow");
      else timer = window.setTimeout(check, POLL_MS);
    };
    timer = window.setTimeout(check, 0);
    return () => {
      stopped = true;
      window.clearTimeout(timer);
    };
  }, [phase, round, productId, router]);

  // Once unlocked, give the good news a moment on screen, then open the product.
  useEffect(() => {
    if (phase !== "unlocked") return;
    const timer = window.setTimeout(() => router.replace(`/products/${slug}?unlocked=1`), 1500);
    return () => window.clearTimeout(timer);
  }, [phase, slug, router]);

  const icon =
    phase === "unlocked" ? { Icon: Check, bg: "var(--green-soft)", fg: "var(--green-ink)" }
    : phase === "slow" ? { Icon: Clock, bg: "var(--amber-soft)", fg: "var(--amber-ink)" }
    : { Icon: Loader2, bg: "var(--orange-soft)", fg: "var(--orange-ink)" };

  return (
    <div className="stack" style={{ gap: 18, justifyItems: "center", textAlign: "center" }}>
      <span className="state-icon" style={{ background: icon.bg, color: icon.fg }}>
        <icon.Icon className={phase === "waiting" ? "icon spin" : "icon"} aria-hidden="true" />
      </span>
      <div role="status" aria-live="polite" className="stack" style={{ gap: 8 }}>
        <h1 style={{ fontSize: 26 }}>{t(phase === "unlocked" ? "pr_unlocked_title" : phase === "slow" ? "pr_slow_title" : "pr_waiting_title")}</h1>
        <p className="muted">{t(phase === "unlocked" ? "pr_unlocked_lead" : phase === "slow" ? "pr_slow_lead" : "pr_waiting_lead", { title })}</p>
      </div>
      {phase === "unlocked" ? (
        <Link className="btn btn-primary" href={`/products/${slug}?unlocked=1`}>
          {t("pr_open", { title })}
        </Link>
      ) : null}
      {phase === "slow" ? (
        <>
          <div className="actions" style={{ justifyContent: "center", marginTop: 0 }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setPhase("waiting");
                setRound((r) => r + 1);
              }}
            >
              {t("pr_check_again")}
            </button>
            <Link className="btn btn-ghost" href="/library">
              {t("pr_back_library")}
            </Link>
          </div>
          <p className="hint">{t.rich("pr_help", { email: supportEmail, link: (c) => <a href={`mailto:${supportEmail}`}>{c}</a> })}</p>
        </>
      ) : null}
    </div>
  );
}
