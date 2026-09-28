"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { LoaderCircle } from "lucide-react";

/** Back from the checkout: the gateway confirms the plan by webhook, usually within seconds. Checks again for a minute. */
export function PlanWaiter() {
  const t = useTranslations();
  const router = useRouter();
  const [tries, setTries] = useState(0);
  useEffect(() => {
    if (tries >= 20) return;
    const id = window.setTimeout(() => {
      router.refresh();
      setTries((n) => n + 1);
    }, 3000);
    return () => window.clearTimeout(id);
  }, [tries, router]);
  return (
    <div className="plan-wait" role="status">
      <LoaderCircle className="icon spin" aria-hidden="true" />
      <span>{tries >= 20 ? t("plan_waitLong") : t("plan_wait")}</span>
    </div>
  );
}
