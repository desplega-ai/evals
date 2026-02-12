---
date: 2026-02-11T12:15:00Z
topic: "WebMCP Demo Page"
type: plan
status: draft
---

# WebMCP Demo Page Implementation Plan

## Overview

Create a new `/webmcp` page in the desplega.ai-evals app that demonstrates WebMCP API concepts as interactive UI components. Since WebMCP (`window.navigator.modelContext`) is a proposed browser API not yet natively shipped in browsers, we'll include a **working polyfill** (matching the pattern used by [browser-use's test suite](https://github.com/browser-use/browser-use/blob/375f467/tests/ci/test_webmcp.py)) so the page serves as both a **visual demo** and a **real WebMCP test target** for tools like browser-use. The page will showcase the core WebMCP patterns: tool registration, tool execution, context updates, and user interaction requests.

## Current State Analysis

- The app has 20+ demo pages under `/src/app/`, each self-contained with client-side state
- All pages follow the pattern: `"use client"`, `Link` back to home, `useState` for state, Tailwind for styling
- Home page maintains a `routes` array in `src/app/page.tsx:7-30` that links to all pages
- Dummy data is inline in each page component (no shared data files)

### Key Discoveries:
- Page pattern: `src/app/table/page.tsx:1-6` — `"use client"` + imports + default export function
- Back link pattern: `src/app/buttons/page.tsx:28-33` — standard `← Back to Home` link
- Layout wrapper: `src/app/buttons/page.tsx:24-25` — `<div className="font-sans min-h-screen p-8"><main className="max-w-6xl mx-auto">`
- State management: All client-side with `useState`, no external stores
- Home routes: `src/app/page.tsx:7-30` — array of `{ path, name, description }` objects

## Desired End State

A `/webmcp` page with these interactive sections, each demonstrating a core WebMCP concept:

1. **Tool Registry** — A visual panel showing registered tools with their schemas. Users can register/unregister tools dynamically. This simulates `provideContext()` and `registerTool()`/`unregisterTool()`.

2. **Stamp Collection** (from the proposal's example) — An interactive stamp database where:
   - A table displays stamps with name, description, year, and image URL
   - An "Add Stamp" form lets users add stamps manually (simulating human UI)
   - A "Tool Call" panel lets users invoke the `add-stamp` tool with JSON input (simulating agent tool calls)
   - Both methods update the same data, demonstrating the WebMCP principle of code reuse between human UI and agent tools

3. **Tool Call Console** — An interactive console where:
   - Users can select a registered tool from a dropdown
   - Fill in parameters based on the tool's `inputSchema`
   - Execute the tool and see the structured response
   - View a log of all tool calls (simulating agent-tool interaction)

4. **User Interaction Request** — A section demonstrating `agent.requestUserInteraction()`:
   - A "Buy Product" flow where the tool requests user confirmation before proceeding
   - A confirmation dialog appears mid-execution
   - The tool response changes based on user accept/reject

5. **Context Switching** — A section demonstrating dynamic context updates:
   - Toggle between "Browse Mode" and "Edit Mode"
   - Each mode exposes different tools (simulating SPA state changes)
   - The tool registry panel updates to reflect available tools per mode

The page should be navigable from the home page and follow all existing conventions.

## Quick Verification Reference

Common commands:
- `pnpm build` — Verify build passes
- `pnpm lint` — Verify linting passes
- `PORT=3001 pnpm dev` — Run dev server

Key files:
- `src/app/webmcp/page.tsx` — Main page implementation
- `src/app/page.tsx` — Home page (add route)

## What We're NOT Doing

- **Not using an external polyfill library** — We'll inline a minimal `navigator.modelContext` polyfill (same pattern as browser-use's tests) directly in the page.
- **Not creating a separate MCP server** — Tool calls are handled locally in component state via the polyfill, which is exactly what WebMCP proposes.
- **Not adding service worker support** — Out of scope per the proposal's "future improvements" section.
- **Not adding external dependencies** — Pure React + Tailwind + inline polyfill, consistent with all other pages.

## Implementation Approach

The page includes a **real `navigator.modelContext` polyfill** injected via `<Script>` (next/script with `beforeInteractive` strategy) or a `useEffect`. The polyfill sets up `provideContext`, `registerTool`, and `unregisterTool` on `window.navigator.modelContext`, with tools whose `execute` callbacks bridge to React state updates. This means:

- **Visual UI** shows registered tools, call logs, and state changes for human users
- **`navigator.modelContext`** is a real, callable API that browser-use and similar tools can discover and invoke
- Both paths (visual UI interactions and programmatic tool calls) update the same underlying state

Build the page in two phases:
1. **Phase 1**: Create the page with the Stamp Collection example (the proposal's primary demo), the `navigator.modelContext` polyfill, and add it to the home page routes. This gives us a working page that's already a real WebMCP test target.
2. **Phase 2**: Add the Tool Registry panel, Tool Call Console, User Interaction Request, and Context Switching sections to make it a comprehensive WebMCP demo.

---

## Phase 1: Stamp Collection Demo + Page Setup

### Overview
Create the `/webmcp` page with the stamp collection example from the proposal, including a real `navigator.modelContext` polyfill. This is the core demo that shows how WebMCP lets the same functionality be used by both human UI (forms) and AI agents (tool calls), and it makes the page a real WebMCP test target from day one.

### Changes Required:

#### 1. Create the WebMCP page
**File**: `src/app/webmcp/page.tsx` (new file)
**Changes**:
- Create a `"use client"` page component following existing conventions
- Add back link to home
- Implement stamp collection data with `useState`:
  ```
  stamps: Array<{ id, name, description, year, imageUrl }>
  ```
- Seed with 3-4 dummy stamps (historical stamps like "Penny Black", "Inverted Jenny", etc.)

**navigator.modelContext polyfill** — Set up via `useEffect` on mount:

```typescript
useEffect(() => {
  // Minimal navigator.modelContext polyfill (W3C WebMCP spec)
  // Matches pattern from browser-use test suite
  const tools: Record<string, any> = {};

  (navigator as any).modelContext = {
    provideContext(ctx: { tools?: any[] }) {
      // Clear existing tools, register new ones
      Object.keys(tools).forEach(k => delete tools[k]);
      const ts = ctx?.tools || [];
      for (const t of ts) tools[t.name] = t;
    },
    registerTool(tool: any) {
      tools[tool.name] = tool;
      return { unregister: () => { delete tools[tool.name]; } };
    },
    unregisterTool(name: string) {
      delete tools[name];
    },
  };

  // Register stamp tools — execute callbacks update React state
  (navigator as any).modelContext.provideContext({
    tools: [
      {
        name: "add-stamp",
        description: "Add a new stamp to the collection",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string", description: "The name of the stamp" },
            description: { type: "string", description: "A brief description" },
            year: { type: "number", description: "The year the stamp was issued" },
            imageUrl: { type: "string", description: "Optional image URL" },
          },
          required: ["name", "description", "year"],
        },
        execute(args: any) {
          // Bridge to React state via ref or callback
          addStampRef.current(args.name, args.description, args.year, args.imageUrl);
          return {
            content: [{ type: "text", text: `Stamp "${args.name}" added successfully!` }],
          };
        },
      },
      {
        name: "get-stamps",
        description: "Get all stamps in the collection",
        inputSchema: { type: "object", properties: {}, required: [] },
        execute() {
          return {
            content: [{ type: "text", text: JSON.stringify(stampsRef.current) }],
          };
        },
      },
    ],
  });

  return () => { delete (navigator as any).modelContext; };
}, []);
```

**Note**: Use `useRef` to hold current stamps state and `addStamp` function so the polyfill's `execute` callbacks always reference current state without stale closures.

- **Human UI section**: A form with fields for name, description, year, imageUrl + submit button
- **Agent Tool Call section**: A panel styled differently (e.g., monospace/terminal look) where:
  - A JSON textarea pre-populated with the `add-stamp` tool's input schema
  - An "Execute Tool" button that parses the JSON and calls the same `addStamp()` function
  - A response area showing the structured MCP-style response
- **Stamps table**: Displaying all stamps in a table, updated by both form and tool call
- Include a brief explainer text at the top linking to the WebMCP proposal

#### 2. Add route to home page
**File**: `src/app/page.tsx`
**Changes**:
- Add entry to the `routes` array:
  ```
  { path: "/webmcp", name: "WebMCP Demo", description: "WebMCP API concepts: tool registration, execution, and context" }
  ```

### Success Criteria:

#### Automated Verification:
- [x] Build passes: `pnpm build`
- [x] Lint passes: `pnpm lint` (note: `next lint` removed in Next.js 16.1, pre-existing issue)
- [x] Page file exists: `ls src/app/webmcp/page.tsx`
- [x] Route added: `grep -c "webmcp" src/app/page.tsx`

#### Manual Verification:
- [ ] Navigate to http://localhost:3001/webmcp — page loads with stamp collection
- [ ] Home page shows "WebMCP Demo" link and navigates to /webmcp
- [ ] Add a stamp via the form — it appears in the table
- [ ] Add a stamp via the tool call JSON panel — it appears in the same table
- [ ] Tool call response shows structured MCP-style response content
- [ ] Back link returns to home page
- [ ] Open browser devtools console and verify `navigator.modelContext` exists
- [ ] Run in console: `navigator.modelContext.provideContext` is a function
- [ ] (Stretch) If browser-use is available, verify tool discovery works against localhost:3001/webmcp

**Implementation Note**: After completing this phase, pause for manual confirmation. Create commit after verification passes.

---

## Phase 2: Full WebMCP Feature Demo

### Overview
Add the remaining WebMCP concepts: tool registry visualization, interactive tool console, user interaction requests, and context switching. These demonstrate the full breadth of the WebMCP proposal.

### Changes Required:

#### 1. Tool Registry Panel
**File**: `src/app/webmcp/page.tsx`
**Changes**:
- Add a "Registered Tools" panel at the top of the page
- Display each tool as a card showing: name, description, and input schema (collapsible)
- Start with 3 tools registered: `add-stamp`, `get-stamps`, `update-stamp`
- Add "Unregister" button per tool and "Register New Tool" button
- When a tool is unregistered, it's removed from the panel and unavailable in the console
- This simulates `registerTool()` / `unregisterTool()` / `provideContext()`

Tool definitions follow the WebMCP schema structure:

```typescript
interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, {
      type: "string" | "number";
      description: string;
    }>;
    required: string[];
  };
  execute: (params: Record<string, unknown>) => ToolResponse;
}

interface ToolResponse {
  content: Array<{ type: "text"; text: string }>;
}

// All tools defined in a single array, filtered by context mode
const ALL_TOOLS: ToolDefinition[] = [
  {
    name: "add-stamp",
    description: "Add a new stamp to the collection",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "The name of the stamp" },
        description: { type: "string", description: "A brief description" },
        year: { type: "number", description: "The year issued" },
        imageUrl: { type: "string", description: "Optional image URL" },
      },
      required: ["name", "description", "year"],
    },
    execute: (params) => { /* calls addStamp() */ },
  },
  {
    name: "get-stamps",
    description: "Get all stamps in the collection",
    inputSchema: { type: "object", properties: {}, required: [] },
    execute: () => { /* returns stamps array as JSON text */ },
  },
  {
    name: "update-stamp",
    description: "Update an existing stamp by ID",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "number", description: "The stamp ID to update" },
        name: { type: "string", description: "New name" },
        description: { type: "string", description: "New description" },
        year: { type: "number", description: "New year" },
      },
      required: ["id"],
    },
    execute: (params) => { /* updates stamp in state */ },
  },
  // Additional tools for other context modes:
  // search-stamps, delete-stamp, export-collection, import-collection
];
```

#### 2. Tool Call Console
**File**: `src/app/webmcp/page.tsx`
**Changes**:
- Add a console-style panel below the tool registry
- Dropdown to select from registered tools
- Dynamic form fields generated from the selected tool's `inputSchema` (text inputs for strings, number inputs for numbers)
- "Execute" button that runs the tool and shows the structured response
- Call log: a scrollable list showing past tool calls with timestamp, tool name, input, and output
- This is an evolution of the simple JSON textarea from Phase 1 — replace the Phase 1 tool call section with this more polished console

Call log entry structure:

```typescript
interface CallLogEntry {
  id: number;
  timestamp: Date;
  toolName: string;
  input: Record<string, unknown>;
  output: ToolResponse;
}

// State for the console
const [callLog, setCallLog] = useState<CallLogEntry[]>([]);
const [selectedTool, setSelectedTool] = useState<string>("");
const [toolParams, setToolParams] = useState<Record<string, string>>({});
```

Dynamic form generation from schema:

```tsx
{/* For each property in selectedTool.inputSchema.properties */}
{Object.entries(selectedTool.inputSchema.properties).map(([key, prop]) => (
  <div key={key}>
    <label className="text-sm font-medium text-gray-700">{key}</label>
    <input
      type={prop.type === "number" ? "number" : "text"}
      placeholder={prop.description}
      value={toolParams[key] || ""}
      onChange={(e) => setToolParams(prev => ({ ...prev, [key]: e.target.value }))}
      className="w-full px-3 py-2 border border-gray-300 rounded ..."
    />
  </div>
))}
```

#### 3. User Interaction Request Demo
**File**: `src/app/webmcp/page.tsx`
**Changes**:
- Add a "User Interaction" section
- "Buy Stamp" button that triggers a simulated tool execution flow:
  1. Click "Buy Stamp" → shows "Tool executing..." state
  2. Mid-execution, a confirmation dialog appears (using a modal, not `window.confirm`)
  3. User clicks "Confirm" or "Cancel"
  4. Response shows success or cancellation message
- This demonstrates `agent.requestUserInteraction()`

State and flow:

```typescript
type PurchaseState =
  | { status: "idle" }
  | { status: "executing"; stampId: number }
  | { status: "awaiting-confirmation"; stampId: number; stampName: string }
  | { status: "completed"; message: string }
  | { status: "cancelled"; message: string };

const [purchaseState, setPurchaseState] = useState<PurchaseState>({ status: "idle" });

// Simulates the async tool execution with requestUserInteraction
const handleBuyStamp = (stampId: number) => {
  setPurchaseState({ status: "executing", stampId });
  // Short delay to simulate tool processing, then show confirmation
  setTimeout(() => {
    const stamp = stamps.find(s => s.id === stampId);
    setPurchaseState({
      status: "awaiting-confirmation",
      stampId,
      stampName: stamp?.name ?? "Unknown",
    });
  }, 800);
};

const handleConfirmPurchase = () => { /* -> completed */ };
const handleCancelPurchase = () => { /* -> cancelled */ };
```

Modal component (inline, no library):

```tsx
{purchaseState.status === "awaiting-confirmation" && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-md shadow-xl">
      <h3 className="text-lg font-semibold mb-2">Confirm Purchase</h3>
      <p className="text-gray-600 mb-4">
        Buy stamp &quot;{purchaseState.stampName}&quot;?
      </p>
      <div className="flex gap-3 justify-end">
        <button onClick={handleCancelPurchase} className="px-4 py-2 ...">Cancel</button>
        <button onClick={handleConfirmPurchase} className="px-4 py-2 bg-blue-600 ...">Confirm</button>
      </div>
    </div>
  </div>
)}
```

#### 4. Context Switching Demo
**File**: `src/app/webmcp/page.tsx`
**Changes**:
- Add a "Context Mode" toggle at the top (Browse / Edit / Admin)
- Each mode registers different tools:
  - **Browse**: `get-stamps`, `search-stamps`
  - **Edit**: `add-stamp`, `update-stamp`, `delete-stamp`
  - **Admin**: All tools + `export-collection`, `import-collection`
- The tool registry panel updates to show only tools for the current mode
- **Critically**: When context mode changes, call `navigator.modelContext.provideContext()` on the real polyfill so external tools (browser-use) see the updated tool set
- This demonstrates dynamic `provideContext()` calls in SPAs

```typescript
type ContextMode = "browse" | "edit" | "admin";

const CONTEXT_TOOLS: Record<ContextMode, string[]> = {
  browse: ["get-stamps", "search-stamps"],
  edit: ["add-stamp", "update-stamp", "delete-stamp"],
  admin: ["get-stamps", "search-stamps", "add-stamp", "update-stamp",
          "delete-stamp", "export-collection", "import-collection"],
};

const [contextMode, setContextMode] = useState<ContextMode>("edit");

// Derived: filter ALL_TOOLS to only those in current context
const registeredTools = useMemo(
  () => ALL_TOOLS.filter(t => CONTEXT_TOOLS[contextMode].includes(t.name)),
  [contextMode]
);
```

Toggle UI:

```tsx
<div className="flex gap-1 bg-gray-200 rounded-lg p-1">
  {(["browse", "edit", "admin"] as const).map((mode) => (
    <button
      key={mode}
      onClick={() => setContextMode(mode)}
      className={`px-3 py-1 text-sm font-medium rounded capitalize ${
        contextMode === mode
          ? "bg-white text-gray-900 shadow"
          : "text-gray-700 hover:text-gray-900"
      }`}
    >
      {mode}
    </button>
  ))}
</div>
```

### Success Criteria:

#### Automated Verification:
- [x] Build passes: `pnpm build`
- [x] Lint passes: `pnpm lint` (note: `next lint` removed in Next.js 16.1, pre-existing issue)

#### Manual Verification:
- [ ] Tool registry shows registered tools with schemas
- [ ] Unregistering a tool removes it from the registry and console dropdown
- [ ] Tool console generates form fields from schema, executes tool, shows response
- [ ] Call log shows history of tool executions
- [ ] "Buy Stamp" flow shows confirmation dialog mid-execution
- [ ] Confirming purchase shows success response, cancelling shows cancellation
- [ ] Context mode toggle changes available tools in the registry
- [ ] Browse mode shows read-only tools, Edit mode shows mutation tools, Admin shows all

**Implementation Note**: After completing this phase, pause for manual confirmation. Create commit after verification passes.

---

## Testing Strategy

- **Automated**: `pnpm build` and `pnpm lint` after each phase
- **Manual**: Visual verification of each section in the browser
- **Polyfill verification**: Open browser devtools and test `navigator.modelContext` API directly:
  ```javascript
  // Should return the tools array
  typeof navigator.modelContext.provideContext // "function"
  typeof navigator.modelContext.registerTool   // "function"
  typeof navigator.modelContext.unregisterTool // "function"
  ```
- **AI Agent Testing**: After implementation, the page can be tested with `/qa-use:verify "WebMCP stamp collection form and tool call"` to verify AI agents can interact with the components
- **browser-use compatibility**: The page's polyfill follows the same pattern as [browser-use's CI tests](https://github.com/browser-use/browser-use/blob/375f467/tests/ci/test_webmcp.py), so it should be discoverable by browser-use's `WebMCPService.discover_tools()` out of the box

## Manual E2E Verification

After both phases are complete, run the dev server and verify:

```bash
PORT=3001 pnpm dev
```

Then test:
1. `http://localhost:3001` — Verify "WebMCP Demo" appears in route list
2. `http://localhost:3001/webmcp` — Full page loads
3. Add stamp via form → verify table updates
4. Add stamp via tool console → verify table updates with same function
5. Switch context mode → verify tool registry changes
6. Execute "Buy Stamp" → verify confirmation dialog flow
7. Check tool call log → verify all executions are logged
8. Open devtools console → `navigator.modelContext` exists and has `provideContext`, `registerTool`, `unregisterTool`
9. In console, manually call a tool's execute and verify the UI updates

## References

- WebMCP Proposal: https://github.com/webmachinelearning/webmcp/blob/main/docs/proposal.md
- Stamp Database example: proposal.md "Example of WebMCP API usage" section
- browser-use WebMCP tests: https://github.com/browser-use/browser-use/blob/375f467/tests/ci/test_webmcp.py
- Existing page patterns: `src/app/table/page.tsx`, `src/app/buttons/page.tsx`
