"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { recordVisit } from "@/lib/nav-history";

/** Records each in-app navigation (see lib/nav-history). Render inside <Suspense>. */
export function NavTracker() {
  const path = usePathname();
  const sp = useSearchParams();
  const qs = sp.toString();
  useEffect(() => {
    // Drop one-off flags so "back" doesn't replay a "saved" banner.
    const params = new URLSearchParams(qs);
    ["saved", "created", "moved"].forEach((k) => params.delete(k));
    const q = params.toString();
    recordVisit(q ? `${path}?${q}` : path);
  }, [path, qs]);
  return null;
}
