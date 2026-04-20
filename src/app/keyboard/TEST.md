# `/keyboard` — verification plan

Six sections exercising keyboard-only patterns: roving-tabindex grid, focus-trap modal, arrow-key menu bar, skip link, keyboard-shortcut game, arrow-key listbox. Stable selectors: `data-testid` on `skip-link`, `open-modal`, `modal-input`, `modal-continue-1`, `modal-continue-2`, `modal-confirm`, `grid-<id>` (g1–g6), `arrow-list`, `arrow-item-<0..6>`. The menu-bar uses `data-menu-trigger` / `data-menu-item-index` attributes instead.

## States to verify

- **Initial render of all six sections** — page shows the six numbered sections with their intro blurbs. The grid shows 6 cards each labelled with a letter + "Not activated" under it. The shortcut game shows `Press this shortcut: Ctrl+S` as the first target.
- **Grid activation via keyboard** — Tab into the first grid cell, press Enter; the first cell (`Alpha`) flips to the green activated style and reveals `KBD-A1`. The status line below reads `Activated: 1 / 6`.
- **Grid arrow navigation moves focus** — with the grid focused on Alpha, press ArrowRight; focus moves to `Bravo` (blue ring style, no activation yet).
- **Focus-trap modal open + completion** — click `open-modal`; modal appears; type any non-empty string into `modal-input`; click `modal-continue-1`; on step 2 click `modal-continue-2`; on step 3 the green "Completion code: FOCUS-TRAP-OK" line is visible; click `modal-confirm`; the modal closes and the step counter below the button reads `Modal completed steps: 3 / 3`.
- **Menu bar opens via keyboard** — Tab to the `File` menu trigger (`data-menu-trigger="file"`), press Enter; the File dropdown appears showing `New / Open / Save / Exit` rows with their shortcut hints. Press ArrowDown twice to land on `Save`, press Enter; the dropdown closes and the "Action Log" below shows `Save (Ctrl+S)`.
- **Shortcut-game advances on correct key** — with the game idle and the target showing `Ctrl+S`, press Ctrl+S; the target advances to `Ctrl+Z` and the progress counter reads `1/6`.
- **Shortcut-game completion** — press the full sequence `Ctrl+S → Ctrl+Z → Ctrl+C → Escape → Enter → Tab`; the card replaces the target with the green "All shortcuts completed! / Score: 6/6 / Completion code: KEYS-MASTER" block.
- **Arrow-key listbox selection** — focus the `arrow-list` listbox, press ArrowDown to move to `Elderberry` (index 4), press Space; the item gains the green check state. Navigate back to `Apple` (index 0) and press Space; the status line reads `Selected: Apple, Elderberry` and the green "Correct! Apple and Elderberry selected." message is shown.

## Out of scope

- Skip-link activation from the real browser chrome (requires Tab-from-address-bar focus, hard to script reliably). The skip-link element is still present and can be asserted via `data-testid="skip-link"` in the DOM.
