"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ConfirmSheet } from "@/components/confirm";
import { useToast } from "@/components/shell/toaster";
import { Icon } from "@/components/ui/icon";
import { createTaskFromAction, deleteMinutes } from "../actions";

/** #1 Delete an ata (with confirmation). */
export function DeleteMinutesButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  const toast = useToast();
  return (
    <>
      <button className="btn btn-ghost" type="button" onClick={() => setOpen(true)}>
        <Icon name="trash" size="sm" />
        Apagar
      </button>
      {open ? (
        <ConfirmSheet
          title="Apagar esta ata?"
          confirmLabel="Apagar"
          pending={pending}
          error={error}
          onClose={() => setOpen(false)}
          onConfirm={() =>
            start(async () => {
              const r = await deleteMinutes(id);
              if (!r.ok) return setError(r.error);
              toast("Ata apagada");
              router.replace(r.back);
            })
          }
        >
          A ata deixa de existir. A reunião continua na agenda e pode voltar a ter ata.
        </ConfirmSheet>
      ) : null}
    </>
  );
}

/** #44 "Criar tarefa" for an action of the ata; once created, a link to the task. */
export function ActionTask({ minutesId, index, taskId }: { minutesId: string; index: number; taskId: string | null }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  const toast = useToast();
  if (taskId) {
    return (
      <Link className="btn btn-quiet btn-sm" href={`/cards/${taskId}`}>
        <Icon name="check-square" size="xs" />
        Ver tarefa
      </Link>
    );
  }
  return (
    <button
      type="button"
      className={`btn btn-ghost btn-sm ${pending ? "is-loading" : ""}`}
      disabled={pending}
      onClick={() =>
        start(async () => {
          const r = await createTaskFromAction(minutesId, index);
          if (!r.ok) return toast(r.error);
          toast("Tarefa criada no pipeline Tarefas");
          router.refresh();
        })
      }
    >
      <Icon name="plus" size="xs" />
      Criar tarefa
    </button>
  );
}
