export const CHALLENGES_LIST = [
  // Basic Interactions
  { id: "checkbox", name: "Checkbox Challenge", description: "Toggle a switch and check a checkbox" },
  { id: "buttons", name: "Buttons Challenge", description: "Click 4 button types and handle a loading state" },
  { id: "table", name: "Table Challenge", description: "Filter, select a row, and add a new row" },
  // Dialog & Overlay
  { id: "dialogs", name: "Dialogs Challenge", description: "Trigger all three dialog types" },
  { id: "popovers", name: "Popovers Challenge", description: "Open a popover and click an action button inside" },
  { id: "visible", name: "Visibility Challenge", description: "Click the hidden and partially hidden buttons" },
  // Input & Forms
  { id: "math", name: "Math Challenge", description: "Solve a random math operation" },
  { id: "memory", name: "Memory Challenge", description: "Remember a hidden string and type it back" },
  { id: "otp", name: "OTP Challenge", description: "Enter the correct 6-digit OTP code" },
  { id: "dates", name: "Dates Challenge", description: "Select dates from 2 different picker types" },
  { id: "wizard", name: "Wizard Challenge", description: "Complete a multi-step form with validation" },
  // Navigation & Discovery
  { id: "tabs", name: "Tabs Challenge", description: "Find hidden codes in tabs and nested accordions" },
  { id: "iframe", name: "IFrame Challenge", description: "Interact with an embedded iframe content" },
  { id: "infinite-scroll", name: "Infinite Scroll", description: "Scroll to load more items and find a target value" },
  // Spatial & File
  { id: "reorder-slider", name: "Reorder & Slider", description: "Drag items into correct order and slide to confirm" },
  { id: "graph", name: "Graph Challenge", description: "Add a node and connect it to an existing one" },
  { id: "file-upload", name: "File Challenge", description: "Download a file and re-upload it" },
] as const;

export type ChallengeId = (typeof CHALLENGES_LIST)[number]["id"];

export const CHALLENGE_CATEGORIES = [
  { name: "Basic Interactions", challengeIds: ["checkbox", "buttons", "table"] },
  { name: "Dialog & Overlay", challengeIds: ["dialogs", "popovers", "visible"] },
  { name: "Input & Forms", challengeIds: ["math", "memory", "otp", "dates", "wizard"] },
  { name: "Navigation & Discovery", challengeIds: ["tabs", "iframe", "infinite-scroll"] },
  { name: "Spatial & File", challengeIds: ["reorder-slider", "graph", "file-upload"] },
] as const;
