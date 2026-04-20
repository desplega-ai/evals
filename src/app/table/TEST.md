# `/table` — verification plan

Sortable-ish data table with five initial rows. Filter is a substring match
across name, email, department (case-insensitive). The "Remove Selected" button
only appears when at least one row checkbox is checked.

## States to verify

- **Filter narrows results** — type `sales` into the filter input; only the
  row for Bob Johnson (Sales) remains visible.
- **Filter clears** — clear the filter input; all five original rows are
  visible again.
- **Select-all checks all visible rows** — with no filter, click the header
  checkbox; every row checkbox becomes checked and a red
  "Remove Selected (5)" button appears next to "Add Row".
- **Remove Selected drops rows** — with all rows selected, click
  "Remove Selected (5)"; the table body becomes empty (filtered or otherwise)
  and the red button disappears.
- **Add Row appends a new row** — click "Add Row"; the table gains one
  additional row whose ID is greater than any previously-displayed ID and whose
  name/email/department/age fields are all non-empty.

## Out of scope

- Sorting by column header (not implemented).
- Undo after removal.
