# `/pop-ups` — verification plan

The page renders five independent pop-up variants. Each can be opened manually
via a trigger button, or auto-opened on load via `?open=<slug>` where `slug` is
one of `cookie`, `newsletter`, `exit-intent`, `promo`, `multi-step`. Every
shown/dismissed event appends a line to the activity log (`data-testid="popup-log"`) —
use that log as the verification anchor for each state.

## States to verify

- **Cookie banner — accept** — click `trigger-cookie`, banner (`popup-cookie`)
  appears at the bottom, click `cookie-accept`, banner disappears and the log
  shows `Dismissed: Cookie banner (accept)`.
- **Cookie banner — deep link + reject** — navigate to `${BASE_URL}/pop-ups?open=cookie`,
  the banner auto-opens without clicking the trigger, click `cookie-reject`, log
  shows `Dismissed: Cookie banner (reject)`.
- **Newsletter modal — submit** — click `trigger-newsletter`, modal
  (`popup-newsletter`) opens, type a valid email into `newsletter-email`, click
  `newsletter-subscribe`, modal closes and log shows
  `Dismissed: Newsletter modal (subscribe:<email>)`.
- **Exit-intent overlay — dismiss via X** — click `trigger-exit-intent`, overlay
  (`popup-exit-intent`) appears, click `exit-intent-close`, log shows
  `Dismissed: Exit-intent overlay (close-x)`.
- **Promo bar — close** — click `trigger-promo`, sticky orange bar
  (`popup-promo`) appears at the top, click `promo-close`, bar disappears and
  log shows `Dismissed: Promo bar (close-x)`.
- **Multi-step confirm — happy path** — click `trigger-multi-step`, dialog
  (`popup-multi-step`) opens at step 1, click `multi-step-continue` → step 2,
  type exactly `DELETE` into `multi-step-confirm-input`, click `multi-step-confirm`
  → step 3 success panel, click `multi-step-done`, log shows the full trail
  (`Multi-step: step 2/3 (continue)`, `Multi-step: step 3/3 (confirm)`,
  `Dismissed: Multi-step confirmation (done)`).
- **Multi-step confirm — validation blocks wrong text** — open multi-step,
  continue to step 2, type `delete` (lowercase) in `multi-step-confirm-input`,
  verify `multi-step-confirm` is visibly disabled (cannot advance).

## Out of scope

- Persistence across page reload (state is in-memory only).
- Real backdrop-click dismissal beyond one screenshot per variant (covered
  implicitly by the X / action-button cases above).
