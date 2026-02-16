"use client";

import { useState, useEffect } from "react";
import { ChallengeCard } from "./challenge-card";
import type { ChallengeWrapperProps } from "./types";

export function VisibleChallengeWrapper({ challenge, onComplete }: ChallengeWrapperProps) {
  const [clickedItems, setClickedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!challenge.completed && clickedItems.has("behind") && clickedItems.has("partial")) {
      onComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clickedItems, onComplete]);

  const handleClick = (id: string) => {
    const newClicked = new Set(clickedItems);
    if (newClicked.has(id)) {
      newClicked.delete(id);
    } else {
      newClicked.add(id);
    }
    setClickedItems(newClicked);
  };

  return (
    <ChallengeCard
      title={challenge.name}
      completed={challenge.completed}
      checklist={[
        { text: "Click button partially covered by overlay", completed: clickedItems.has("behind") },
        { text: "Click button partially hidden on right", completed: clickedItems.has("partial") },
      ]}
    >
      <div className="space-y-4">
        {/* Overlapping section - button partially behind red div (40% hidden) */}
        <div className="relative h-28 bg-gray-100 rounded overflow-visible border border-gray-300">
          {/* Button that will be 40% covered by overlay */}
          <button
            onClick={() => handleClick("behind")}
            className={`absolute left-4 top-6 px-4 py-2 rounded transition-all z-20 ${
              clickedItems.has("behind")
                ? "bg-green-600 text-white"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            Behind button {clickedItems.has("behind") ? "✓" : ""}
          </button>

          {/* Red overlay covering ~40% of the button */}
          <div className="absolute left-4 top-6 w-20 h-10 bg-red-400 opacity-85 rounded z-30"></div>
        </div>

        {/* Partial visibility section - button cut off by overflow */}
        <div className="relative h-16 bg-gray-100 rounded overflow-hidden border border-gray-300">
          {/* Button that extends beyond container (partially hidden) */}
          <button
            onClick={() => handleClick("partial")}
            className={`absolute right-[-100px] top-2 px-6 py-2 rounded transition-all ${
              clickedItems.has("partial")
                ? "bg-green-600 text-white"
                : "bg-purple-500 text-white hover:bg-purple-600"
            }`}
          >
            Hidden Right {clickedItems.has("partial") ? "✓" : ""}
          </button>
        </div>

        <p className="text-xs text-gray-600 text-center">
          Click both partially visible buttons to complete the challenge
        </p>
      </div>
    </ChallengeCard>
  );
}
