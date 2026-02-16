---
date: 2026-02-16T01:00:00Z
topic: "Speedrun Challenges Update"
planner: Claude
git_branch: main
status: draft
autonomy: autopilot
tags:
  - speedrun
  - challenges
  - implementation
---

# Speedrun Challenges Update — Implementation Plan

## Overview

Implement the approved changes from the [speedrun page review](../research/2026-02-16-speedrun-page-review.md): add 3 new challenges (File Download+Upload, Infinite Scroll, Wizard), integrate a loading state into the Buttons challenge, remove standalone Autocomplete (absorbed into Wizard), extract the monolithic challenge file into separate modules, reorder challenges by difficulty, add category grouping, and add per-challenge timing.

## Current State Analysis

The speedrun feature lives in 4 files under `src/app/speedrun/`:
- `challenges.ts` — 15-entry metadata array (`CHALLENGES_LIST`) with `as const` type derivation
- `challenge/page.tsx` — **2728-line monolith** containing all 15 challenge wrapper components, the orchestrator (`SpeedrunPageContent`), timer logic, `ChallengeCard` shared component, `FinalResultsPage`, `ResultsSharePage`, data constants (`SPEEDRUN_USERS`, `SPEEDRUN_CITIES`), and all imports
- `results/page.tsx` — standalone results viewer (decodes base64 from URL)
- `page.tsx` — redirect to `/speedrun/challenge`

### Key Discoveries:
- Each challenge wrapper follows a consistent pattern: local state → `useEffect` watching completion conditions → `ChallengeCard` render with checklist (`challenge/page.tsx:761-817` for simplest example)
- Completion is tracked via `markChallengeComplete(challengeId)` callback (`challenge/page.tsx:316-321`)
- Array index in the grid must match position in `CHALLENGES_LIST` (`challenge/page.tsx:580-671`)
- Results share data includes `completedIds` array — no per-challenge timing exists yet (`challenge/page.tsx:187-198`)
- Autocomplete uses `SPEEDRUN_USERS` (10 users) and `SPEEDRUN_CITIES` (10 cities) defined inline at `challenge/page.tsx:2118-2162`
- External deps: `@xyflow/react` (graph), `otplib` (OTP), `react-datepicker` (dates)
- No shared component library — everything is local to each file

## Desired End State

- **17 challenges** (15 current - Autocomplete + File Upload + Infinite Scroll + Wizard)
- Each challenge in its own file under `src/app/speedrun/challenges/`
- `challenge/page.tsx` reduced to orchestrator + imports only (~300 lines)
- Challenges ordered by difficulty progression with visual category grouping
- Per-challenge completion timestamps displayed in results
- Buttons challenge enhanced with a loading/wait state sub-task

## Quick Verification Reference

```bash
pnpm build          # Build must succeed (type checking + bundling)
pnpm lint           # Linting must pass
PORT=3001 pnpm dev  # Dev server must start, all challenges functional
```

Key files to check:
- `src/app/speedrun/challenges.ts` — updated challenge list
- `src/app/speedrun/challenge/page.tsx` — slimmed orchestrator
- `src/app/speedrun/challenges/*.tsx` — individual challenge files
- `src/app/speedrun/results/page.tsx` — updated for per-challenge timing

## What We're NOT Doing

- **Merging Checkbox into Buttons** — Checkbox serves as the warmup challenge; keeping it standalone
- **Mobile responsiveness improvements** — this is an AI agent eval tool, not a mobile app
- **Map/Storage/WebMCP challenges** — explicitly ruled out in research
- **Keyboard shortcut challenge** — removed from consideration

## Implementation Approach

Six phases, each independently verifiable. Phase 1 (file extraction) is the prerequisite that makes all subsequent phases cleaner. Phases 2-5 add/modify challenges. Phase 6 handles layout and timing improvements.

---

## Phase 1: Extract Challenges Into Separate Files

### Overview
Decompose the 2728-line `challenge/page.tsx` monolith into individual files. This is the foundation for all subsequent work — adding 3 new challenges to a monolith is painful.

### Changes Required:

#### 1. Create shared types and components
**File**: `src/app/speedrun/challenges/types.ts` (new)
**Changes**: Extract the `Challenge` interface (`challenge/page.tsx:23-28`)

**File**: `src/app/speedrun/challenges/challenge-card.tsx` (new)
**Changes**: Extract `ChallengeCard` component and its `ChallengeCardProps` interface (`challenge/page.tsx:708-756`)

#### 2. Extract data constants
**File**: `src/app/speedrun/challenges/data.ts` (new)
**Changes**: Move `SPEEDRUN_USERS` and `SPEEDRUN_CITIES` arrays and their derived types (`challenge/page.tsx:2118-2165`)

#### 3. Extract each challenge wrapper (15 files)
Create one file per challenge under `src/app/speedrun/challenges/`:

| Source lines | New file | Component |
|-------------|----------|-----------|
| 761-817 | `checkbox.tsx` | `CheckboxChallengeWrapper` |
| 819-932 | `buttons.tsx` | `ButtonsChallengeWrapper` |
| 1459-1575 | `table.tsx` | `TableChallengeWrapper` |
| 1578-1654 | `visible.tsx` | `VisibleChallengeWrapper` |
| 1656-1804 | `graph.tsx` | `GraphChallengeWrapper` |
| 1806-1928 | `reorder-slider.tsx` | `ReorderSliderChallengeWrapper` |
| 1930-2004 | `dialogs.tsx` | `DialogsChallengeWrapper` |
| 2006-2115 | `popovers.tsx` | `PopoversChallengeWrapper` |
| 935-1036 | `iframe.tsx` | `IFrameChallengeWrapper` |
| 1038-1141 | `math.tsx` | `MathChallengeWrapper` |
| 1144-1273 | `memory.tsx` | `MemoryChallengeWrapper` |
| 1275-1457 | `otp.tsx` | `OTPChallengeWrapper` |
| 2167-2445 | `autocomplete.tsx` | `AutocompleteChallengeWrapper` |
| 2449-2555 | `dates.tsx` | `DatesChallengeWrapper` |
| 2557-2728 | `tabs.tsx` | `TabsChallengeWrapper` |

Each file:
- Adds `"use client"` directive if it uses hooks/state
- Imports `Challenge` from `./types`
- Imports `ChallengeCard` from `./challenge-card`
- Imports any needed data constants from `./data`
- Exports the wrapper component as named export

#### 4. Create barrel export
**File**: `src/app/speedrun/challenges/index.ts` (new)
**Changes**: Re-export all challenge wrappers from a single entry point

#### 5. Slim down orchestrator
**File**: `src/app/speedrun/challenge/page.tsx`
**Changes**:
- Remove all challenge wrapper function definitions
- Move `FinalResultsPage` and `ResultsSharePage` into `src/app/speedrun/challenges/results-display.tsx`
- Import everything from `../challenges/`
- Remove inline data constants
- Keep: imports, `Difficulty` type, `DIFFICULTY_LIMITS`, `SpeedrunPageContent` orchestrator, Suspense wrapper export
- Target: ~300 lines

#### 6. Graph challenge special handling
**File**: `src/app/speedrun/challenges/graph.tsx`
**Changes**: Move ReactFlow imports (`@xyflow/react`, CSS import) into the graph challenge file only — they don't need to be top-level in the orchestrator

#### 7. OTP challenge special handling
**File**: `src/app/speedrun/challenges/otp.tsx`
**Changes**: Move `otplib` import into the OTP challenge file only

#### 8. Dates challenge special handling
**File**: `src/app/speedrun/challenges/dates.tsx`
**Changes**: Move `react-datepicker` import and CSS into the dates challenge file only

### Success Criteria:

#### Automated Verification:
- [ ] TypeScript compiles: `pnpm build`
- [ ] Lint passes: `pnpm lint`
- [ ] All challenge files exist: `ls src/app/speedrun/challenges/*.tsx | wc -l` (expect 17+ including challenge-card, results-display)
- [ ] Orchestrator significantly reduced: `wc -l src/app/speedrun/challenge/page.tsx` (expect ~300 lines)

#### Manual Verification:
- [ ] Start `PORT=3001 pnpm dev`, navigate to `/speedrun`, start a speedrun
- [ ] Complete at least 3 different challenges (Checkbox, Buttons, Math) — verify completion badges appear
- [ ] Stop speedrun early — verify results page shows correct completed/incomplete status
- [ ] Verify Graph challenge still renders ReactFlow canvas correctly
- [ ] Verify Dates challenge still renders react-datepicker correctly

**Implementation Note**: After completing this phase, pause for manual confirmation before proceeding. This is the highest-risk phase since it touches every challenge.

---

## Phase 2: Integrate Loading State Into Buttons Challenge

### Overview
Add a 5th button to the Buttons challenge that triggers a 2-second loading state, then reveals a confirmation button that must be clicked. Tests agent patience/polling.

### Changes Required:

#### 1. Update challenge metadata
**File**: `src/app/speedrun/challenges.ts`
**Changes**: Update Buttons description from `"Click 3 different button types"` to `"Click 4 button types and handle a loading state"`

#### 2. Modify Buttons challenge
**File**: `src/app/speedrun/challenges/buttons.tsx`
**Changes**:
- Add state: `loadingState: "idle" | "loading" | "loaded"` (start as `"idle"`)
- Add a new button ("Load Data" or similar) at the end of the button list
- When clicked, set state to `"loading"`, show a spinner/pulse animation on the button for 2 seconds
- After 2s (`setTimeout`), set state to `"loaded"`, reveal a "Confirm" button
- Clicking "Confirm" calls `handleClick("btn-loading")`
- Update completion condition from `clicked.size >= 4` to `clicked.size >= 5`
- Add checklist item: `{ text: "Click the loading button and wait for confirmation", completed: clicked.has("btn-loading") }`

### Success Criteria:

#### Automated Verification:
- [ ] TypeScript compiles: `pnpm build`
- [ ] Lint passes: `pnpm lint`

#### Manual Verification:
- [ ] Navigate to speedrun, find Buttons challenge
- [ ] Verify original 4 buttons still work (price, icon, pill, ghost)
- [ ] Click the new loading button — verify it shows a loading state for ~2 seconds
- [ ] Verify clicking during loading state does NOT complete the task
- [ ] After loading, verify "Confirm" button appears — clicking it completes the sub-task
- [ ] Complete all 5 buttons — verify Buttons challenge shows "Complete"

**Implementation Note**: After completing this phase, pause for manual confirmation.

---

## Phase 3: Add File Download+Upload Challenge

### Overview
New challenge: download a generated file, then re-upload that same file. Tests agent file handling — one of the hardest interaction patterns.

### Changes Required:

#### 1. Register challenge
**File**: `src/app/speedrun/challenges.ts`
**Changes**: Add `{ id: "file-upload", name: "File Challenge", description: "Download a file and re-upload it" }` to `CHALLENGES_LIST`

#### 2. Create challenge wrapper
**File**: `src/app/speedrun/challenges/file-upload.tsx` (new)
**Changes**:
- Generate a small text file client-side on mount (e.g., `"speedrun-challenge-{random6chars}.txt"` containing a unique verification string like `SPEEDRUN-VERIFY-{random}`)
- "Download File" button: creates a Blob, generates object URL, triggers programmatic download (same pattern as `files/page.tsx:38-43`)
- Track `hasDownloaded: boolean` — set true when download button clicked
- Hidden `<input type="file">` with a "Upload File" button trigger (pattern from `files/page.tsx:121-136`)
- On file upload: read the file content (via `FileReader`), compare to the original verification string
- Track `hasUploaded: boolean` — set true when uploaded file content matches
- Completion: `hasDownloaded && hasUploaded`
- Checklist: `["Download the file", "Upload the same file back"]`
- Show feedback: green text if upload matches, red text if wrong file

#### 3. Wire into orchestrator
**File**: `src/app/speedrun/challenge/page.tsx`
**Changes**: Import and add `<FileUploadChallengeWrapper>` to the grid at the correct index

### Success Criteria:

#### Automated Verification:
- [ ] TypeScript compiles: `pnpm build`
- [ ] Lint passes: `pnpm lint`
- [ ] Challenge file exists: `ls src/app/speedrun/challenges/file-upload.tsx`

#### Manual Verification:
- [ ] Navigate to speedrun, find File Challenge card
- [ ] Click "Download File" — verify a .txt file is downloaded
- [ ] Upload a random/wrong file — verify it shows an error/mismatch message
- [ ] Upload the correct downloaded file — verify it shows success and challenge completes
- [ ] Verify the checklist updates correctly at each step

**Implementation Note**: After completing this phase, pause for manual confirmation.

---

## Phase 4: Add Infinite Scroll Challenge

### Overview
New challenge: scroll a list to trigger infinite scroll loading, then find and enter a value from a newly loaded row. Tests scroll + wait + read pattern.

### Changes Required:

#### 1. Register challenge
**File**: `src/app/speedrun/challenges.ts`
**Changes**: Add `{ id: "infinite-scroll", name: "Infinite Scroll", description: "Scroll to load more items and find a target value" }` to `CHALLENGES_LIST`

#### 2. Create challenge wrapper
**File**: `src/app/speedrun/challenges/infinite-scroll.tsx` (new)
**Changes**:
- Generate deterministic list data on mount (use index-based generation like `pagination/page.tsx:26-39`): ~30 items total, 8 visible initially
- Display in a scrollable container (`max-h-[300px] overflow-y-auto`)
- Use `IntersectionObserver` on a sentinel element (pattern from `pagination/page.tsx:155-168`)
- When sentinel visible: show loading spinner for ~800ms, then append next batch of 8 items
- Target item: a specific item in the 2nd or 3rd batch (e.g., item #22) — the agent must scroll to load it, then enter its "code" value into an input
- Track `hasScrolledToLoad: boolean` — set true when at least one extra batch is loaded
- Track `hasEnteredCode: boolean` — set true when the user types the correct code from the target item
- Target item is highlighted with a yellow background when visible (like `pagination/page.tsx` target items)
- Completion: `hasScrolledToLoad && hasEnteredCode`
- Checklist: `["Scroll to load more items", "Enter the code from item #22"]`

#### 3. Wire into orchestrator
**File**: `src/app/speedrun/challenge/page.tsx`
**Changes**: Import and add `<InfiniteScrollChallengeWrapper>` to the grid

### Success Criteria:

#### Automated Verification:
- [ ] TypeScript compiles: `pnpm build`
- [ ] Lint passes: `pnpm lint`
- [ ] Challenge file exists: `ls src/app/speedrun/challenges/infinite-scroll.tsx`

#### Manual Verification:
- [ ] Navigate to speedrun, find Infinite Scroll card
- [ ] Verify ~8 items visible initially, target item NOT visible
- [ ] Scroll down in the container — verify loading indicator appears briefly
- [ ] Verify new items load after loading indicator
- [ ] Continue scrolling until target item (#22) appears — verify it's highlighted
- [ ] Enter wrong code — verify no completion
- [ ] Enter correct code from the target item — verify challenge completes

**Implementation Note**: After completing this phase, pause for manual confirmation.

---

## Phase 5: Add Wizard Challenge, Remove Autocomplete

### Overview
New multi-step wizard challenge with phone validation, cookies checkbox, and location autocomplete. Replaces the standalone Autocomplete challenge by absorbing its city autocomplete pattern.

### Changes Required:

#### 1. Update challenge metadata
**File**: `src/app/speedrun/challenges.ts`
**Changes**:
- Remove `{ id: "autocomplete", ... }` entry
- Add `{ id: "wizard", name: "Wizard Challenge", description: "Complete a multi-step form with validation" }` in its place

#### 2. Create wizard challenge
**File**: `src/app/speedrun/challenges/wizard.tsx` (new)
**Changes**:
Implement a 3-step wizard:

**Step 1 — Personal Info:**
- Phone number input with validation (must match pattern like `+1234567890` or `(123) 456-7890`)
- "Accept cookies" checkbox (must be checked to proceed)
- "Next" button — validates before advancing, shows inline errors if invalid

**Step 2 — Location:**
- City autocomplete input (reuse `SPEEDRUN_CITIES` data and debounced search pattern from the old Autocomplete challenge)
- Must select a city to proceed
- "Back" / "Next" buttons

**Step 3 — Review & Submit:**
- Shows entered phone, cookies acceptance, selected city
- "Submit" button

Track completion conditions:
- `hasValidPhone: boolean`
- `hasAcceptedCookies: boolean`
- `hasSelectedCity: boolean`
- `hasSubmitted: boolean`

Completion: `hasSubmitted` (which implies all prior steps passed)

Checklist:
- `"Enter a valid phone number"` → `hasValidPhone`
- `"Accept cookies"` → `hasAcceptedCookies`
- `"Select a city"` → `hasSelectedCity`
- `"Submit the form"` → `hasSubmitted`

#### 3. Update data file
**File**: `src/app/speedrun/challenges/data.ts`
**Changes**: Keep `SPEEDRUN_CITIES` (used by Wizard). Remove `SPEEDRUN_USERS` (no longer used).

#### 4. Delete autocomplete challenge
**File**: `src/app/speedrun/challenges/autocomplete.tsx`
**Changes**: Delete this file entirely

#### 5. Update orchestrator
**File**: `src/app/speedrun/challenge/page.tsx`
**Changes**:
- Remove `AutocompleteChallengeWrapper` import
- Add `WizardChallengeWrapper` import
- Replace autocomplete grid entry with wizard entry
- Update indices to match new `CHALLENGES_LIST`

#### 6. Update barrel export
**File**: `src/app/speedrun/challenges/index.ts`
**Changes**: Remove autocomplete export, add wizard export

### Success Criteria:

#### Automated Verification:
- [ ] TypeScript compiles: `pnpm build`
- [ ] Lint passes: `pnpm lint`
- [ ] Autocomplete file removed: `! test -f src/app/speedrun/challenges/autocomplete.tsx`
- [ ] Wizard file exists: `ls src/app/speedrun/challenges/wizard.tsx`
- [ ] No references to autocomplete in orchestrator: `grep -c "autocomplete" src/app/speedrun/challenge/page.tsx` (expect 0)

#### Manual Verification:
- [ ] Navigate to speedrun, verify no "Autocomplete Challenge" card exists
- [ ] Find Wizard Challenge card
- [ ] Test Step 1: enter invalid phone → verify error shown; enter valid phone + check cookies → "Next" works
- [ ] Test Step 2: type city name → verify autocomplete dropdown appears; select a city → "Next" works
- [ ] Test Step 3: verify review shows entered data; click "Submit" → challenge completes
- [ ] Test "Back" navigation works between steps
- [ ] Complete entire speedrun — verify wizard is tracked correctly in results

**Implementation Note**: After completing this phase, pause for manual confirmation.

---

## Phase 6: Reorder, Categories, and Per-Challenge Timing

### Overview
Three layout/data improvements: reorder challenges by difficulty progression, add visual category grouping, and track per-challenge completion times.

### Changes Required:

#### 1. Reorder challenges by difficulty
**File**: `src/app/speedrun/challenges.ts`
**Changes**: Reorder `CHALLENGES_LIST` to follow this difficulty progression:

```
Basic Interactions:
  1. Checkbox (2 clicks — warmup)
  2. Buttons (5 clicks + loading wait)
  3. Table (filter + select + add)

Dialog & Overlay:
  4. Dialogs (trigger 3 native dialogs)
  5. Popovers (open popover + click inside)
  6. Visibility (occluded elements)

Input & Forms:
  7. Math (read + compute + type)
  8. Memory (read, hide, recall)
  9. OTP (time-sensitive TOTP)
  10. Dates (2 date picker types)
  11. Wizard (multi-step form with validation)

Navigation & Discovery:
  12. Tabs (tab switching + accordion + text extraction)
  13. IFrame (iframe context + scroll)
  14. Infinite Scroll (scroll + wait + read)

Spatial & File:
  15. Reorder & Slider (drag + slider)
  16. Graph (drag-and-drop + connect nodes)
  17. File Challenge (download + upload)
```

#### 2. Add category metadata
**File**: `src/app/speedrun/challenges.ts`
**Changes**: Add a `category` field to each challenge entry, or define a separate `CHALLENGE_CATEGORIES` array that groups challenge IDs. The latter is cleaner:

```typescript
export const CHALLENGE_CATEGORIES = [
  { name: "Basic Interactions", challengeIds: ["checkbox", "buttons", "table"] },
  { name: "Dialog & Overlay", challengeIds: ["dialogs", "popovers", "visible"] },
  { name: "Input & Forms", challengeIds: ["math", "memory", "otp", "dates", "wizard"] },
  { name: "Navigation & Discovery", challengeIds: ["tabs", "iframe", "infinite-scroll"] },
  { name: "Spatial & File", challengeIds: ["reorder-slider", "graph", "file-upload"] },
] as const;
```

#### 3. Update orchestrator grid with categories
**File**: `src/app/speedrun/challenge/page.tsx`
**Changes**:
- Refactor the grid to iterate over `CHALLENGE_CATEGORIES` instead of hardcoding each challenge
- For each category, render a section divider then the challenges in that category
- Map challenge IDs to their wrapper components via a lookup object
- This eliminates the fragile `challenges[N]` index pattern entirely

#### 4. Add per-challenge timing
**File**: `src/app/speedrun/challenge/page.tsx`
**Changes**:
- Add state: `challengeTimes: Record<string, number>` — maps `challengeId` → completion timestamp (ms since speedrun start)
- In `markChallengeComplete`, also record `Date.now() - startTimeRef.current` for the completed challenge
- Pass `challengeTimes` to `FinalResultsPage` and `ResultsSharePage`

**File**: `src/app/speedrun/challenges/results-display.tsx` (or wherever FinalResultsPage lives after Phase 1)
**Changes**:
- Accept `challengeTimes: Record<string, number>` prop
- In the challenges breakdown grid, show completion time next to each completed challenge:
  ```
  ✓ Checkbox Challenge — 0:03
  ✓ Buttons Challenge — 0:15
  ✗ Graph Challenge
  ```
- In `ResultsSharePage`, include `challengeTimes` in the `resultsData` object for the share URL

**File**: `src/app/speedrun/results/page.tsx`
**Changes**:
- Update `ResultsData` interface to include optional `challengeTimes: Record<string, number>`
- Display per-challenge times in the breakdown if present

### Success Criteria:

#### Automated Verification:
- [ ] TypeScript compiles: `pnpm build`
- [ ] Lint passes: `pnpm lint`
- [ ] Challenge order matches plan: `grep '"id"' src/app/speedrun/challenges.ts` (verify order)

#### Manual Verification:
- [ ] Navigate to speedrun — verify challenges appear in difficulty order with category labels
- [ ] Verify "Basic Interactions" group appears first with Checkbox, Buttons, Table
- [ ] Complete 3-4 challenges, stop speedrun early
- [ ] Verify results page shows individual completion times next to completed challenges
- [ ] Click "Share Results" — verify the share URL decodes with `challengeTimes` data
- [ ] Open the share URL in a new tab — verify the results page shows per-challenge times

**Implementation Note**: After completing this phase, pause for manual confirmation.

---

## Manual E2E Verification

After all phases are complete, run the full end-to-end verification:

```bash
# 1. Build check
pnpm build

# 2. Start dev server
PORT=3001 pnpm dev

# 3. Navigate to speedrun
# Open http://localhost:3001/speedrun

# 4. Select Easy mode (no time limit) and start

# 5. Verify challenge order matches difficulty progression with category labels

# 6. Complete ALL 17 challenges:
#    - Checkbox: toggle switch + check box
#    - Buttons: click 4 button types + loading button wait + confirm
#    - Table: filter + select + add row
#    - Dialogs: trigger alert, confirm, prompt
#    - Popovers: open popover + click action
#    - Visibility: click hidden + partially hidden buttons
#    - Math: solve arithmetic
#    - Memory: remember string + type back
#    - OTP: enter TOTP code
#    - Dates: select from both date pickers
#    - Wizard: complete 3-step form
#    - Tabs: find codes in tabs/accordions
#    - IFrame: scroll + click in iframe
#    - Infinite Scroll: scroll to load + enter code
#    - Reorder & Slider: drag order + slide to 100%
#    - Graph: drag nodes + connect
#    - File Challenge: download + re-upload
#
# 7. Verify "All Challenges Complete!" result screen
# 8. Verify per-challenge timing shown in results
# 9. Click "Share Results" — verify share URL works
# 10. Open share URL in new tab — verify results page renders correctly with timing data

# 11. Test Hard mode (2m30s) — verify timer enforces limit
# 12. Test stopping early — verify partial results are correct
```

## References

- Research document: `thoughts/taras/research/2026-02-16-speedrun-page-review.md`
- Challenge implementations: `src/app/speedrun/challenge/page.tsx`
- Challenge metadata: `src/app/speedrun/challenges.ts`
- File upload patterns: `src/app/files/page.tsx`
- Loading state patterns: `src/app/loading-demo/page.tsx`
- Infinite scroll patterns: `src/app/pagination/page.tsx`
- Wizard patterns: `src/app/wizard/page.tsx`
