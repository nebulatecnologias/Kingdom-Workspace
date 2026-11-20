"use client";

import { useActionState, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { T } from "@/lib/texts";
import { requestReset, signIn, type AuthState } from "../actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(signIn, { status: "idle" });
  const [reset, resetAction, resetPending] = useActionState<AuthState, FormData>(requestReset, { status: "idle" });
  const [email, setEmail] = useState("");
  const err = state.status === "error" ? state.message : null;
  return (
    <form className="card" action={action} noValidate>
      <div className="logo" style={{ marginBottom: 18 }}>
        <span className="mark">
          <Icon name="crown" />
        </span>
        {T.app}
      </div>
      <h1 className="h-display" style={{ fontSize: 22 }}>
        Entrar
      </h1>
      <p className="caption" style={{ margin: "4px 0 18px" }}>
        A conta é criada pela administração do escritório.
      </p>
      <input type="hidden" name="next" value={next} />
      <div className="form">
        <div className={`field ${err ? "has-error" : ""}`}>
          <label htmlFor="email">Email</label>
          <input className="input" id="email" name="email" type="email" autoComplete="username" placeholder="o seu email de trabalho" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className={`field ${err ? "has-error" : ""}`}>
          <label htmlFor="password">Palavra-passe</label>
          <input className="input" id="password" name="password" type="password" autoComplete="current-password" required />
          {err ? <span className="error">{err}</span> : null}
        </div>
        <button className={`btn btn-primary btn-lg btn-block ${pending ? "is-loading" : ""}`} type="submit" disabled={pending}>
          {T.actions.login}
        </button>
        <button
          className={`btn btn-quiet btn-block ${resetPending ? "is-loading" : ""}`}
          type="submit"
          formAction={resetAction}
          formNoValidate
        >
          {T.actions.forgot}
        </button>
        {reset.status === "sent" ? (
          <p className="caption" role="status">
            Se existir uma conta para {reset.email}, enviámos um link para repor a palavra-passe.
          </p>
        ) : reset.status === "error" ? (
          <p className="form-error" role="alert">
            {reset.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
