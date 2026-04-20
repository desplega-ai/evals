# `/checkboxes` — verification plan

Four independent form-control sections on one page. Selectors use the visible
`<label>` text (inputs use native `id` attributes, not `data-testid`).

## States to verify

- **Switch toggle ON** — click the "Toggle Switch" control; the adjacent text
  flips from "Toggle is OFF" to "Toggle is ON" and the green "Switch is ON"
  label appears to the left.
- **Single checkbox — success block** — check "I agree to the terms and
  conditions"; the green "Thanks for agreeing!" block with the
  "Terms and Conditions" link appears above the checkbox.
- **Radio exclusivity** — click "Option A", then "Option C"; verify only
  "Option C" ends up checked (radios are mutually exclusive via `name="singleChoice"`).
- **Multi-select count + Select All** — check "Feature 1" and "Feature 3"
  individually; the "Selected:" line shows `Feature 1, Feature 3`. Click
  "Select All"; all four features become checked and the "Selected:" line lists
  all four. Click "Select All" again; all four become unchecked and the line
  shows `None`.

## Out of scope

- Keyboard-only interaction (space/enter) — mouse clicks are sufficient here.
