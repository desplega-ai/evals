# `/toasts` — verification plan

Five trigger sections spawn toasts into a fixed bottom-right stack. Toasts carry a type (success / error / warning / info), optional auto-dismiss (~4s), optional action button (Undo / Cancel), optional live countdown, and a per-toast × dismiss. Every spawn / dismiss / action appends a timestamped line to the Activity Log. No `data-testid` attributes; drive by the visible button labels ("Success", "Error", "Warning", "Info", "Trigger Undo Toast", "Spam Toasts", "Trigger Persistent Toast", "Trigger Countdown Toast") and by the toast text content.

## States to verify

- **Success toast appears and auto-dismisses** — click "Success"; a green toast "SUCCESS toast fired" appears in the bottom-right stack; after ~4s it disappears and the Activity Log contains `Spawned SUCCESS toast "SUCCESS toast fired"` followed by `SUCCESS toast "SUCCESS toast fired" auto-dismissed`.
- **Error / Warning / Info toasts render in their colours** — click "Error", "Warning", "Info" in sequence; the bottom-right stack briefly contains three coloured toasts (red, yellow, blue) each with the type label in their header.
- **Undo action toast — action path** — click "Trigger Undo Toast"; the info toast "Item archived. Undo?" appears with an underlined "Undo" action link. Click "Undo" before the 4s auto-dismiss; the toast disappears and the log gains both `Undo clicked for "Item archived. Undo?" before timeout` and `INFO toast "Item archived. Undo?" closed from action`.
- **Stacked toasts render without overlap** — click "Spam Toasts"; three toasts (green "Sync finished successfully", yellow "Disk usage is above 85%", red "Background job failed to retry") stack vertically in the bottom-right, each distinct and readable (no overlap). After ~4s all three auto-dismiss.
- **Persistent toast stays until × pressed** — click "Trigger Persistent Toast"; the yellow WARNING toast "Persistent warning. Close with X." appears. Wait 6+ seconds; the toast is still visible (no auto-dismiss). Click the `×` in its corner; the toast disappears and the log gains `… closed manually`.
- **Countdown toast decrements** — click "Trigger Countdown Toast"; the red ERROR toast "Deploy in progress. Cancel before 0." appears with the text `Countdown: 5` below the message. Wait 2 seconds; the countdown text now reads `Countdown: 3`. Click "Cancel" before it reaches 0; the toast disappears and the log contains `Countdown cancelled with Ns remaining`.

## Out of scope

- Pixel-level animation timing of the stack.
- Keyboard-driven dismissal (the × is a plain button, covered implicitly).
