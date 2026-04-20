# `/webmcp` — verification plan

Demonstrates a `navigator.modelContext` polyfill plus a stamp-collection domain model. A Context Mode switcher (`browse` / `edit` / `admin`) filters which tools are registered (2 / 3 / 7 respectively). A human-facing "Add Stamp" form and an agent-facing "Tool Call Console" both mutate the same stamp list. A "Buy" button on any stamp row triggers a two-step `requestUserInteraction()` flow (executing → confirmation modal → completed/cancelled). No `data-testid` attributes; drive by heading text, mode button labels, and the rendered table/modal contents. The initial mode on load is `edit`.

## States to verify

- **Default `edit` mode registers 3 tools** — navigate to `${BASE_URL}/webmcp`; under "Registered Tools (3)" three cards render: `add-stamp`, `update-stamp`, `delete-stamp`. The Context Mode switcher shows "edit" highlighted white.
- **Switching to `admin` expands the tool list to 7** — click "admin" in the mode switcher; the "Registered Tools" count becomes 7 with cards for `get-stamps`, `search-stamps`, `add-stamp`, `update-stamp`, `delete-stamp`, `export-collection`, `import-collection`.
- **Switching to `browse` narrows to 2 tools** — click "browse"; the "Registered Tools (2)" panel shows only `get-stamps` and `search-stamps`.
- **Initial stamps table** — the Stamp Collection table renders 4 rows with IDs 1–4 and names "Penny Black", "Inverted Jenny", "Treskilling Yellow", "Basel Dove"; each row has a purple "Buy" button in the Actions column.
- **Human UI add-stamp** — fill `Name=Penny Red`, `Description=British red stamp`, `Year=1841` in the "Add Stamp (Human UI)" form; click "Add Stamp"; a 5th row appears in the stamps table with ID 5 and the entered values. The form inputs clear.
- **Tool Call Console executes and logs** — switch to `admin`, in the Tool Call Console pick `get-stamps`, click "Execute"; under "Tool Call Log (1)" a new entry appears with `toolName = get-stamps`, Input `{}`, Output containing a JSON array with the current stamps.
- **Buy triggers confirmation modal** — click "Buy" on the Penny Black row; an "Tool executing…" spinner appears for ~0.8s; then a modal opens: "Confirm Purchase / Buy stamp \"Penny Black\"? / [Cancel] [Confirm]". Click "Confirm"; the modal closes and a green banner appears: "Successfully purchased \"Penny Black\"! Transaction logged.".
- **Cancel in confirmation modal** — click "Buy" on another row; in the modal click "Cancel"; a yellow banner shows `Purchase of "<name>" was cancelled by user.`.

## Out of scope

- Calling `navigator.modelContext.callTool()` from the devtools console (functional but not screenshot-able).
- Import/export round-trip (requires pasting JSON and inspecting secondary effects — not a distinct visual state beyond a new log entry).
