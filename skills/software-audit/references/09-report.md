# 9. The report

The owner reads the first screen and decides. Put the decision there.

## Severity

Rate **impact × likelihood**, then round to one of:

| Severity | Meaning | Examples |
|---|---|---|
| **Critical** | Exploitable now, by anyone or any user, exposing other people's data or money, or taking the service down. Fix before anything else, today. | Member can download any product by changing an id; admin page without auth; service-role key in the client bundle; webhook without signature check grants access. |
| **High** | Serious harm with a realistic precondition, or a key journey broken for many users. Fix before launch / this week. | Refund doesn't remove access; password reset link reusable; sign-in impossible on iPhone Safari; Enter on the login page sends a reset email. |
| **Medium** | Real harm but limited in reach, or needs an unlikely precondition; frequent friction; missing defence in depth. Fix soon. | No rate limit on invite resend; missing CSP; empty state gives no next step; slow library page on phones. |
| **Low** | Hardening, polish, consistency. Fix when convenient. | Referrer-Policy missing; 36 px tap target; inconsistent button labels. |
| **Info** | Observations, good practice, things to confirm. | Backups exist but restore never tested; "consider legal review". |

Don't inflate. Three real highs are more useful than twenty "criticals".

## A finding

Each finding answers five things:

```
### [HIGH] Pressing Enter on the login page sends a password-reset email
Area: Access / UX · Where: members/app/src/components/auth/login-form.tsx:84 · Found by: save_login.mjs

Impact: Members who press Enter after typing their password don't sign in; they get a reset email
instead and think the login is broken. Affects most keyboard users on desktop.

Evidence: Typing email + password and pressing Enter shows "Check your email" and the dev mailbox
receives a reset email (screenshot audit/screens/login-enter.png). The form's first submit button is
"Forgot password?", so the browser uses it for implicit submission.

Fix: Make "Forgot password?" a type="button" that calls the reset action; keep "Sign in" the only
submit button. Add an E2E test that signs in by pressing Enter.

Status: fixed in e981512, test added (e2e/auth.spec.ts).
```

Keep evidence redacted: no real personal data, no full secrets, no working tokens.

## Structure

Use `assets/report-template.md`:
1. **Summary.** Two or three sentences on overall state, then the top 3–5 fixes in order, each one line.
2. **Scope and method.** What was tested, where, with which roles, which tools, what was out of scope, dates.
3. **Scorecard.** One line per area (UX, design, accessibility, performance, logic, access control, security, operations): a status (good / needs work / at risk) and the count of findings by severity.
4. **Findings.** Ordered by severity, then by area. Numbered so people can refer to them (F-01, F-02…).
5. **What's working.** Specific strengths worth keeping (tests that caught regressions, clean RLS, good empty states).
6. **Appendix.** Access matrix, crawler summary, header check, tool versions, list of test accounts created (to delete).

## Tone
Plain language, user impact first, no blame. Write for the owner, who may not be technical; put code details under each finding for whoever fixes it. Match the owner's language.

## After fixes
Re-run the tool that found each issue (or the test you added) and update the finding's status: fixed (commit), partially fixed, accepted risk (owner's decision, with reason), or open.
