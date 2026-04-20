# `/tooltips` — verification plan

Two sections: hover-triggered tooltips in four positions (top/bottom/left/right, plus an info `?` icon and a documentation link), and click-triggered popovers with various action contents (action button, multi-action list, input, icon + right-aligned popover). Interactions are logged in a colour-coded Activity Log. No `data-testid` attributes; drive by the visible button text ("Hover for Top Tooltip", "Click for Popover", "More Options", "Enter Value", etc.).

## States to verify

- **Tooltip appears on hover** — hover the blue "Hover for Top Tooltip" button; a dark gray tooltip "This is a top tooltip" appears above the button with a small triangle pointer. Move the mouse away; the tooltip disappears. The Activity Log gains a blue `TOOLTIP` entry `Hovered top tooltip button`.
- **Tooltip positions differ** — hover the bottom, left, and right tooltip buttons; confirm each tooltip positions itself on the expected side (below / left-of / right-of the trigger) relative to the button.
- **Popover opens on click with action button** — click "Click for Popover"; a white popover opens below the button containing "Popover Content / This is a popover with some additional information. / [Action]". Click "Action"; the log gains `Clicked action button in popover`.
- **Popover closes on outside click** — with a popover open, click anywhere outside it; the popover closes (the backdrop overlay handles the click).
- **Multi-action popover lists three options** — click "More Options"; the popover shows `✎ Edit / 🗑 Delete / ↗ Share`. Click "✎ Edit"; the log gains `Clicked Edit action`.
- **Popover with input accepts Enter** — click "Enter Value"; the popover shows a "Your name..." input; type `Taras` and press Enter; the log gains `Submitted name: Taras`.
- **Right-positioned popover from icon** — click the blue circular `?` icon; the popover opens to its right, showing "Need Help? / Click this button to view helpful information about this feature. / [Learn More →]".
- **Clear Logs empties the panel** — with entries present, click "Clear Logs"; the log panel returns to the "No interactions yet." empty state.

## Out of scope

- Keyboard-triggered tooltip (the component is mouse-only by design).
- Collision/auto-flip of tooltip position near viewport edges.
