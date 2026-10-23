import Link from "next/link";
import type { ReactNode } from "react";
import { PageHeader, buttonClass } from "./ui";

export function Later({ title, subtitle, items }: { title: string; subtitle: string; items: ReactNode[] }) {
  return (
    <div className="mx-auto max-w-[1440px] space-y-5">
      <PageHeader title={title} subtitle={subtitle} />
      <section className="card max-w-2xl p-6">
        <h2 className="text-[17px] font-semibold">Fora do âmbito deste protótipo</h2>
        <p className="mt-2 text-sm text-ink-2">Este ecrã entra no plano de desenvolvimento. Vai permitir:</p>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-ink-2 marker:text-brand">
          {items.map((it, i) => <li key={i}>{it}</li>)}
        </ul>
        <Link href="/" className={`${buttonClass("secondary")} mt-5`}>Voltar à visão geral</Link>
      </section>
    </div>
  );
}
