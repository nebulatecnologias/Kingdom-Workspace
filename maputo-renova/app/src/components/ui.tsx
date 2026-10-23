import clsx from "clsx";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, MoreHorizontal, type LucideIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { CHANNELS, type Channel } from "@/lib/data";

/* Placa do canal: rectangular, letras curtas, como a tabuleta de um balcão de agente. */
const TAG_TONE: Record<Channel, string> = {
  mpesa: "bg-mpesa text-white",
  emola: "bg-emola text-[#2b1700]",
  banco: "bg-banco text-white",
  numerario: "bg-caixa text-white",
};

export function ChannelTag({ channel, size = "sm" }: { channel: Channel; size?: "sm" | "md" }) {
  return (
    <span
      className={clsx(
        "inline-flex shrink-0 items-center rounded-tag font-bold tracking-[0.04em] whitespace-nowrap",
        size === "sm" ? "h-5 px-1.5 text-[10.5px]" : "h-6 px-2 text-[11.5px]",
        TAG_TONE[channel],
      )}
      title={CHANNELS[channel].label}
    >
      {CHANNELS[channel].short}
    </span>
  );
}

export const CHANNEL_BAR: Record<Channel, string> = {
  mpesa: "var(--color-mpesa-bar)",
  emola: "var(--color-emola-bar)",
  banco: "var(--color-banco-bar)",
  numerario: "var(--color-caixa-bar)",
};

export const CHANNEL_SOLID: Record<Channel, string> = {
  mpesa: "var(--color-mpesa)",
  emola: "var(--color-emola)",
  banco: "var(--color-banco)",
  numerario: "var(--color-caixa)",
};

type Tone = "ok" | "warn" | "danger" | "info" | "neutral";

const PILL_TONE: Record<Tone, string> = {
  ok: "bg-brand-soft text-brand-strong",
  warn: "bg-warn-soft text-warn",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
  neutral: "bg-caixa-soft text-ink-2",
};

const DOT_TONE: Record<Tone, string> = {
  ok: "bg-brand",
  warn: "bg-warn",
  danger: "bg-danger",
  info: "bg-info",
  neutral: "bg-ink-3",
};

export function Pill({ tone, children, pulse }: { tone: Tone; children: ReactNode; pulse?: boolean }) {
  return (
    <span className={clsx("inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium whitespace-nowrap", PILL_TONE[tone])}>
      <span className={clsx("size-1.5 rounded-full", DOT_TONE[tone], pulse && "dot-ticking")} aria-hidden />
      {children}
    </span>
  );
}

export function Delta({ value, goodWhen = "up", children }: { value: number; goodWhen?: "up" | "down"; children?: ReactNode }) {
  const up = value >= 0;
  const good = goodWhen === "up" ? up : !up;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className="inline-flex items-center gap-2 text-[13px] text-ink-3">
      <span
        className={clsx(
          "tnum inline-flex h-6 items-center gap-0.5 rounded-full px-2 text-xs font-semibold",
          good ? "bg-brand-soft text-brand-strong" : "bg-danger-soft text-danger",
        )}
      >
        {up ? "+" : "−"}
        {Math.abs(value).toFixed(1).replace(".", ",")}%
        <Icon className="size-3.5" strokeWidth={2} aria-hidden />
      </span>
      {children}
    </span>
  );
}

export function CardHeader({ icon: Icon, title, children, as: Tag = "h2" }: { icon: LucideIcon; title: string; children?: ReactNode; as?: "h2" | "h3" }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-tile border border-line bg-surface text-ink-2">
        <Icon className="size-[18px]" strokeWidth={1.6} aria-hidden />
      </span>
      <Tag className="min-w-0 flex-1 text-[17px] leading-tight font-semibold tracking-[-0.01em]">{title}</Tag>
      {children}
    </div>
  );
}

export function MoreButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg bg-sunken text-ink-2 transition-colors duration-150 hover:bg-line hover:text-ink"
    >
      <MoreHorizontal className="size-4" aria-hidden />
    </button>
  );
}

type ButtonVariant = "primary" | "dark" | "secondary" | "ghost";

const BTN: Record<ButtonVariant, string> = {
  primary: "bg-brand text-white hover:bg-brand-strong active:bg-brand-deep",
  dark: "bg-ink text-white hover:bg-[#26302b] active:bg-black",
  secondary: "bg-sunken text-ink border border-line hover:bg-line/70 active:bg-line",
  ghost: "text-ink-2 hover:bg-sunken hover:text-ink",
};

export function buttonClass(variant: ButtonVariant = "primary", size: "sm" | "md" = "md") {
  return clsx(
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50",
    size === "md" ? "h-10 px-4 text-sm" : "h-8 px-3 text-[13px]",
    BTN[variant],
  );
}

export function Button({ variant = "primary", size = "md", className, ...props }: ComponentProps<"button"> & { variant?: ButtonVariant; size?: "sm" | "md" }) {
  return <button type="button" className={clsx(buttonClass(variant, size), className)} {...props} />;
}

export function ButtonLink({ variant = "primary", size = "md", className, ...props }: ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: "sm" | "md" }) {
  return <Link className={clsx(buttonClass(variant, size), className)} {...props} />;
}

export function PageHeader({ title, subtitle, children }: { title: string; subtitle: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-[26px] leading-tight font-semibold tracking-[-0.02em] sm:text-[28px]">{title}</h1>
        <p className="mt-1 text-sm text-ink-3">{subtitle}</p>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function Progress({ value, tone = "brand", label }: { value: number; tone?: "brand" | "danger" | "warn"; label: string }) {
  const color = tone === "brand" ? "bg-brand" : tone === "danger" ? "bg-danger" : "bg-warn";
  return (
    <div role="progressbar" aria-label={label} aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100} className="h-1.5 w-full overflow-hidden rounded-full bg-line">
      <div className={clsx("h-full rounded-full", color)} style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  );
}

export function Th({ children, align = "left", className }: { children?: ReactNode; align?: "left" | "right"; className?: string }) {
  return (
    <th scope="col" className={clsx("h-10 px-4 text-xs font-medium whitespace-nowrap text-ink-3 first:pl-5 last:pr-5", align === "right" ? "text-right" : "text-left", className)}>
      {children}
    </th>
  );
}

export function Td({ children, align = "left", className }: { children?: ReactNode; align?: "left" | "right"; className?: string }) {
  return (
    <td className={clsx("h-14 px-4 text-sm first:pl-5 last:pr-5", align === "right" && "tnum text-right", className)}>{children}</td>
  );
}

export function SampleNote() {
  return (
    <span className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border border-dashed border-line-strong px-2.5 text-xs font-medium whitespace-nowrap text-ink-2">
      <span className="size-1.5 rounded-full bg-emola" aria-hidden />
      Dados fictícios
    </span>
  );
}
