# `/dates` — verification plan

Page aggregates 22 date-picker variants across 4 libraries (Native HTML, react-day-picker, react-datepicker, React Aria). A top filter tab bar (`All` / `Native HTML` / `react-day-picker` / `react-datepicker` / `React Aria`) hides/shows the library sections. Every successful selection appends a line to the Activity Log at the bottom — use the log as the verification anchor. The page has no `data-testid` attributes; drive by visible labels/tab text.

## States to verify

- **All-sections default render** — navigate to the page with the "All" tab active; verify four coloured sections render in order with their variant counts in the header badge: "Native HTML (5 variants)", "react-day-picker v9 (6 variants)", "react-datepicker (8 variants)", "React Aria (3 variants)".
- **Tab filter narrows sections** — click "Native HTML" in the tab bar; only the grey Native section remains visible, the other three are hidden.
- **Native date input selection logs** — click "All", in the "Single Date (with min/max)" input pick any in-range date; verify a `Selected: YYYY-MM-DD` line appears under the input and the Activity Log gains `NATIVE` badge entry `Native date selected: YYYY-MM-DD`.
- **react-day-picker single selection highlights cell** — in the "Single Date" DayPicker under react-day-picker, click any day cell; the cell becomes visibly selected (blue) and the Activity Log gains a `DAY-PICKER` entry.
- **react-datepicker popover + selection** — click the "Single Date" input under react-datepicker; the popover calendar opens; click a day; the input fills with the formatted date and the Activity Log gains a `DATEPICKER` entry.
- **React Aria DatePicker with validation error state** — under React Aria → "With Validation (no past dates)", open the segmented date input, type a past date; the field border turns red and the `FieldError` "Please select a date in the future" renders underneath.
- **Clear Logs empties the log panel** — with at least one entry present, click "Clear Logs" in the Activity Log section; the panel returns to the "No interactions yet." empty state.

## Out of scope

- Exercising every one of the 22 variants individually — one per library is enough to prove each library wires up correctly.
- Cross-browser differences of native `week` / `month` pickers.
