"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/ui/bits";
import { Icon } from "@/components/ui/icon";
import { T } from "@/lib/texts";

type NavPipeline = { slug: string; name: string; icon: string; open: number };
type Me = { full_name: string; job_title: string | null };

const isActive = (path: string, href: string) => (href === "/" ? path === "/" : path === href || path.startsWith(href + "/"));

export function Sidebar({ me, pipelines, todayCount, missingCount, signOut }: { me: Me; pipelines: NavPipeline[]; todayCount: number; missingCount: number; signOut: () => Promise<void> }) {
  const path = usePathname();
  const item = (href: string, icon: string, label: string, n?: number, match?: string) => (
    <Link className={clsx("nav-item", isActive(path, match ?? href) && "is-active")} href={href} aria-current={isActive(path, match ?? href) ? "page" : undefined}>
      <Icon name={icon} />
      <span>{label}</span>
      {n ? <span className="n num">{n}</span> : null}
    </Link>
  );
  return (
    <aside className="sidebar">
      <Link className="logo" href="/">
        <span className="mark">
          <Icon name="crown" />
        </span>
        {T.app}
      </Link>
      <nav className="nav" aria-label="Principal">
        {item("/", "home", T.nav.home)}
        {item("/agenda", "calendar", T.nav.agenda, todayCount)}
        {item("/atas", "file-text", T.nav.minutes, missingCount)}
        {item("/team", "users", T.nav.team)}
        <div className="nav-group">{T.nav.pipelines}</div>
        {pipelines.map((p) => (
          <Link key={p.slug} className={clsx("nav-item nav-sub", isActive(path, `/pipelines/${p.slug}`) && "is-active")} href={`/pipelines/${p.slug}`}>
            <Icon name={p.icon} size="sm" />
            <span>{p.name}</span>
            <span className="n num">{p.open}</span>
          </Link>
        ))}
      </nav>
      <div className="foot">
        {item("/settings/pipelines/reunioes", "settings", T.nav.settings, undefined, "/settings")}
        <form action={signOut}>
          <button className="nav-item" type="submit" style={{ width: "100%" }}>
            <Icon name="log-out" />
            <span>{T.nav.logout}</span>
          </button>
        </form>
        <Link className="me" href="/team">
          <Avatar name={me.full_name} />
          <span>
            <span className="name">{me.full_name}</span>
            <br />
            <span className="role">{me.job_title}</span>
          </span>
        </Link>
      </div>
    </aside>
  );
}

const NO_FAB = [/^\/cards\/new/, /^\/cards\/[^/]+\/edit/, /^\/atas\/new/, /^\/atas\/[^/]+\/edit/];

export function Tabbar() {
  const path = usePathname();
  const tab = (href: string, icon: string, label: string, match: (p: string) => boolean) => {
    const active = match(path);
    return (
      <Link className={clsx("tab", active && "is-active")} href={href} aria-current={active ? "page" : undefined} aria-label={label}>
        <Icon name={icon} />
        <span>{label}</span>
      </Link>
    );
  };
  const fab = !NO_FAB.some((r) => r.test(path));
  return (
    <div className="tabbar-wrap">
      <nav className="tabbar" aria-label="Principal">
        {tab("/", "home", T.nav.home, (p) => p === "/" || p.startsWith("/team"))}
        {tab("/agenda", "calendar", T.nav.agenda, (p) => p.startsWith("/agenda"))}
        {tab("/pipelines/reunioes", "kanban", T.nav.pipeline, (p) => p.startsWith("/pipelines") || p.startsWith("/cards") || p.startsWith("/settings"))}
        {tab("/atas", "file-text", T.nav.minutes, (p) => p.startsWith("/atas"))}
      </nav>
      {fab ? (
        <Link className="fab" href="/cards/new?pipeline=reunioes" aria-label={T.actions.newMeeting}>
          <Icon name="plus" />
        </Link>
      ) : null}
    </div>
  );
}
