"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { saveWelcome, type WelcomeState } from "@/app/welcome/actions";
import { keepValues } from "@/components/admin/keep-form";
import { CONTENT_TYPES, SPHERES, type Sphere } from "@/lib/spheres";

const STEPS = 3;

/**
 * Three short questions, one at a time: what they want to find, where they feel challenged, and whether
 * they want the monthly picks. One form underneath, so every answer is sent together at the end.
 */
export function WelcomeQuiz({ next, subscribed }: { next: string; subscribed: Sphere[] | null }) {
  const t = useTranslations();
  const [state, action, pending] = useActionState(saveWelcome, { status: "idle" } as WelcomeState);
  const [step, setStep] = useState(state.field ? 3 : 1);
  const [challenges, setChallenges] = useState<Sphere[]>([]);
  const [curation, setCuration] = useState<"yes" | "no" | "">(subscribed ? "yes" : "");
  // The monthly spheres start as the member's challenges until they change them.
  const [picked, setPicked] = useState<Sphere[] | null>(subscribed);
  const heading = useRef<HTMLHeadingElement>(null);
  const spheres = picked ?? challenges;

  useEffect(() => {
    if (state.field) setStep(3); // eslint-disable-line react-hooks/set-state-in-effect -- show the question the error is about
  }, [state]);
  const go = (n: number) => {
    setStep(n);
    // Move focus to the new question, so screen reader and keyboard users start there.
    requestAnimationFrame(() => heading.current?.focus());
  };
  const toggle = (list: Sphere[], s: Sphere, on: boolean) => (on ? [...list, s] : list.filter((x) => x !== s));

  return (
    <form onSubmit={keepValues(action)} className="stack welcome" noValidate>
      <input type="hidden" name="next" value={next} />
      <div className="welcome-steps">
        <span className="muted tnum" style={{ fontSize: 13.5 }}>
          {t("wel_step", { n: step, total: STEPS })}
        </span>
        <div className="progress" role="progressbar" aria-label={t("wel_step", { n: step, total: STEPS })} aria-valuemin={1} aria-valuemax={STEPS} aria-valuenow={step}>
          <i style={{ width: `${(step / STEPS) * 100}%` }} />
        </div>
      </div>

      <fieldset className="welcome-q" hidden={step !== 1}>
        <legend>
          <h1 ref={step === 1 ? heading : undefined} tabIndex={-1}>
            {t("wel_q1")}
          </h1>
        </legend>
        <p className="lead">{t("wel_q1P")}</p>
        <div className="choices">
          {CONTENT_TYPES.map((c) => (
            <label className="choice" key={c}>
              <input type="checkbox" name="content_types" value={c} />
              <span>{t(`wel_type_${c}`)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="welcome-q" hidden={step !== 2}>
        <legend>
          <h1 ref={step === 2 ? heading : undefined} tabIndex={-1}>
            {t("wel_q2")}
          </h1>
        </legend>
        <p className="lead">{t("wel_q2P")}</p>
        <div className="choices">
          {SPHERES.map((s) => (
            <label className="choice" key={s}>
              <input type="checkbox" name="challenges" value={s} checked={challenges.includes(s)} onChange={(e) => setChallenges((l) => toggle(l, s, e.target.checked))} />
              <span>
                <b>{t(`sphere_${s}`)}</b>
                <small>{t(`sphere_${s}_hint`)}</small>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="welcome-q" hidden={step !== 3}>
        <legend>
          <h1 ref={step === 3 ? heading : undefined} tabIndex={-1}>
            {t("wel_q3")}
          </h1>
        </legend>
        <p className="lead">{t("wel_q3P")}</p>
        <div className="choices choices-row">
          <label className="choice">
            <input type="radio" name="curation" value="yes" checked={curation === "yes"} onChange={() => setCuration("yes")} />
            <span>{t("wel_yes")}</span>
          </label>
          <label className="choice">
            <input type="radio" name="curation" value="no" checked={curation === "no"} onChange={() => setCuration("no")} />
            <span>{t("wel_no")}</span>
          </label>
        </div>
        {curation === "yes" ? (
          <fieldset className={state.field ? "field has-error" : "field"} style={{ border: 0, padding: 0, margin: 0 }} aria-describedby={state.field ? "wel-sph-error" : undefined}>
            <legend className="label" style={{ marginBottom: 8 }}>
              {t("wel_spheres")}
            </legend>
            <div className="choices">
              {SPHERES.map((s) => (
                <label className="choice choice-sm" key={s}>
                  <input type="checkbox" name="curation_spheres" value={s} checked={spheres.includes(s)} onChange={(e) => setPicked(toggle(spheres, s, e.target.checked))} />
                  <span>{t(`sphere_${s}`)}</span>
                </label>
              ))}
            </div>
            {state.field ? (
              <span className="error-text" id="wel-sph-error" role="alert">
                {t(state.message ?? "err_pickSphere")}
              </span>
            ) : null}
            <span className="hint">{t("wel_consent")}</span>
          </fieldset>
        ) : null}
        {state.status === "error" && !state.field ? (
          <p className="error-text" role="alert">
            {t(state.message ?? "err_generic")}
          </p>
        ) : null}
      </fieldset>

      <div className="welcome-nav">
        {step > 1 ? (
          <button type="button" className="btn btn-ghost" onClick={() => go(step - 1)}>
            <ArrowLeft className="icon icon-sm" aria-hidden="true" />
            {t("wel_back")}
          </button>
        ) : (
          <span />
        )}
        {/* Separate keys: reusing one element would turn "Next" into a submit button during its own click and send the form early. */}
        {step < STEPS ? (
          <button key="next" type="button" className="btn btn-primary" onClick={() => go(step + 1)}>
            {t("wel_next")}
            <ArrowRight className="icon icon-sm" aria-hidden="true" />
          </button>
        ) : (
          <button key="finish" type="submit" className="btn btn-primary" disabled={pending}>
            {t("wel_finish")}
          </button>
        )}
      </div>
    </form>
  );
}
