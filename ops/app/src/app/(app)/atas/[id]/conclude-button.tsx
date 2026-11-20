"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useToast } from "@/components/shell/toaster";
import { Icon } from "@/components/ui/icon";
import { T } from "@/lib/texts";
import { concludeMeeting } from "../actions";

export function ConcludeButton({ cardId }: { cardId: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  const toast = useToast();
  return (
    <button
      type="button"
      className={`btn btn-ghost ${pending ? "is-loading" : ""}`}
      onClick={() =>
        start(async () => {
          const r = await concludeMeeting(cardId);
          toast(r.ok ? `${T.toast.moved} Concluída` : (r.error ?? "Não foi possível concluir."));
          router.refresh();
        })
      }
    >
      <Icon name="check" size="sm" />
      {T.actions.conclude}
    </button>
  );
}
