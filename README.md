# desplega.ai Evals

AI QA Agent evaluation platform for testing AI agents' ability to interact with web UI elements.

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the available evaluation scenarios.

## Current Scenarios

| Category | Scenario | Description |
|----------|----------|-------------|
| Forms | Checkboxes | Toggle switches, radio buttons, multi-select with "Select All" |
| Forms | Buttons | Price selection, icon buttons, style variants, disabled states |
| Forms | Sliders | Range inputs, step sliders, multi-range, vertical sliders |
| Data | Table | Filtering, row selection, add/remove rows |
| Data | Visibility | Overlapping elements, partial occlusion, z-index challenges |
| Date/Time | Pickers | 22 variants using native, react-day-picker, react-datepicker, react-aria |
| Dialogs | Native | Alert, confirm, prompt with activity logging |
| Tooltips | Hover/Click | Directional tooltips, popovers with actions and inputs |
| Files | Upload/Download | Drag-and-drop upload, file list management, downloads |
| Maps | Restaurants | Mapbox markers, popups, sidebar interaction |
| Graph | Nodes | Drag-and-drop nodes, connections, selection, deletion |
| Auth | OTP | QR codes, TOTP validation, individual digit fields |
| States | Loading | Skeletons, spinners, full-page overlays |
| Embed | Iframe | Embedded content, refresh, sandbox config |
| Challenge | Speedrun | Timed multi-task challenge across all scenarios |

## Proposed Scenarios

The following scenarios are planned for future implementation:

### 1. Autocomplete / Typeahead Search ✅ (Implemented)
Tests the agent's ability to:
- Type partial text and wait for suggestions
- Select from a dynamically populated dropdown
- Handle debounced input (results appear after typing stops)
- Deal with "no results" states

**Why it's challenging:** Requires understanding timing, knowing when suggestions have loaded, and coordinating typing with selection.

### 2. Drag-to-Reorder List
Tests the agent's ability to:
- Drag items to reorder (e.g., priority list, playlist)
- Understand relative positioning ("move item 3 above item 1")
- Verify the new order after drop

**Why it's challenging:** Reordering within a list is a different interaction pattern than drag-and-drop onto a canvas.

### 3. Multi-Step Wizard / Form
Tests the agent's ability to:
- Navigate between steps (Next/Back buttons)
- Understand conditional steps (e.g., skip step 2 if checkbox unchecked)
- Handle validation blocking progression
- Complete a multi-page flow end-to-end

**Why it's challenging:** Requires maintaining context across multiple "pages" and understanding flow control.

### 4. Tabs and Accordions ✅ (Implemented)
Tests the agent's ability to:
- Click tabs to reveal hidden content
- Find content that's behind inactive tabs
- Expand/collapse accordions to access nested data

**Why it's challenging:** Content is in the DOM but not visible without interaction. Agents must know to "look" for hidden content.

### 5. Toast Notifications
Tests the agent's ability to:
- Trigger actions that show temporary notifications
- Click a toast before it auto-dismisses
- Handle multiple stacked toasts
- Interact with toast action buttons

**Why it's challenging:** Time-sensitive elements that disappear. Tests if the agent can react quickly or wait appropriately.

### 6. Combobox / Multi-Select Dropdown
Tests the agent's ability to:
- Open a complex dropdown (like react-select or headless UI combobox)
- Search/filter within the dropdown
- Select multiple items with chips/tags
- Remove selected items

**Why it's challenging:** These components have complex internal state and don't behave like native `<select>` elements.

### 7. Context Menu (Right-Click)
Tests the agent's ability to:
- Right-click to open a context menu
- Select options from the context menu
- Handle nested context menus

**Why it's challenging:** Most AI agents focus on left-click. Right-click interactions are often overlooked.

### 8. Infinite Scroll / Pagination
Tests the agent's ability to:
- Scroll to load more items
- Navigate traditional pagination (page 1, 2, 3...)
- Find an item that's not initially loaded ("find item #47")

**Why it's challenging:** Requires understanding that not all data is visible and taking action to load more.

### 9. Shopping Cart
Tests a realistic e-commerce flow:
- Add items to cart
- Adjust quantities
- Remove items
- Apply a discount code
- See totals update dynamically

**Why it's challenging:** Combines multiple interaction types (buttons, inputs, state) in a real-world scenario.

### 10. Tree View / File Explorer
Tests the agent's ability to:
- Expand/collapse nested nodes
- Navigate deep hierarchies
- Select items at various depths
- Understand parent-child relationships

**Why it's challenging:** Deeply nested structures with expand/collapse toggles require understanding hierarchy.

## Tech Stack

- Next.js 16.1 with App Router
- React 19.2.3
- TypeScript (strict mode)
- Tailwind CSS v4
- pnpm
