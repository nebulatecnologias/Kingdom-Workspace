"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { backTarget, popTo } from "@/lib/nav-history";

/**
 * "Back" that returns to the page the person came from (with its filters), skipping forms.
 * Falls back to `href` when the app was opened directly on this page.
 */
export function BackButton({ href, className, label, children }: { href: string; className: string; label?: string; children: ReactNode }) {
  const router = useRouter();
  const go = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    const here = window.location.pathname + window.location.search;
    const t = backTarget(here);
    if (t) {
      popTo(t.url);
      if (t.isPrevious) router.back();
      else router.push(t.url);
    } else router.push(href);
  };
  return (
    <a className={className} href={href} onClick={go} aria-label={label}>
      {children}
    </a>
  );
}
