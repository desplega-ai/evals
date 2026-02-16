"use client";

import { useState, useEffect } from "react";
import { ChallengeCard } from "./challenge-card";
import type { ChallengeWrapperProps } from "./types";

export function CheckboxChallengeWrapper({ challenge, onComplete }: ChallengeWrapperProps) {
  const [switchOn, setSwitchOn] = useState(false);
  const [checkboxOn, setCheckboxOn] = useState(false);

  useEffect(() => {
    if (!challenge.completed && switchOn && checkboxOn) {
      onComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [switchOn, checkboxOn, onComplete]);

  return (
    <ChallengeCard
      title={challenge.name}
      completed={challenge.completed}
      checklist={[
        { text: "Toggle the switch", completed: switchOn },
        { text: "Check the checkbox", completed: checkboxOn },
      ]}
    >
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Toggle the switch
          </label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={switchOn}
              onChange={(e) => setSwitchOn(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
          </label>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-3">
            <input
              type="checkbox"
              checked={checkboxOn}
              onChange={(e) => setCheckboxOn(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span>Check this box</span>
          </label>
        </div>
      </div>
    </ChallengeCard>
  );
}
