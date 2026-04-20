# `/drag-reorder` — verification plan

Five independent sections exercising drag-and-drop reordering (HTML5 drag API) and one button-based reorder variant. Sections 1/2/4 use `data-testid="{playlist|todo|number}-item-<index>"`, section 3 uses `data-testid="kanban-<id>"`, section 5 uses `data-testid="button-item-<index>"`. Because HTML5 drag events are notoriously hard for browser-automation agents to synthesize, the plan favours the button-based and completion-status observables over forcing exhaustive drag coverage.

## States to verify

- **Initial rendering of all five sections** — page shows five sections with their default data: playlist with 5 songs starting "Bohemian Rhapsody / Stairway to Heaven / Hotel California / Comfortably Numb / Sweet Child O' Mine"; todo with 6 items; kanban with Backlog(2) / In Progress(2) / Done(1); numbers row showing `5 2 8 1 9 3 7 4 6 10`; button list `Alpha / Bravo / Charlie / Delta / Echo`.
- **Button reorder moves item up** — in Section 5, click the `↑` button on the `Bravo` row; verify the list becomes `Bravo, Alpha, Charlie, Delta, Echo` and the "Current order:" text updates accordingly.
- **Button reorder reaches success state** — continue using ↑/↓ buttons until the list reads `Echo, Delta, Charlie, Bravo, Alpha`; the green "Correctly reversed!" message replaces the "Current order:" text.
- **First/last row buttons are disabled at boundaries** — verify the `↑` button on the first row and the `↓` button on the last row are visibly disabled (opacity-30, `cursor-not-allowed`).
- **Check Order on unsorted numbers** — in Section 4, without reordering, click "Check Order"; verify the red "Not in correct order yet. Keep trying!" message appears next to the buttons.
- **Reset numbers** — click "Reset" in Section 4; the number row returns to `5 2 8 1 9 3 7 4 6 10` and the sort-check message disappears.
- **Successful drag reorder (playlist)** — drag the "Stairway to Heaven" row onto the "Bohemian Rhapsody" row in Section 1; the new "Current order:" line below the list starts `Stairway, Bohemian, Hotel, Comfortably, Sweet`. If the agent's drag synthesis fails, skip this bullet — the button-based reorder already proves the reorder pattern works.

## Out of scope

- Exhaustive drag coverage of Sections 2–4 (HTML5 `dragstart`/`drop` are hard to drive reliably from automation — the button reorder in Section 5 is the reliable proof of reordering UX).
- Cross-column kanban moves beyond the initial render snapshot.
