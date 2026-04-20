# `/speedrun` — verification plan

`/speedrun` is a server-side `redirect("/speedrun/challenge")`, so visits to `/speedrun` land on the challenge runner. The challenge runner has two phases: a difficulty-selection landing screen (Easy / Normal / Hard / Darksoul), and, once a mode is chosen, an active speedrun that cycles through the challenge components (checkbox, buttons, table, dialogs, popovers, visible, math, memory, otp, dates, wizard, tabs, iframe, infinite-scroll, reorder-slider, graph, file-upload). A `?mode=<difficulty>` query-param skips the landing screen. No `data-testid` attributes surface at the outer level; drive by difficulty button text and the large timer.

## States to verify

- **Redirect from `/speedrun` to `/speedrun/challenge`** — navigate to `${BASE_URL}/speedrun`; the final URL is `/speedrun/challenge` and the difficulty-selection landing screen renders.
- **Landing screen shows all four difficulties** — the landing screen exposes four difficulty buttons/labels: "Easy", "Normal" (5 min), "Hard" (2.5 min), "Darksoul" (1 min). No timer is running yet.
- **Deep-link into Easy mode** — navigate to `${BASE_URL}/speedrun/challenge?mode=easy`; the page bypasses the difficulty picker and renders the active speedrun: a running timer (format `MM:SS.CC`), a progress bar showing `0/<total>` complete, and the first challenge component (expected to be "checkbox") mounted.
- **Timer ticks forward** — on the active speedrun, capture the timer, wait ~2 seconds, capture again; the second value is greater than the first (monotonically increasing).
- **Hard mode has a shorter time budget** — deep-link `?mode=hard`; the time-remaining indicator reads near 2:30.00 and counts down.
- **Back-to-home link is present** — on both landing and active screens, a `← Back to Home` link is rendered at the top-left and links to `/`.

## Out of scope

- Completing individual challenges — each of the 17 wrapped challenges is itself tested on its own dedicated route (`/checkboxes`, `/dates`, `/wizard`, etc.). Verifying the speedrun runner orchestration is sufficient here.
- Share-code / final results page (only reachable after completing all challenges; covered implicitly).
