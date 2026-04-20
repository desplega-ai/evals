# `/loading-demo` — verification plan

Four independent loading-pattern demos (Card / Profile / Table / Spinner), each cycling idle → loading (skeleton or spinner) → loaded (interactive content). Control buttons at the top trigger individual demos, "Trigger All", or "Reset All". A `?fullpage` query-param shows a 5-second full-page blue spinner before the page renders. No `data-testid` attributes; drive by visible button text ("Load Card (2s)", "Reset Card (2s)", etc.).

## States to verify

- **Default idle state** — navigate to `${BASE_URL}/loading-demo`; four sections each display their dashed-border placeholder with text like "Click \"Load Card\" to see skeleton loading". The control bar shows four blue "Load X" buttons plus purple "Trigger All" and grey "Reset All".
- **Skeleton loading → loaded (card)** — click "Load Card (2s)"; the Card section shows the `CardSkeleton` with pulsing grey bars; after ~2s it transitions to the green "Product Name / Category: Electronics" card with quantity + / − buttons and Buy Now / Add to Cart buttons.
- **Spinner loading → success (spinner)** — click "Load Spinner (4s)"; the Spinner section shows the centred blue spinner; after ~4s it transitions to the green "Desplegillo ready!" message.
- **Loaded card is interactive** — with the card loaded, click `+` to increment Quantity to 2; click "Add to Cart"; the button label flips to "In Cart" and its background becomes green.
- **Trigger All fires every demo** — reset all, then click "Trigger All"; within one second all four sections enter their loading state simultaneously (skeletons + spinner visible).
- **Reset All returns everything to idle** — click "Reset All" after a demo has loaded; every section reverts to its dashed-border placeholder.
- **Full-page spinner deep-link** — navigate to `${BASE_URL}/loading-demo?fullpage`; a full-viewport white overlay with a large blue spinner and "Loading page..." text is visible; after ~5s it disappears and the normal loading demo page renders.

## Out of scope

- Exact timing measurements (durations are app-controlled and not asserted to the millisecond).
