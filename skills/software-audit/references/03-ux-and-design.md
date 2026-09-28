# 3. UX and design

Good UX is the user reaching their goal quickly, without doubt and without mistakes. Review it by doing the journeys from the map as each kind of user, with the crawler's screenshots open for side-by-side comparison.

## Walk every journey

For each journey, as a first-time user on a phone and then on desktop:
- Can I tell where I am and what to do next? Is the primary action obvious?
- How many steps, fields and decisions? Which could go?
- What happens on the **unhappy paths**: wrong password, expired link, link opened on another device, no products yet, payment failed, network lost, session expired mid-form, double click on submit, browser back after submit?
- Do messages say what happened and what to do, in the user's language, without codes or blame?
- Does the app keep what I typed when something fails?
- Can I undo, or am I asked before something destructive?

Note friction as findings with the journey and step: "Password reset: after submitting, the page shows no confirmation, so users submit again (3 emails)".

## States each screen needs

Check every data screen for: loading (skeleton or indicator, no layout jump), empty (explains and offers the next action), error (says what failed, offers retry), partial (some items fail), long content (long names, 200 items, long words in PT/ES/DE), and permission-limited views.

## Forms

- Labels visible (not placeholder-only), linked to inputs; required fields marked; the right input type and `autocomplete` (email, current-password, new-password, one-time-code).
- Validation on submit and on blur, not on every keystroke; message next to the field and focus moved to the first error.
- **Enter submits the main action.** The first `type="submit"` button in a form is what Enter triggers; a secondary button ("Forgot password?", "Cancel", "Add row") placed before it and left as a submit button will hijack Enter. Test by pressing Enter in the last field of every form.
- Submit disabled or guarded while pending; success confirmed.
- Password fields allow paste and show/hide.

## Copy and content

Consistent names for the same thing across screens, emails and admin. No placeholder text, no "Lorem", no untranslated keys (`product.title_missing`), no mixed languages on one screen. Dates, numbers and currency formatted for the locale. Legal and help pages reachable and matching what the app actually does (refund window, contact address).

## Visual quality

Look for, in the screenshots:
- **Hierarchy.** One clear primary action per screen; headings that scale; related items grouped; enough white space.
- **Consistency.** Same component looks and behaves the same everywhere (buttons, inputs, cards, modals, toasts). Spacing and radius from one scale; colours from one palette.
- **Typography.** Body 16 px or more on phone, line length 45–80 characters, line height 1.4–1.6, no more than two families.
- **Contrast.** Text 4.5:1 (3:1 for large), icons and borders that carry meaning 3:1. Watch light grey on white and text over images.
- **Layout on phone.** No horizontal scroll (the crawler flags overflow), nothing cut off, sticky bars not covering content, tap targets 44×44 px with space between them, content not hidden behind the keyboard.
- **Generic "AI-made" look.** Gradients on everything, emoji as icons, cards inside cards, identical feature grids, vague hero copy. These make a product look untrustworthy; flag them when they hurt credibility.
- **Imagery.** Sharp, sized correctly, alt text meaningful, no broken images, favicon and share image present.

If the product has a design system or brand guide, compare against it and flag drift.

## Navigation

Every screen reachable and escapable; current section indicated; logo goes home; 404 page helpful; deep links work after login (return to the page asked for); browser back behaves.

## Admin UX

Admins do repetitive work: bulk actions, search, filters, sensible defaults, confirmations for destructive actions, audit trail visible, and no need to touch the database for normal operations. If the owner has to run SQL to do their job, that's a finding.

## Reporting UX findings

Give the journey, step, device, screenshot path, what the user experiences and a concrete fix. Severity: blocks a key journey = high; causes errors or support tickets = medium; polish = low.
