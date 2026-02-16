---
date: 2026-02-16T00:10:00Z
topic: "Speedrun Page Review"
researcher: Claude
git_branch: main
status: complete
tags:
  - speedrun
  - feedback
  - ui-challenges
---

# Speedrun Page Review: Feedback & Suggestions

## Research Question

Analyze the speedrun page and provide feedback on:
1. Missing challenges that could be interesting to add
2. Any challenges that might be redundant and could be removed
3. Suggestions for improving the layout or organization of the page

---

## Current State

The speedrun page has **16 challenges** displayed in a 2-column grid (with Graph spanning 2 cols). It supports 4 difficulty modes (Easy/Normal/Hard/Dark Souls) with time limits. The page lives at `/speedrun/challenge/page.tsx` (~2728 lines, single monolithic file).

### Current Challenges

| # | Challenge | What the agent does | Interaction types tested |
|---|-----------|---------------------|------------------------|
| 1 | Checkbox | Toggle switch + check checkbox | Toggle, checkbox |
| 2 | Buttons | Click 4 button variants (price, icon, pill, ghost) | Click, varied button styles |
| 3 | Table | Filter + select row + add row | Text input, table interaction, click |
| 4 | Visibility | Click button behind overlay + partially hidden button | Occluded elements, overflow clipping |
| 5 | Graph | Drag Start/End nodes to canvas + connect them | Drag-and-drop, ReactFlow handles |
| 6 | Reorder & Slider | Drag items into order + slide to 100% | Drag reorder, range slider |
| 7 | Dialogs | Trigger alert, confirm, prompt | Native browser dialogs |
| 8 | Popovers | Open popover + click action inside | Hover/click popover, nested click |
| 9 | IFrame | Scroll inside iframe + click button | IFrame context, scroll-within-frame |
| 10 | Math | Solve random arithmetic | Read + compute + type answer |
| 11 | Memory | Remember hidden string + type it back | Read, hide, recall |
| 12 | OTP | Enter correct 6-digit TOTP code | Read secret, generate TOTP, time-sensitive input |
| 13 | Autocomplete | Select 2 users + 1 city from typeahead | Debounced search, dropdown selection |
| 14 | Dates | Select from native HTML date picker + react-datepicker | Date picker interaction (2 types) |
| 15 | Tabs | Find hidden codes in tabs + nested accordion | Tab switching, accordion expansion, text extraction |

---

## 1. Missing Challenges Worth Adding

### High-value additions (test distinct, common interaction patterns)

#### A. File Download + Upload Challenge
**Source:** `/files` page already exists.
**What it tests:** Downloading a file, then re-uploading that same file via `<input type="file">`.
**Why it matters:** File upload is one of the hardest interactions for AI agents. Many agents struggle with the invisible file input pattern. Adding a download-first step tests the full round-trip: download a provided file, then upload that exact file back. This is a genuinely distinct capability test that nothing else in the speedrun covers.
**Suggested implementation:** Provide a download link for a small file. Agent downloads it, then uploads that same file via a file input. Verify the uploaded file matches the original. 2-step completion (download + upload).
**Decision:** APPROVED - implement as download-then-reupload.

#### B. Loading/Wait State (integrated into Buttons Challenge)
**Source:** `/loading-demo` page exists for reference.
**What it tests:** Clicking a button that triggers a loading state, then waiting for content to resolve before interacting.
**Why it matters:** Most real-world apps have loading states. Agents that click too early or can't detect "ready" state fail constantly.
**Suggested implementation:** Instead of a separate challenge, modify one of the Buttons challenge buttons to have a loading state. E.g., clicking a button shows a spinner/skeleton for ~2s, then reveals a second button that must be clicked to complete that sub-task. Tests patience/polling without adding a new challenge card.
**Decision:** APPROVED - integrate into existing Buttons challenge (not a new card).

#### C. Infinite Scroll Challenge
**Source:** `/pagination` page exists for reference.
**What it tests:** Scrolling to trigger infinite scroll loading, then reading a value from a newly loaded row.
**Why it matters:** Tests the agent's ability to scroll, wait for new content to load dynamically, and extract data from it. A very common real-world pattern distinct from the iframe scroll challenge.
**Suggested implementation:** A list with ~5 visible items. Scrolling down once triggers a load of additional rows (with a brief loading indicator). Agent must then find and report/enter the value of a specific row from the newly loaded data. Keep it to a single scroll + read.
**Decision:** APPROVED - infinite scroll with single scroll, then read value from specific loaded row.

#### D. Multi-Step Wizard Challenge (absorbs Autocomplete)
**Source:** `/wizard` page exists.
**What it tests:** Sequential form completion with validation, conditional paths, and location autocomplete.
**Why it matters:** Multi-step forms are extremely common in web apps. Tests the agent's ability to handle form flows with next/back navigation, validation feedback, and autocomplete inputs. By absorbing the current standalone Autocomplete challenge into a wizard step, we consolidate two cards into one richer challenge.
**Suggested implementation:** 2-3 step wizard:
- Step 1: Personal info with phone number validation (must match format) + accept cookies checkbox (required)
- Step 2: Location autocomplete (reuse the city autocomplete pattern from the current Autocomplete challenge)
- Step 3: Review + submit
The current standalone Autocomplete challenge would be removed since it moves into the wizard.
**Decision:** APPROVED - wizard with phone validation, cookies checkbox, and location autocomplete step. Replaces standalone Autocomplete challenge.

### Removed from consideration

#### ~~E. Keyboard Shortcut Challenge~~ - REMOVED
Dropped per review. Too niche for current scope.

### Lower-value / skip for now

- **Storage Challenge** (localStorage/cookies): More of an API test than a UI interaction test. Agents that interact with DOM shouldn't need to test JS API calls. Skip.
- **Map/Restaurants Challenge**: Requires Mapbox, adds complexity. Map interactions are important but niche. The graph challenge already tests spatial interaction. Skip for now.
- **WebMCP Challenge**: Very domain-specific to MCP concepts. Not a general-purpose UI challenge. Skip.

---

## 2. Challenges That Could Be Redundant / Removed

### Potentially redundant

#### Checkbox Challenge (consider merging)
The checkbox challenge is the simplest in the speedrun: toggle a switch + check a checkbox. That's essentially 2 clicks. The **Buttons Challenge** already tests clicking various button types. These two together feel like "click things 101" - the checkbox challenge adds minimal differentiation.

**Recommendation:** Don't remove entirely, but consider making it part of the Buttons Challenge (add a switch toggle + checkbox as 2 extra tasks in the Buttons card). This frees up a card slot.

#### Reorder & Slider (partially redundant with Graph)
Both test drag-and-drop, but they test it differently:
- Graph: drag from palette onto canvas + connect handles
- Reorder: drag items to reorder a list + use a range slider

The slider portion is unique. The drag-to-reorder is somewhat redundant with Graph's drag. However, list reordering vs canvas placement _are_ genuinely different interaction patterns. **Keep as-is** - the overlap is minor enough and the slider adds value.
**Decision:** KEEP - confirmed by review.

#### Math Challenge vs Memory Challenge
Both are "read something, then type a response" - but Math tests computation while Memory tests recall of hidden text. These are different cognitive tasks. **Keep both** - Memory in particular is a great test of agent state management.

### Verdict
No challenges are truly redundant enough to remove outright. The Checkbox challenge is the weakest standalone card, but it's also the "warm-up" challenge. If you need to free up space, merge it into Buttons.

---

## 3. Layout & Organization Suggestions

### A. Challenge ordering should follow difficulty progression

Current order feels somewhat random. Suggested progression:

1. **Checkbox** (easiest - 2 clicks)
2. **Buttons** (click 4 things)
3. **Table** (filter + select + add)
4. **Dialogs** (trigger 3 native dialogs)
5. **Popovers** (open popover + click inside)
6. **Math** (read + compute + type)
7. **Autocomplete** (search + select from dropdown)
8. **Dates** (2 date picker types)
9. **Tabs** (navigate tabs/accordions + extract codes)
10. **Memory** (read, hide, recall)
11. **OTP** (time-sensitive TOTP)
12. **Reorder & Slider** (drag + slider)
13. **Visibility** (occluded elements)
14. **IFrame** (iframe context switching + scroll)
15. **Graph** (drag-and-drop + connect nodes)

Rationale: Start with simple clicks, progress to text input, then complex UI patterns, then spatial/drag interactions. This gives agents the best chance to build up partial scores even if they can't complete everything.

### B. Category grouping with visual labels

Group challenges into categories with subtle section dividers or labels:

- **Basic Interactions** (Checkbox, Buttons, Table)
- **Dialog & Overlay** (Dialogs, Popovers, Visibility)
- **Input & Forms** (Math, Memory, OTP, Autocomplete, Dates)
- **Navigation & Discovery** (Tabs, IFrame)
- **Spatial & Drag** (Reorder & Slider, Graph)

This would help viewers (and agents) understand the challenge categories at a glance. Could be as simple as a small `<h2>` divider between groups.

### C. Per-challenge timing

Add individual challenge completion timestamps (not just total time). This would show which challenges the agent was fast/slow on in the results. The data is valuable for benchmarking.

**Implementation:** Record `Date.now()` when each challenge completes, compute delta from start. Display in the results breakdown (e.g., "Table: completed at 0:45").

### D. Challenge card size consistency

Currently, Graph spans 2 columns (`md:col-span-2`) while everything else is 1 column. This creates an uneven visual rhythm. Consider either:
- Making all challenges 1-column (shrink the graph canvas)
- Making 2-3 other complex challenges also span 2 columns (Table, Autocomplete, Tabs) for a more intentional layout rhythm

### E. The monolithic file problem

`challenge/page.tsx` is ~2728 lines. Every challenge is defined inline. This is fine for now but will become painful as you add more challenges. Consider extracting each challenge wrapper into its own file under `speedrun/challenges/`:

```
speedrun/
  challenges/
    checkbox.tsx
    buttons.tsx
    table.tsx
    ...
  challenge/
    page.tsx  (imports + orchestration only)
  challenges.ts  (challenge list metadata)
```

This is a refactor suggestion, not a layout change. Worth doing when adding new challenges.

### F. Mobile responsiveness

The 2-column grid drops to 1-column on mobile (`grid-cols-1 md:grid-cols-2`), but many challenge cards contain complex interactions (date pickers, tables, graphs) that may not render well on small screens. Given this is an AI agent eval tool (agents won't use mobile), this is low priority - but worth noting.

---

## Summary of Decisions

| Status | Action | Details |
|--------|--------|---------|
| APPROVED | Add **File Download + Upload** challenge | Download file, then re-upload the same file |
| APPROVED | Integrate **Loading/Wait State** into Buttons | Modify a button to have a 2s loading state before revealing next interaction |
| APPROVED | Add **Infinite Scroll** challenge | Single scroll to load more, then read value from specific loaded row |
| APPROVED | Add **Wizard** challenge (absorbs Autocomplete) | Multi-step form with phone validation, cookies checkbox, location autocomplete. Removes standalone Autocomplete |
| REMOVED | ~~Keyboard Shortcuts~~ | Dropped - too niche for current scope |
| KEEP | Reorder & Slider | Confirmed as distinct from Graph |
| Pending | Reorder challenges by difficulty progression | Better partial scoring for agents |
| Pending | Add per-challenge timing to results | Better benchmarking data |
| Pending | Consider merging Checkbox into Buttons | Frees up a card slot |
| Pending | Add category grouping labels | Visual organization |
| Pending | Extract challenges into separate files | Maintainability |

### Net challenge count change
- Current: 16 challenges (15 listed + graph spanning 2 cols)
- Add: File Download+Upload, Infinite Scroll, Wizard (+3)
- Remove: Autocomplete (absorbed into Wizard) (-1)
- Modify: Buttons (add loading state) (0)
- **New total: 18 challenges**

---

## Code References

- Challenge definitions: `src/app/speedrun/challenges.ts:1-17`
- Challenge page (all implementations): `src/app/speedrun/challenge/page.tsx:1-2728`
- Results page: `src/app/speedrun/results/page.tsx:1-211`
- Home page (all routes): `src/app/page.tsx:7-31`
- Existing file upload demo: `src/app/files/page.tsx`
- Existing loading demo: `src/app/loading-demo/page.tsx`
- Existing pagination demo: `src/app/pagination/page.tsx`
- Existing wizard demo: `src/app/wizard/page.tsx`
- Existing keyboard demo: `src/app/keyboard/page.tsx`
