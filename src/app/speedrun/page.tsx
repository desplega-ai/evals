"use client";

import Link from "next/link";

type Difficulty = "easy" | "normal" | "darksoul";

const CHALLENGES_LIST = [
  { id: "checkbox", name: "Checkbox Challenge", description: "Toggle a switch and check a checkbox" },
  { id: "buttons", name: "Buttons Challenge", description: "Click 3 different button types" },
  { id: "table", name: "Table Challenge", description: "Filter, select a row, and add a new row" },
  { id: "visible", name: "Visibility Challenge", description: "Click the hidden and partially hidden buttons" },
  { id: "graph", name: "Graph Challenge", description: "Add a node and connect it to an existing one" },
  { id: "dialogs", name: "Dialogs Challenge", description: "Trigger all three dialog types" },
  { id: "popovers", name: "Popovers Challenge", description: "Open a popover and click an action button inside" },
  { id: "otp", name: "OTP Challenge", description: "Copy the OTP secret or enter a valid code" },
];

export default function SpeedrunPage() {
  const handleStartDifficulty = (selectedDifficulty: Difficulty) => {
    // Navigate to challenge page with mode parameter
    window.location.href = `/speedrun/challenge?mode=${selectedDifficulty}`;
  };

  return (
    <div className="font-sans min-h-screen p-8 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <main className="max-w-2xl w-full">
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Speedrun Challenge</h1>
          <p className="text-gray-600 mb-8 text-lg">
            Complete all challenges as fast as you can to test your AI agent&apos;s performance, accuracy, speed, and reliability.
          </p>

          <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h2 className="text-xl font-semibold mb-4 text-blue-900">Challenges Include:</h2>
            <ul className="text-left space-y-2 text-blue-900">
              {CHALLENGES_LIST.map((ch) => (
                <li key={ch.id} className="flex items-start">
                  <span className="mr-3">•</span>
                  <div>
                    <span className="font-medium">{ch.name}:</span> {ch.description}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Select Difficulty</h2>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => handleStartDifficulty("easy")}
                className="p-4 bg-green-50 border-2 border-green-400 rounded-lg hover:bg-green-100 transition-colors text-left"
              >
                <p className="text-lg font-bold text-green-700">Easy Mode</p>
                <p className="text-sm text-green-600">No time limit - relax and complete at your own pace</p>
              </button>
              <button
                onClick={() => handleStartDifficulty("normal")}
                className="p-4 bg-blue-50 border-2 border-blue-400 rounded-lg hover:bg-blue-100 transition-colors text-left"
              >
                <p className="text-lg font-bold text-blue-700">Normal Mode</p>
                <p className="text-sm text-blue-600">5 minute time limit - balanced challenge</p>
              </button>
              <button
                onClick={() => handleStartDifficulty("darksoul")}
                className="p-4 bg-red-50 border-2 border-red-400 rounded-lg hover:bg-red-100 transition-colors text-left"
              >
                <p className="text-lg font-bold text-red-700">Dark Souls Mode</p>
                <p className="text-sm text-red-600">1 minute time limit - insane difficulty! 💀</p>
              </button>
            </div>
          </div>

          <Link
            href="/"
            className="block px-8 py-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-center"
          >
            ← Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
