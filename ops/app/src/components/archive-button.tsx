"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { archiveCard } from "@/app/(app)/cards/actions";
import { ConfirmSheet } from "@/components/confirm";
import { useToast } from "@/components/shell/toaster";
import { Icon } from "@/components/ui/icon";

/** #1 "Arquivar": the card leaves the boards, the agenda, the counts and the totals (with confirmation). */
export function ArchiveButton({ cardId, kindLabel }: { cardId: string; kindLabel: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  const toast = useToast();
  return (
    <>
      <button className="btn btn-ghost" type="button" onClick={() => setOpen(true)}>
        <Icon name="archive" size="sm" />
        Arquivar
      </button>
      {open ? (
        <ConfirmSheet
          title={`Arquivar ${kindLabel.toLowerCase()}?`}
          confirmLabel="Arquivar"
          pending={pending}
          error={error}
          onClose={() => setOpen(false)}
          onConfirm={() =>
            start(async () => {
              const r = await archiveCard(cardId);
              if (!r.ok) return setError(r.error);
              toast("Arquivado");
              router.replace(r.back);
            })
          }
        >
          Deixa de aparecer nos pipelines, na agenda, nas contagens e nos totais. O histórico e a ata ficam guardados.
        </ConfirmSheet>
      ) : null}
    </>
  );
}
