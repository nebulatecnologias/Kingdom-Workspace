"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";

function level(v: string) {
  if (!v) return 0;
  let s = 0;
  if (v.length >= 8) s++;
  if (v.length >= 12) s++;
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++;
  if (/\d/.test(v) || /[^\w]/.test(v)) s++;
  return Math.max(1, Math.min(4, s));
}

export function PasswordInput({
  id,
  name = "password",
  autoComplete,
  meter,
  disabled,
  invalid,
}: {
  id: string;
  name?: string;
  autoComplete: "new-password" | "current-password";
  meter?: boolean;
  disabled?: boolean;
  invalid?: boolean;
}) {
  const t = useTranslations();
  const [show, setShow] = useState(false);
  const [value, setValue] = useState("");
  const lv = level(value);
  return (
    <>
      <div className="input-wrap">
        <input
          className="input"
          id={id}
          name={name}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={t("passwordPh")}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? `${id}-error` : undefined}
        />
        <button type="button" className="adorn" onClick={() => setShow((s) => !s)} aria-label={t(show ? "hidePw" : "showPw")} disabled={disabled}>
          {show ? <EyeOff className="icon" aria-hidden="true" /> : <Eye className="icon" aria-hidden="true" />}
        </button>
      </div>
      {meter ? (
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div className="meter" data-level={lv} style={{ flex: 1 }} aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </div>
          <span className="hint" style={{ minWidth: 64, textAlign: "right" }} aria-live="polite">
            {lv ? t(["pw_weak", "pw_weak", "pw_ok", "pw_good", "pw_strong"][lv] as "pw_weak") : ""}
          </span>
        </div>
      ) : null}
    </>
  );
}
