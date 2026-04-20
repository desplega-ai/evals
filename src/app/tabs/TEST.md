# `/tabs` — verification plan

Six sections combining tabs, single-level accordions, nested accordions, action-containing accordions, and a mixed tabs+accordions challenge. Hidden "secret codes" are scattered across the content: `ALPHA-7X` (Section 2 tabs), `NEST-A1` / `DEEP-X7` / `CORE-Z9` (Section 4 nested), `AUTH-K3` / `SDK-PY42` / `SDK-JS77` / `SDK-GO99` / `HELP-911` (Section 6). No `data-testid` attributes; drive by visible button text ("Profile", "Settings", "History", "Billing", "Getting Started", "Documentation", etc.).

## States to verify

- **Section 1 default + tab switch** — Section 1 renders with tabs `Profile / Settings / History / Billing`; by default the "Profile" panel is visible ("User profile information…"). Click "Settings"; Settings panel content "Configuration options for notifications…" becomes visible and the Profile panel is hidden.
- **Section 2 reveals secret code** — in Section 2 click "Profile"; the panel shows its description plus a yellow info box "Secret Code: ALPHA-7X". Switch to "Settings"; the yellow box now shows "BETA-3Y".
- **Section 3 accordion is exclusive** — expand "How do I reset my password?" in Section 3 (FAQ); the expanded panel shows the reset instructions. Click "What payment methods do you accept?"; the previously-open item collapses and the new one expands.
- **Section 4 nested navigation reveals DEEP-X7** — expand "Getting Started"; three child items render. Expand "Quick Start Guide"; two further children render. Expand "Creating Your First Project"; the panel shows "Hidden treasure: DEEP-X7". Multiple nested panels can remain open simultaneously.
- **Section 5 action accordion — checkboxes** — expand "Newsletter Preferences"; three checkboxes render. Check "Weekly Digest" and "Breaking News"; the "Selected:" footer text reads `weekly, breaking`.
- **Section 5 action accordion — button action log** — expand "Quick Actions"; click "Export Data"; below the button row an "Action Log" section appears containing the line `Export Data clicked at HH:MM:SS`.
- **Section 6 mixed challenge reveals AUTH-K3** — in Section 6 click the "Documentation" tab; expand the "Authentication" accordion; the panel content includes "The auth secret is: AUTH-K3".

## Out of scope

- Finding every secret code (the bullets above sample at least one code per section type).
- Keyboard accessibility of the tab/accordion controls.
