import Link from "next/link";
import { IntentLink } from "@/components/shell/intent-link";
import { Logo } from "./logo";

/** `intent`: prefetch on hover, focus or touch only (the admin), not whenever the logo is on screen. */
export function Brand({ href = "/", subtitle, intent }: { href?: string; subtitle?: string; intent?: boolean }) {
  const Tag = intent ? IntentLink : Link;
  return (
    <Tag className="brand" href={href} aria-label="Kingdom Library">
      <Logo />
      <span>
        <b>Kingdom Library</b>
        {subtitle ? <small>{subtitle}</small> : null}
      </span>
    </Tag>
  );
}
