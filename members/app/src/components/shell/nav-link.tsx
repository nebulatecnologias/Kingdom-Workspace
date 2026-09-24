"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { IntentLink } from "./intent-link";

/**
 * Sidebar / tab-bar link that marks itself as the current page.
 * `intent`: prefetch only on hover, focus or touch (the admin), instead of whenever the link is on screen.
 */
export function NavLink({ href, exact, also = [], intent, children }: { href: string; exact?: boolean; also?: string[]; intent?: boolean; children: ReactNode }) {
  const pathname = usePathname();
  const under = (base: string) => pathname === base || pathname.startsWith(base + "/");
  const active = exact ? pathname === href : under(href) || also.some(under);
  const Tag = intent ? IntentLink : Link;
  return (
    <Tag href={href} aria-current={active ? "page" : undefined}>
      {children}
    </Tag>
  );
}
