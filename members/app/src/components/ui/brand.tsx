import Link from "next/link";
import { Logo } from "./logo";

export function Brand({ href = "/", subtitle }: { href?: string; subtitle?: string }) {
  return (
    <Link className="brand" href={href} aria-label="Kingdom Members">
      <Logo />
      <span>
        <b>Kingdom Members</b>
        {subtitle ? <small>{subtitle}</small> : null}
      </span>
    </Link>
  );
}
