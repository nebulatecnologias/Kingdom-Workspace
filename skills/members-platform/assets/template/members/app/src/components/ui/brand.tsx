import Link from "next/link";
import { Logo } from "./logo";

export function Brand({ href = "/", subtitle }: { href?: string; subtitle?: string }) {
  return (
    <Link className="brand" href={href} aria-label="Kingdom Library">
      <Logo />
      <span>
        <b>Kingdom Library</b>
        {subtitle ? <small>{subtitle}</small> : null}
      </span>
    </Link>
  );
}
