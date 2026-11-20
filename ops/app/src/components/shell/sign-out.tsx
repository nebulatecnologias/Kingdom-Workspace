"use client";

import { useState, useTransition, type ReactNode } from "react";
import { ConfirmSheet } from "@/components/confirm";
import { T } from "@/lib/texts";

/** "Sair" asks first (#31): a stray click no longer ends the session. */
export function SignOutButton({ signOut, className, children, style }: { signOut: () => Promise<void>; className: string; children: ReactNode; style?: React.CSSProperties }) {
  const [ask, setAsk] = useState(false);
  const [pending, start] = useTransition();
  return (
    <>
      <button className={className} type="button" style={style} onClick={() => setAsk(true)} aria-label={T.nav.logout}>
        {children}
      </button>
      {ask ? (
        <ConfirmSheet title="Sair da conta?" confirmLabel={T.nav.logout} pending={pending} onClose={() => setAsk(false)} onConfirm={() => start(() => signOut())}>
          Vai precisar do email e da palavra-passe para voltar a entrar.
        </ConfirmSheet>
      ) : null}
    </>
  );
}
