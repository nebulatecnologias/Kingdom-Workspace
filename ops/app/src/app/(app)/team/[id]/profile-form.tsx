"use client";

import { useActionState } from "react";
import { T } from "@/lib/texts";
import type { Profile } from "@/lib/types";
import { updateProfile, type ProfileState } from "../actions";

export function ProfileForm({ p, adminFields }: { p: Profile; adminFields: boolean }) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(updateProfile, {});
  return (
    <form className="form" action={action}>
      <input type="hidden" name="id" value={p.id} />
      <div className="card fieldset">
        <div className="field"><label htmlFor="p-name">Nome</label><input className="input" id="p-name" name="full_name" defaultValue={p.full_name} required /></div>
        <div className="field"><label htmlFor="p-job">Função</label><input className="input" id="p-job" name="job_title" defaultValue={p.job_title ?? ""} /></div>
        <div className="field">
          <label htmlFor="p-wa">WhatsApp</label>
          <input className="input" id="p-wa" name="phone_whatsapp" type="tel" defaultValue={p.phone_whatsapp ?? ""} placeholder="+258 8x xxx xxxx" />
          <span className="hint">Só como contacto; o app não envia mensagens.</span>
        </div>
        {adminFields ? (
          <div className="field-row">
            <div className="field">
              <label htmlFor="p-role">Perfil</label>
              <select className="select" id="p-role" name="role" defaultValue={p.role}>
                <option value="member">Membro</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="field">
              <span className="field-label">Conta</span>
              <label className="toggle"><input type="checkbox" name="active" defaultChecked={p.active} /> Ativa</label>
            </div>
          </div>
        ) : null}
      </div>
      {state.error ? <p className="form-error" role="alert">{state.error}</p> : null}
      <div className="form-foot">
        <button className={`btn btn-primary ${pending ? "is-loading" : ""}`} type="submit" disabled={pending}>{T.actions.save}</button>
      </div>
    </form>
  );
}
