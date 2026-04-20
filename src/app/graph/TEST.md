# `/graph` — verification plan

React Flow canvas. Two query-param entry modes: `?empty` (blank canvas) and `?seed=<string>` (deterministic tree graph — default seed is `default`, producing 5–8 nodes). Left sidebar has 5 draggable node-type tiles; canvas supports node selection, edge connection via handles, and a Delete/Unselect header bar that appears only when something is selected. Because React Flow canvas interactions (drag-from-sidebar, connect handles) are hard for automation agents, this plan focuses on deep-link rendering and the selection/delete UX.

## States to verify

- **Default seeded graph renders** — navigate to `${BASE_URL}/graph`; canvas shows 5–8 coloured rectangular nodes (Process / Data / Decision / Output / Input variants) connected by smoothstep edges, laid out left-to-right. Header shows `Seed: default`.
- **Empty mode via query-param** — navigate to `${BASE_URL}/graph?empty`; the canvas area is empty (no nodes/edges), the header shows the green "(Empty mode)" tag, and the sidebar header "Node Types" is still visible with 5 draggable tiles.
- **Custom seed changes the graph** — navigate to `${BASE_URL}/graph?seed=hello`; header shows `Seed: hello` and the rendered node count/layout differs from the `default` seed (visually distinct graph).
- **Node-count override** — navigate to `${BASE_URL}/graph?seed=default&nodes=6`; the canvas renders exactly 6 nodes.
- **Node selection surfaces Delete/Unselect controls** — on the default graph, click any node; the node shows the pulse-glow selected style, and the header row replaces the italic "Select a node or edge…" hint with `Selected Node: <label>` plus red "Delete" and grey "Unselect" buttons.
- **Delete removes the selected node** — with a node selected, click "Delete"; the node and its incident edges disappear, and the header reverts to the unselected state.
- **Unselect clears selection** — select a node, click "Unselect"; the node loses its glow style and the header returns to the unselected "Select a node or edge…" state.

## Out of scope

- Dragging a node-type tile from the sidebar onto the canvas (React Flow + HTML5 drag is brittle for browser-automation agents).
- Connecting two nodes by dragging between handles.
- Persistence of canvas state across reload (intentionally not implemented).
