import type { ReactNode } from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  Bell,
  BookOpen,
  CircleHelp,
  LayoutDashboard,
  LogIn,
  Mail,
  MessageCircle,
  Plug,
  Plus,
  Search,
  Store,
  User,
  Users,
} from "lucide-react";
import { Brand } from "@/components/ui/brand";
import { LanguageSelect } from "@/components/ui/language-select";
import { NavLink } from "./nav-link";

export type ShellUser = { name: string; email: string } | null;

type NavItem = { href: string; label: string; icon: ReactNode; badge?: number; exact?: boolean };

const AVATAR_COLOURS = ["#f4621d", "#564cc9", "#15803d", "#1f5f9a", "#b8400a", "#8a5b00", "#b4202d", "#0f7a6c"];

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
  const colour = AVATAR_COLOURS[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLOURS.length];
  return (
    <span className="avatar" style={{ background: colour, width: size, height: size }} aria-hidden="true">
      {initials}
    </span>
  );
}

/**
 * Two-audience app shell: sidebar on desktop, sticky top bar + bottom tab bar on mobile.
 * Admin adds the split primary action and an "Administrator" subtitle; everything else is shared.
 */
export async function AppShell({
  variant,
  user,
  children,
}: {
  variant: "member" | "admin";
  user: ShellUser;
  children: ReactNode;
}) {
  const t = await getTranslations();
  const icon = (I: typeof BookOpen) => <I className="icon" aria-hidden="true" />;

  const nav: NavItem[] =
    variant === "admin"
      ? [
          { href: "/admin", label: t("nav_overview"), icon: icon(LayoutDashboard), exact: true },
          { href: "/admin/invites", label: t("nav_invites"), icon: icon(Mail) },
          { href: "/admin/members", label: t("nav_members"), icon: icon(Users) },
          { href: "/admin/showcase", label: t("nav_showcase"), icon: icon(Store) },
          { href: "/admin/integrations", label: t("nav_integrations"), icon: icon(Plug) },
        ]
      : [
          { href: "/library", label: t("nav_library"), icon: icon(BookOpen) },
          { href: "/profile", label: t("nav_profile"), icon: icon(User) },
        ];

  return (
    <div className="app">
      <aside className="sidebar" aria-label={variant === "admin" ? "Admin" : "Main"}>
        <Brand href={variant === "admin" ? "/admin" : "/library"} subtitle={variant === "admin" ? t("nav_admin") : undefined} />
        {variant === "admin" ? (
          <div className="split">
            <Link className="split-main" href="/admin/invites?new=1" style={{ borderRadius: 999 }}>
              {icon(Plus)}
              {t("newInvite")}
            </Link>
          </div>
        ) : null}
        <nav className="nav">
          {nav.map((item) => (
            <NavLink key={item.href} href={item.href} exact={item.exact}>
              {item.icon}
              {item.label}
              {item.badge ? <span className="badge">{item.badge}</span> : null}
            </NavLink>
          ))}
          {variant === "member" ? (
            <Link href="/help">
              {icon(MessageCircle)}
              {t("nav_help")}
            </Link>
          ) : null}
        </nav>
        <div className="sidebar-foot">
          {variant === "admin" ? (
            <Link className="btn btn-ghost btn-block" href="/library">
              {icon(BookOpen)}
              {t("nav_viewMember")}
            </Link>
          ) : null}
          {user ? (
            <div className="user-chip">
              <Avatar name={user.name} />
              <div className="who">
                <b>{user.name}</b>
                <span>{user.email}</span>
              </div>
            </div>
          ) : (
            <Link className="btn btn-ghost btn-block" href="/login">
              {icon(LogIn)}
              {t("login_signIn")}
            </Link>
          )}
        </div>
      </aside>
      <div>
        <header className="mobile-bar">
          <Brand href={variant === "admin" ? "/admin" : "/library"} subtitle={variant === "admin" ? t("nav_admin") : undefined} />
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <LanguageSelect id="lang-m" />
            {user ? (
              <Link href="/profile" aria-label={t("nav_profile")}>
                <Avatar name={user.name} />
              </Link>
            ) : null}
          </div>
        </header>
        <main className="main" id="main">
          <div className="topbar">
            <label className="search">
              {icon(Search)}
              <span className="sr">{variant === "admin" ? t("searchAdmin") : t("searchPacks")}</span>
              <input type="search" placeholder={variant === "admin" ? t("searchAdmin") : t("searchPacks")} autoComplete="off" />
            </label>
            <span className="spacer" />
            <LanguageSelect />
            {variant === "admin" ? (
              <button className="icon-btn" type="button" aria-label={t("feed_title")}>
                {icon(Bell)}
              </button>
            ) : (
              <Link className="icon-btn" href="/help" aria-label={t("nav_help")}>
                {icon(CircleHelp)}
              </Link>
            )}
          </div>
          {children}
        </main>
      </div>
      <nav className="tabbar" aria-label={variant === "admin" ? "Admin" : "Main"}>
        {nav.map((item) => (
          <NavLink key={item.href} href={item.href} exact={item.exact}>
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
