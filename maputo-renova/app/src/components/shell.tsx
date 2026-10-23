"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  Bell,
  Building2,
  ChevronsLeft,
  ChevronsUpDown,
  CircleHelp,
  FileText,
  GitCompareArrows,
  HandCoins,
  LayoutGrid,
  LogOut,
  Mail,
  Menu,
  Search,
  Settings,
  ShieldAlert,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { BrandMark } from "./brand";
import { useLive } from "./live";
import { SampleNote } from "./ui";
import { CONDOMINIOS, PORTFOLIO, USER } from "@/lib/data";

type NavItem = { href: string; label: string; icon: LucideIcon; badge?: "exceptions" | "debtors" };

const NAV: { group: string; items: NavItem[] }[] = [
  {
    group: "Principal",
    items: [
      { href: "/", label: "Visão geral", icon: LayoutGrid },
      { href: "/facturacao", label: "Facturação", icon: FileText },
      { href: "/pagamentos", label: "Pagamentos", icon: Wallet },
      { href: "/reconciliacao", label: "Reconciliação", icon: GitCompareArrows, badge: "exceptions" },
      { href: "/inadimplencia", label: "Inadimplência", icon: ShieldAlert, badge: "debtors" },
    ],
  },
  {
    group: "Carteira",
    items: [
      { href: "/condominios", label: "Condomínios", icon: Building2 },
      { href: "/condominos", label: "Condóminos", icon: Users },
      { href: "/acordos", label: "Acordos de pagamento", icon: HandCoins },
    ],
  },
  {
    group: "Geral",
    items: [
      { href: "/definicoes", label: "Definições", icon: Settings },
      { href: "/ajuda", label: "Ajuda", icon: CircleHelp },
    ],
  },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { exceptions, reconciliados, pagamentosMes } = useLive();
  const closePct = (reconciliados / pagamentosMes) * 100;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 pt-5 pb-6">
        <BrandMark className="size-10 shrink-0" />
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-[17px] font-semibold tracking-[-0.01em]">Maputo Renova</p>
          <p className="truncate text-xs text-ink-3">Gestão de cobranças</p>
        </div>
        <button type="button" aria-label="Recolher menu" className="hidden size-8 cursor-pointer place-items-center rounded-lg bg-sunken text-ink-3 hover:text-ink lg:grid">
          <ChevronsLeft className="size-4" aria-hidden />
        </button>
      </div>

      <nav aria-label="Menu principal" className="flex-1 overflow-y-auto px-3">
        {NAV.map((section) => (
          <div key={section.group} className="mb-5">
            <p className="px-3 pb-2 text-xs font-medium text-ink-3">{section.group}</p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(pathname, item.href);
                const count = item.badge === "exceptions" ? exceptions : item.badge === "debtors" ? PORTFOLIO.devedores : null;
                return (
                  <li key={item.href} className="relative">
                    {active && <span className="absolute top-1/2 -left-3 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand" aria-hidden />}
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={clsx(
                        "flex h-10 items-center gap-3 rounded-full px-3 text-[14.5px] transition-colors duration-150",
                        active ? "bg-brand-soft font-medium text-brand-strong" : "text-ink-2 hover:bg-sunken hover:text-ink",
                      )}
                    >
                      <item.icon className="size-[18px] shrink-0" strokeWidth={1.6} aria-hidden />
                      <span className="flex-1 truncate">{item.label}</span>
                      {count !== null && (
                        <span
                          className={clsx(
                            "tnum grid h-5 min-w-6 place-items-center rounded-full px-1.5 text-[11px] font-semibold",
                            item.badge === "exceptions" ? "bg-warn-soft text-warn" : "bg-sunken text-ink-2",
                          )}
                          aria-label={item.badge === "exceptions" ? `${count} por reconciliar` : `${count} fracções em atraso`}
                        >
                          {count}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        <button type="button" className="mb-4 flex h-10 w-full cursor-pointer items-center gap-3 rounded-full px-3 text-[14.5px] text-ink-2 hover:bg-sunken hover:text-ink">
          <LogOut className="size-[18px]" strokeWidth={1.6} aria-hidden />
          Terminar sessão
        </button>
      </nav>

      <div className="p-4">
        <div className="relative overflow-hidden rounded-card bg-brand-strong p-4 text-white">
          <svg viewBox="0 0 120 80" className="pointer-events-none absolute -right-3 -bottom-4 w-32 text-white/10" aria-hidden>
            {Array.from({ length: 4 }).map((_, r) =>
              Array.from({ length: 6 }).map((_, c) => <rect key={`${r}-${c}`} x={c * 20} y={r * 20} width="14" height="14" rx="3" fill="currentColor" />),
            )}
          </svg>
          <p className="relative text-[15px] font-semibold">Fecho de Outubro</p>
          <p className="relative mt-1 text-[13px] leading-snug text-white/85">
            <span className="tnum font-semibold text-white">{closePct.toFixed(1).replace(".", ",")}%</span> dos pagamentos reconciliados · faltam {PORTFOLIO.diasParaFecho} dias
          </p>
          <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-white transition-[width] duration-500" style={{ width: `${closePct}%` }} />
          </div>
          <Link
            href="/reconciliacao"
            onClick={onNavigate}
            className="relative mt-4 flex h-9 items-center justify-center rounded-full bg-white text-[13.5px] font-medium text-brand-strong transition-colors hover:bg-brand-soft"
          >
            Ver o que falta
          </Link>
        </div>
      </div>
    </div>
  );
}

function Topbar({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="flex h-[72px] items-center gap-3 px-4 sm:px-6 lg:px-2">
      <button type="button" onClick={onMenu} aria-label="Abrir menu" className="grid size-10 cursor-pointer place-items-center rounded-full border border-line bg-surface lg:hidden">
        <Menu className="size-5" aria-hidden />
      </button>
      <label className="relative hidden h-10 w-full max-w-[380px] items-center sm:flex">
        <span className="sr-only">Pesquisar</span>
        <Search className="pointer-events-none absolute left-3.5 size-4 text-ink-3" aria-hidden />
        <input
          type="search"
          placeholder="Pesquisar fracção ou referência"
          className="h-10 w-full rounded-full border border-line bg-sunken pr-14 pl-10 text-sm placeholder:text-ink-3 focus:border-brand focus:bg-surface focus:outline-none"
        />
        <kbd className="pointer-events-none absolute right-3 rounded-md border border-line bg-surface px-1.5 py-0.5 font-sans text-[11px] text-ink-3">⌘ K</kbd>
      </label>

      <button type="button" aria-label="Pesquisar" className="grid size-10 cursor-pointer place-items-center rounded-full border border-line bg-surface text-ink-2 sm:hidden">
        <Search className="size-[18px]" strokeWidth={1.6} aria-hidden />
      </button>
      <SampleNote />

      <div className="relative ml-auto hidden md:block">
        <label className="sr-only" htmlFor="condominio">Condomínio</label>
        <select
          id="condominio"
          className="h-10 cursor-pointer appearance-none rounded-full border border-line bg-surface pr-9 pl-4 text-sm font-medium text-ink hover:border-line-strong focus:border-brand focus:outline-none"
          defaultValue="todos"
        >
          <option value="todos">Todos os condomínios ({CONDOMINIOS.length})</option>
          {CONDOMINIOS.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <ChevronsUpDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-3" aria-hidden />
      </div>

      <div className="ml-auto flex items-center gap-2 md:ml-0">
        {[
          { icon: CircleHelp, label: "Ajuda" },
          { icon: Mail, label: "Mensagens" },
        ].map(({ icon: Icon, label }) => (
          <button key={label} type="button" aria-label={label} className="hidden size-10 cursor-pointer place-items-center rounded-full border border-line bg-surface text-ink-2 transition-colors hover:text-ink lg:grid">
            <Icon className="size-[18px]" strokeWidth={1.6} aria-hidden />
          </button>
        ))}
        <button type="button" aria-label="Notificações (3 novas)" className="relative grid size-10 cursor-pointer place-items-center rounded-full border border-line bg-surface text-ink-2 transition-colors hover:text-ink">
          <Bell className="size-[18px]" strokeWidth={1.6} aria-hidden />
          <span className="absolute top-2 right-2.5 size-2 rounded-full bg-danger ring-2 ring-surface" aria-hidden />
        </button>
        <button type="button" className="flex cursor-pointer items-center gap-2 rounded-full py-1 pr-2 pl-1 hover:bg-surface" aria-label={`Conta de ${USER.name}`}>
          <span className="grid size-10 place-items-center rounded-full bg-brand-tint text-sm font-semibold text-brand-deep">{USER.initials}</span>
          <span className="hidden text-left leading-tight whitespace-nowrap 2xl:block">
            <span className="block text-sm font-medium">{USER.name}</span>
            <span className="block text-xs text-ink-3">{USER.role}</span>
          </span>
          <ChevronsUpDown className="hidden size-4 text-ink-3 sm:block" aria-hidden />
        </button>
      </div>
    </header>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="min-h-dvh bg-surface lg:flex">
      <aside className="sticky top-0 hidden h-dvh w-[264px] shrink-0 lg:block">
        <Sidebar />
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" aria-label="Fechar menu" className="absolute inset-0 bg-ink/30" onClick={() => setOpen(false)} />
          <div className="panel-enter absolute inset-y-0 left-0 w-[284px] bg-surface shadow-pop">
            <button type="button" onClick={() => setOpen(false)} aria-label="Fechar menu" className="absolute top-5 right-3 z-10 grid size-8 cursor-pointer place-items-center rounded-lg bg-sunken">
              <X className="size-4" aria-hidden />
            </button>
            <Sidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <div className="min-w-0 flex-1 lg:pr-3 lg:pb-3">
        <Topbar onMenu={() => setOpen(true)} />
        <main key={pathname} className="min-h-[calc(100dvh-84px)] bg-ground px-4 py-6 sm:px-6 lg:rounded-[22px] lg:px-7 lg:py-7">{children}</main>
      </div>
    </div>
  );
}
