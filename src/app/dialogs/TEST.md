# `/dialogs` — verification plan

Three buttons trigger native browser dialogs (`alert`, `confirm`, `prompt`). The result of every dismissal is appended to a colour-coded Activity Log. Selectors use visible button text ("Show Alert", "Show Confirm", "Show Prompt"); the log entries include timestamp and type badge (`ALERT` / `CONFIRM` / `PROMPT`). Because browser-native dialogs can be tricky for agents, verification focuses on the rendered log state rather than on the OS dialog itself.

## States to verify

- **Alert fired and dismissed** — click "Show Alert"; accept the native dialog; the Activity Log gains a blue `ALERT` entry `User dismissed the alert`.
- **Confirm accepted** — click "Show Confirm"; press OK in the native dialog; the Activity Log gains a green `CONFIRM` entry `User accepted the confirm`.
- **Confirm cancelled** — click "Show Confirm"; press Cancel; the log gains `User cancelled the confirm` with the green `CONFIRM` badge.
- **Prompt with value** — click "Show Prompt"; type a non-empty string (e.g. `Taras`) and press OK; the log gains a purple `PROMPT` entry `User entered: Taras`.
- **Prompt cancelled** — click "Show Prompt"; press Cancel; the log gains `User cancelled the prompt`.
- **Clear Logs empties the panel** — with entries present, click "Clear Logs"; the panel returns to the "No dialog interactions yet." empty state.

## Out of scope

- Validating the exact OS-native dialog chrome (Chrome, Safari, Firefox each render differently).
- The prompt empty-string path (covered implicitly — distinct bullet not needed).
