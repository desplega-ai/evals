# `/` — verification plan

The home page is a navigation hub listing every demo route as a card grid (list view) or as a table (table view). The view mode is controlled by `?view=table` on the URL; the default is the list. There are no `data-testid` attributes — assert by visible heading text (`desplega.ai evals`), card titles (e.g. "Autocomplete Demo"), and the visible toggle buttons "List" / "Table".

## States to verify

- **Default list view** — navigate to `${BASE_URL}/`; verify the page shows the heading `desplega.ai evals`, the "Featured" blue-highlighted "Speedrun Challenge" card, and at least 5 other demo cards visible in a single-column grid (e.g. "Autocomplete Demo", "Table Demo", "Checkboxes Demo", "Buttons Demo", "Pop-ups Demo").
- **Table view via query-param** — navigate to `${BASE_URL}/?view=table`; verify the content renders as a `<table>` with header row "Name / Description / Path / Action" and a "Visit" link per row. The "Table" toggle button shows the active (white background) state.
- **View toggle switches mode** — from list view click "Table"; the URL updates to `?view=table` and the table renders. Click "List"; URL drops the param and the card grid returns.
- **Featured card has special buttons** — locate the "Graph Demo" card; it exposes two inline CTAs ("Empty Canvas" blue, "With Seed" green) instead of a single card link. The "Loading Demo" card similarly exposes "Normal" and "Full Page Spinner (5s)" CTAs.
- **Navigation to a sample route works** — click the "Table Demo" card/link; the browser navigates to `/table` and the `/table` heading is visible.

## Out of scope

- Verifying every one of the ~25 route links individually (sample of 1 is sufficient here; per-route navigation is covered in each route's own plan).
- Styling / hover state details.
