# `/sliders` — verification plan

Nine slider variants using native `<input type="range">` with custom CSS thumbs: Basic (0–100), Step (step=10), Multi-Range (dual-thumb Min/Max), Price ($0–$10000 step=100), Volume (with emoji icon), Temperature (with colour gradient), Brightness (with live preview panel), Vertical (CSS-rotated), and a Disabled slider. No `data-testid` attributes; drive sliders by their section heading + `<input type="range">` combination, or by keyboard (ArrowLeft/ArrowRight) once focused.

## States to verify

- **Default values render** — all nine sections render with their starting values visible next to the thumb: Basic `50%`, Step `50`, Min/Max `Min: 25 / Range: 50 / Max: 75`, Price `$5,000`, Volume `70%` with the 🔊 icon, Temperature `20°C`, Brightness `80%` with the yellow preview panel at 80% alpha, Vertical `60%`.
- **Basic slider drag + progress bar** — set the Basic slider to a clearly different value (e.g. 25 via keyboard or drag); the `%` readout updates to `25%` and the blue progress bar below narrows to 25% width.
- **Step slider snaps to increments of 10** — adjust the Step slider to a value that would normally be `47`; it should instead snap to `50` (or `40`); the readout shows the snapped value.
- **Multi-range min can't exceed max** — in the Multi-Range section, drag the `Min` thumb past the `Max` thumb's position; the code pushes `Max` up so that `Min ≤ Max` is always preserved. Verify Min and Max readouts remain consistent.
- **Volume icon swaps at thresholds** — set Volume to `0`; the icon becomes 🔇. Set Volume to `50`; the icon becomes 🔉. Set Volume to `90`; the icon is 🔊.
- **Temperature gradient shifts** — set Temperature to `5`; the gradient bar shows the cold `blue-500 → blue-300` variant. Set to `35`; the gradient shows the hot `red-500 → orange-300` variant.
- **Brightness preview tracks value** — drag Brightness to `0`; the yellow preview panel below becomes transparent (alpha 0). Drag to `100`; the panel becomes fully opaque yellow.
- **Disabled slider is non-interactive** — attempt to change the "Disabled Slider" via click/drag/keyboard; the value stays at `50%`, the thumb has `cursor-not-allowed`, and the readout remains greyed out.

## Out of scope

- Pixel-perfect thumb positioning (relies on browser-native range styling).
- Vertical slider precise drag direction (CSS `rotate(-90deg)` makes pointer math brittle — keyboard Arrow keys are the reliable driver).
