# `/visible` — verification plan

Two sections that test interaction with partially-occluded or partially-offscreen elements. Stable ids: `#btn-behind`, `#btn-partial-1`, `#link-partial`. Successful clicks reveal a green or blue confirmation banner at the top of the corresponding section — use those banners as the visual anchor.

## States to verify

- **Initial state (no banners)** — page renders with "Test 1: Basic Overlapping" showing the grey container with a blue "Button Behind" and a red "Overlapping Div" covering most of it; "Test 2: Partial Visibility" shows a green button sticking out on the right and a blue underlined "Partially Hidden Bottom Link" clipped at the bottom. No confirmation banners are visible.
- **Click the button hidden behind the red overlay** — click `#btn-behind` (it is partially hidden by the red "Overlapping Div"); a green banner appears at the top of Test 1 reading "✓ You clicked the utton Behind! This button is partially hidden by the red overlapping div."
- **Click the partially-offscreen button** — click `#btn-partial-1` (the green "Partially Hidden Right" button sticking out past the container edge); a green banner appears at the top of Test 2: "✓ You clicked the Partially Hidden Right button!…".
- **Click the clipped bottom link** — click `#link-partial` (the blue "Partially Hidden Bottom Link" clipped at the bottom edge); a blue banner appears at the top of Test 2: "✓ You clicked the Partially Hidden Bottom Link!…".
- **Clicking again toggles the banner off** — with all three banners visible, click `#btn-behind` again; the first green banner disappears (the clicked-items set toggles on repeated clicks).

## Out of scope

- The `opacity-90` red overlay's exact z-index behaviour — the click-through works because the button is an anchor wrapping the div; this is the intended hit-testing quirk being tested.
