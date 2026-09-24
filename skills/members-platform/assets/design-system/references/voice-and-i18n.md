# Voice, copy and languages

## Voice
- **Warm, simple, faith-grounded without preaching.** Speak like a helpful person at church reception, not a bank and not a sermon.
- **Write from the user's side.** Name things by what people recognise ("your library", "sign-in link"), not how the system works ("entitlements", "magic link token").
- **Controls say exactly what happens:** "Create account and open my library", "Send me a new link", "Continue to secure checkout". A toast then confirms the result: "Invite sent to ana@example.co.mz".
- **Errors say what went wrong and how to fix it,** without apologising or blaming: "That email and password don't match. Try again, or use an email link instead."
- **Reassure at the moments of doubt:** expiry dates, "works once", "we never see your card details", "no stress: you can request a new one at any time".
- **Scripture** may close a page or an email as one short verse with its reference, in the user's language. Never more than one, and never as a label.
- **No eyebrows, no hype, no exclamation stacks.** Only welcome messages and thank-yous get an exclamation mark.

## South African English (default locale `en-ZA`)
- British spelling: colour, favourite, organise, programme, enrol, centre, licence (noun), cheque.
- Local words are fine where natural: "no stress", "sort it out".
- Money: ZAR through `Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' })`, which gives "R 149,00". Never hand-format prices.
  Browsers ship different ICU data, so `en-ZA` can come out as "R 438 800,00" or "R 438,800.00". When the output must be identical everywhere (emails, PDFs, server and client), format on the server, or use one shared helper with `useGrouping` and explicit separators, and test it.
- Dates: `Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' })`, which gives "30 September 2026". Use the short form "23 Sep" in tables.
- Paper size A4. Phone numbers +27.

## Portuguese and Spanish
- `pt` uses European/Mozambican conventions (`pt-PT`): "palavra-passe", "ecrã", "telemóvel", "descarregar", "guardar", "email". Use a warm, polite third person without "você" ("Crie a sua conta", "Indique o seu nome").
- `es` is neutral Spanish (`es-ES` formats): "contraseña", "móvil", "descargar", "tú" form ("Crea tu cuenta").
- The currency stays ZAR in every language; only the number formatting follows the locale.

## i18n structure
- Every string lives in a dictionary keyed by a flat id: `{ en: {...}, pt: {...}, es: {...} }`. In production use next-intl JSON files `messages/en.json` etc.
- Placeholders use `{name}`. Never concatenate translated fragments.
- **Key parity is enforced.** Every locale has exactly the same keys, checked by a test in CI.
- Content (product titles, descriptions, chapter titles) is translatable data in the database, with a fallback to `en`.
- Language resolution: user profile → cookie → `Accept-Language` → `en`. Emails use the profile language, or the checkout language before an account exists.
- Set `<html lang>` from the active locale (`en-ZA`, `pt-PT`, `es-ES`).

## Privacy copy (POPIA)
- Terms line on sign-up: "I agree to the Terms and the Privacy Policy (POPIA)."
- Email footers: "You're receiving this email because you bought from Kingdom. … We never share your details (POPIA)."
- Profile gets a "Your data (POPIA)" card with "Download my data" and "Delete my account" (inline confirmation).
- Recovery forms answer the same way whether or not the email exists: "If we find a purchase for {email}, a new link will arrive in the next few minutes."

## Sample strings (EN / PT / ES)
| Key | EN | PT | ES |
|---|---|---|---|
| Library lead | Your Christian resources, all in one place. | Os seus recursos cristãos, todos num só lugar. | Tus recursos cristianos, todos en un solo lugar. |
| Unlock | Unlock · {price} | Desbloquear · {price} | Desbloquear · {price} |
| Expired link | This link has expired | Este link expirou | Este enlace ha caducado |
| New link | Send me a new link | Enviar-me um novo link | Enviarme un enlace nuevo |
| Saved | Changes saved | Alterações guardadas | Cambios guardados |

The full EN/PT/ES dictionary (about 420 keys) is in `assets/reference-prototype.html`: search for `const I18N`. Reuse its keys and wording wherever the meaning matches.
