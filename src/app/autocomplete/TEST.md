# `/autocomplete` — verification plan

Two independent multi-select typeahead inputs ("Search Users" and "Search Cities") backed by debounced async searches with a spinner, dropdown listbox, and removable chips. Selections are appended to an Activity Log with timestamps. The page has no `data-testid` attributes — drive inputs by their visible labels/placeholders and assert by chip text, dropdown rows, and log entries.

## States to verify

- **User search shows results dropdown** — click the "Search Users" input, type `eng`; after the debounce the spinner disappears and the dropdown lists multiple engineer rows (e.g. "Alice Anderson — alice.anderson@example.com · Engineer").
- **User selection creates a chip and logs activity** — from the dropdown above, click "Alice Anderson"; verify a blue pill chip `Alice Anderson ×` appears in the input, the "Selected Users (1):" panel appears below showing `Alice Anderson - Engineer`, and the Activity Log gains a line ending with `Added user: Alice Anderson`.
- **Chip removal via × button** — with Alice selected, click the `×` inside her chip; the chip disappears, the Selected Users panel unmounts, and the log gains `Removed user: Alice Anderson`.
- **No-results fallback** — clear input, type `xyz`; verify the dropdown still renders fallback suggestions (5 users starting with `x` or random) rather than an empty state — this is the "returns suggestions even with no exact match" behaviour called out in the Test Scenarios section.
- **City search (min 2 chars, longer debounce)** — type `to` in the "Search Cities" input; verify the dropdown lists city rows with name + country + lat/lng (e.g. `Tokyo / Japan / 35.6895, 139.6917`). Select one; a chip `Tokyo, JP` appears and the log gains `Added city: Tokyo, Japan`.
- **Backspace removes last chip when input empty** — with at least one user chip selected and the input empty, press `Backspace` in the input; the most recently added chip is removed and logged as `Removed user: …`.

## Out of scope

- Exercising every Test Scenario bullet (the samples above cover the meaningful states).
- Keyboard arrow-up/arrow-down navigation of the dropdown (mouse click is sufficient).
