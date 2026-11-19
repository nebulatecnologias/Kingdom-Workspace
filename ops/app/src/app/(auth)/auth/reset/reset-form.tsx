"use client";

import { useActionState } from "react";
import { T } from "@/lib/texts";
import { updatePassword, type AuthState } from "../../actions";

export function ResetForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(updatePassword, { status: "idle" });
  return (
    <form className="card" action={action}>
      <h1 className="h-display" style={{ fontSize: 22 }}>
        Nova palavra-passe
      </h1>
      <p className="caption" style={{ margin: "4px 0 18px" }}>
        Escolha uma palavra-passe com pelo menos 8 caracteres.
      </p>
      <div className="form">
        <div className={`field ${state.status === "error" ? "has-error" : ""}`}>
          <label htmlFor="password">Palavra-passe</label>
          <input className="input" id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
          {state.status === "error" ? <span className="error">{state.message}</span> : null}
        </div>
        <button className={`btn btn-primary btn-lg btn-block ${pending ? "is-loading" : ""}`} type="submit">
          {T.actions.save}
        </button>
      </div>
    </form>
  );
}
