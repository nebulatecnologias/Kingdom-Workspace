"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Sidebar / tab-bar link that marks itself as the current page. */
export function NavLink({ href, exact, also = [], children }: { href: string; exact?: boolean; also?: string[]; children: ReactNode }) {
  const pathname = usePathname();
  const under = (base: string) => pathname === base || pathname.startsWith(base + "/");
  const active = exact ? pathname === href : under(href) || also.some(under);
  return (
    <Link href={href} aria-current={active ? "page" : undefined}>
      {children}
    </Link>
  );
}
