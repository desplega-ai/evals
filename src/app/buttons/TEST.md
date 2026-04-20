# `/buttons` — verification plan

Four sections of independent buttons. Every toggleable button flips its label
between its section-specific text (e.g. "Home", "Pill Button") and "Selected",
and changes background colour to green when selected. The final section holds
one `disabled` button that must not respond to clicks.

## States to verify

- **Price button toggles to Selected** — click the price-selection button
  (the one with "11.74 €/kg / 140.84 €"); its label changes from "Select" to
  "Selected" and its background turns green. Click again; it reverts.
- **Each icon button is independently toggleable** — click Home; label becomes
  "Selected", background green. Click Settings; Home stays selected and
  Settings also shows "Selected". Click Profile; all three end up "Selected".
  This proves they are not mutually exclusive.
- **Style variants render and toggle** — confirm "Pill Button" (rounded-full,
  purple), "Outline Button" (bordered, blue), and "Ghost Button" (no border,
  gray text) are all visible. Click each; each switches to its "Selected"
  green variant independently.
- **Disabled button does not toggle** — attempt to click "Disabled Button"; no
  visual change, no "Selected" label, cursor shows `not-allowed` style.

## Out of scope

- Focus ring / keyboard navigation styling.
