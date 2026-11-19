"use client";

import { useActionState } from "react";
import { changePassword, type PasswordState } from "../actions";

export function PasswordForm() {
  const [state, action, pending] = useActionState<PasswordState, FormData>(changePassword, { status: "idle" });
  return (
    <form className="form" action={action} style={{ marginTop: 22 }}>
      <div className="card fieldset">
        <h2 className="h-section">Palavra-passe</h2>
        <div className="field-row">
          <div className={`field ${state.status === "error" ? "has-error" : ""}`}>
            <label htmlFor="pw-new">Nova palavra-passe</label>
            <input className="input" id="pw-new" name="password" type="password" autoComplete="new-password" minLength={8} required />
          </div>
          <div className={`field ${state.status === "error" ? "has-error" : ""}`}>
            <label htmlFor="pw-confirm">Repetir</label>
            <input className="input" id="pw-confirm" name="confirm" type="password" autoComplete="new-password" minLength={8} required />
          </div>
        </div>
        {state.status === "error" ? <p className="form-error" role="alert">{state.message}</p> : null}
        {state.status === "saved" ? <p className="caption" role="status">Palavra-passe mudada.</p> : null}
      </div>
      <div className="form-foot">
        <button className={`btn btn-ghost ${pending ? "is-loading" : ""}`} type="submit" disabled={pending}>Mudar palavra-passe</button>
      </div>
    </form>
  );
}
