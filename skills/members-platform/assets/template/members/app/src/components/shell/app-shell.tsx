import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  LogOut,
  Bell,
  BookOpen,
  ChevronDown,
  CircleHelp,
  LayoutDashboard,
  LogIn,
  Mail,
  MessageCircle,
  Plug,
  Plus,
  ShieldCheck,
  Store,
  User,
  Users,
} from "lucide-react";
import { Brand } from "@/components/ui/brand";
import { LanguageSelect } from "@/components/ui/language-select";
import { IntentLink } from "./intent-link";
import { NavLink } from "./nav-link";
import { SearchBox } from "./search-box";
import { signOut } from "@/app/(auth)/actions";

export type ShellUser = { name: string; email: string } | null;

type NavItem = { href: string; label: string; icon: ReactNode; badge?: number; exact?: boolean; also?: string[]; sidebarOnly?: boolean };

// Every colour keeps white initials at 4.5:1 or better (WCAG AA).
const AVATAR_COLOURS = ["#c2410c", "#564cc9", "#15803d", "#1f5f9a", "#b8400a", "#8a5b00", "#b4202d", "#0f7a6c"];

export function Avatar({ name, size = 36, decorative = true }: { name: string; size?: number; decorative?: boolean }) {
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
  const colour = AVATAR_COLOURS[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLOURS.length];
  return (
    <span className="avatar" style={{ background: colour, width: size, height: size }} aria-hidden={decorative || undefined}>
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
  pendingInvites,
  children,
}: {
  variant: "member" | "admin";
  user: ShellUser;
  /** Admin only: live invites, shown as a badge on "Invites". */
  pendingInvites?: number;
  children: ReactNode;
}) {
  const t = await getTranslations();
  // The admin prefetches on intent; the member area keeps prefetching visible links so taps respond at once.
  const ShellLink = variant === "admin" ? IntentLink : Link;
  const intent = variant === "admin";
  const icon = (I: typeof BookOpen) => <I className="icon" aria-hidden="true" />;

  const nav: NavItem[] =
    variant === "admin"
      ? [
          { href: "/admin", label: t("nav_overview"), icon: icon(LayoutDashboard), exact: true },
          { href: "/admin/invites", label: t("nav_invites"), icon: icon(Mail), badge: pendingInvites },
          { href: "/admin/members", label: t("nav_members"), icon: icon(Users) },
          { href: "/admin/showcase", label: t("nav_showcase"), icon: icon(Store), also: ["/admin/products"] },
          { href: "/admin/integrations", label: t("nav_integrations"), icon: icon(Plug) },
          // On phones the overview links here; the tab bar keeps five items.
          { href: "/admin/security", label: t("nav_security"), icon: icon(ShieldCheck), sidebarOnly: true },
        ]
      : [
          { href: "/library", label: t("nav_library"), icon: icon(BookOpen) },
          { href: "/profile", label: t("nav_profile"), icon: icon(User) },
        ];

  return (
    <div className="app">
      <aside className="sidebar" aria-label={variant === "admin" ? "Admin" : "Main"}>
        <Brand href={variant === "admin" ? "/admin" : "/library"} subtitle={variant === "admin" ? t("nav_admin") : undefined} intent={intent} />
        {variant === "admin" ? (
          <div className="split">
            <ShellLink className="split-main" href="/admin/invites?new=1">
              {icon(Plus)}
              {t("newInvite")}
            </ShellLink>
            <details className="split-menu">
              <summary className="split-more" aria-label={t("moreActions")} title={t("moreActions")}>
                <ChevronDown className="icon" aria-hidden="true" />
              </summary>
              <div className="card split-pop">
                <ShellLink className="btn btn-quiet btn-block" href="/admin/invites?new=1">
                  <Mail className="icon icon-sm" aria-hidden="true" />
                  {t("newInvite")}
                </ShellLink>
                <ShellLink className="btn btn-quiet btn-block" href="/admin/products/new">
                  <Plus className="icon icon-sm" aria-hidden="true" />
                  {t("newPack")}
                </ShellLink>
              </div>
            </details>
          </div>
        ) : null}
        <nav className="nav">
          {nav.map((item) => (
            <NavLink key={item.href} href={item.href} exact={item.exact} also={item.also} intent={intent}>
              {item.icon}
              {item.label}
              {item.badge ? (
                <span className="badge">
                  {item.badge}
                  <span className="sr"> {t("nav_pendingBadge")}</span>
                </span>
              ) : null}
            </NavLink>
          ))}
          {variant === "member" ? (
            <NavLink href="/help" intent={intent}>
              {icon(MessageCircle)}
              {t("nav_help")}
            </NavLink>
          ) : null}
        </nav>
        <div className="sidebar-foot">
          {variant === "admin" ? (
            <ShellLink className="btn btn-ghost btn-block" href="/library">
              {icon(BookOpen)}
              {t("nav_viewMember")}
            </ShellLink>
          ) : null}
          {user ? (
            <div className="user-chip">
              <Avatar name={user.name} />
              <div className="who">
                <b>{user.name}</b>
                <span>{user.email}</span>
              </div>
              <form action={signOut}>
                <button className="icon-btn" type="submit" title={t("signOut")} aria-label={t("signOut")}>
                  <LogOut className="icon icon-sm" aria-hidden="true" />
                </button>
              </form>
            </div>
          ) : (
            <ShellLink className="btn btn-ghost btn-block" href="/login">
              {icon(LogIn)}
              {t("login_signIn")}
            </ShellLink>
          )}
        </div>
      </aside>
      <div>
        <header className="mobile-bar">
          <Brand href={variant === "admin" ? "/admin" : "/library"} subtitle={variant === "admin" ? t("nav_admin") : undefined} intent={intent} />
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <LanguageSelect id="lang-m" />
            {variant === "admin" ? (
              <ShellLink className="icon-btn icon-btn-cta" href="/admin/invites?new=1" aria-label={t("newInvite")} title={t("newInvite")}>
                {icon(Plus)}
              </ShellLink>
            ) : null}
            {user ? (
              <ShellLink className="mobile-me" href="/profile" title={t("nav_profile")}>
                {/* The visible initials are part of the link's name, so voice control users can say what they see. */}
                <Avatar name={user.name} decorative={false} />
                <span className="sr">{t("nav_profile")}</span>
              </ShellLink>
            ) : null}
          </div>
        </header>
        <main className="main" id="main">
          <div className="topbar">
            <Suspense fallback={<div className="search" />}>
              {variant === "admin" ? <SearchBox label={t("searchAdmin")} action="/admin/search" /> : <SearchBox label={t("searchPacks")} action="/library" />}
            </Suspense>
            <span className="spacer" />
            <LanguageSelect />
            {variant === "admin" ? (
              <ShellLink className="icon-btn" href="/admin/activity" aria-label={t("feed_title")} title={t("feed_title")}>
                {icon(Bell)}
              </ShellLink>
            ) : (
              <ShellLink className="icon-btn" href="/help" aria-label={t("nav_help")}>
                {icon(CircleHelp)}
              </ShellLink>
            )}
          </div>
          {children}
        </main>
      </div>
      <nav className="tabbar" aria-label={variant === "admin" ? "Admin" : "Main"}>
        {nav.filter((item) => !item.sidebarOnly).map((item) => (
          <NavLink key={item.href} href={item.href} exact={item.exact} also={item.also} intent={intent}>
            {item.icon}
            {item.label}
          </NavLink>
        ))}
        {variant === "member" ? (
          <NavLink href="/help" intent={intent}>
            {icon(MessageCircle)}
            {t("nav_help")}
          </NavLink>
        ) : null}
      </nav>
    </div>
  );
}
