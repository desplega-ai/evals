export const CHALLENGES_LIST = [
  { id: "checkbox", name: "Checkbox Challenge", description: "Toggle a switch and check a checkbox" },
  { id: "buttons", name: "Buttons Challenge", description: "Click 3 different button types" },
  { id: "table", name: "Table Challenge", description: "Filter, select a row, and add a new row" },
  { id: "visible", name: "Visibility Challenge", description: "Click the hidden and partially hidden buttons" },
  { id: "graph", name: "Graph Challenge", description: "Add a node and connect it to an existing one" },
  { id: "dialogs", name: "Dialogs Challenge", description: "Trigger all three dialog types" },
  { id: "popovers", name: "Popovers Challenge", description: "Open a popover and click an action button inside" },
  { id: "iframe", name: "IFrame Challenge", description: "Interact with an embedded iframe content" },
  { id: "math", name: "Math Challenge", description: "Solve a random math operation" },
  { id: "memory", name: "Memory Challenge", description: "Remember a hidden string and type it back" },
  { id: "otp", name: "OTP Challenge", description: "Enter the correct 6-digit OTP code" },
  { id: "autocomplete", name: "Autocomplete Challenge", description: "Select users and a city from autocomplete inputs" },
  { id: "dates", name: "Dates Challenge", description: "Select dates from 2 different picker types" },
  { id: "tabs", name: "Tabs Challenge", description: "Find hidden codes in tabs and nested accordions" },
] as const;

export type ChallengeId = (typeof CHALLENGES_LIST)[number]["id"];
