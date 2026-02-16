"use client";

import { useState, useEffect } from "react";
import { ChallengeCard } from "./challenge-card";
import type { ChallengeWrapperProps } from "./types";

export function DialogsChallengeWrapper({ challenge, onComplete }: ChallengeWrapperProps) {
  const [triggeredDialogs, setTriggeredDialogs] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!challenge.completed && triggeredDialogs.has("alert") && triggeredDialogs.has("confirm") && triggeredDialogs.has("prompt")) {
      onComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggeredDialogs, onComplete]);

  const handleAlert = () => {
    alert("This is an alert dialog!");
    setTriggeredDialogs((prev) => new Set([...prev, "alert"]));
  };

  const handleConfirm = () => {
    const result = confirm("Do you confirm this action?");
    if (result) {
      setTriggeredDialogs((prev) => new Set([...prev, "confirm"]));
    }
  };

  const handlePrompt = () => {
    const result = prompt("Please enter your name:");
    if (result) {
      setTriggeredDialogs((prev) => new Set([...prev, "prompt"]));
    }
  };

  return (
    <ChallengeCard
      title={challenge.name}
      completed={challenge.completed}
      checklist={[
        { text: "Trigger alert dialog", completed: triggeredDialogs.has("alert") },
        { text: "Trigger confirm dialog", completed: triggeredDialogs.has("confirm") },
        { text: "Trigger prompt dialog", completed: triggeredDialogs.has("prompt") },
      ]}
    >
      <div className="space-y-3">
        <button
          onClick={handleAlert}
          className={`w-full px-4 py-2 rounded transition-all ${
            triggeredDialogs.has("alert") ? "bg-green-600 text-white" : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Alert {triggeredDialogs.has("alert") ? "✓" : ""}
        </button>
        <button
          onClick={handleConfirm}
          className={`w-full px-4 py-2 rounded transition-all ${
            triggeredDialogs.has("confirm") ? "bg-green-600 text-white" : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Confirm {triggeredDialogs.has("confirm") ? "✓" : ""}
        </button>
        <button
          onClick={handlePrompt}
          className={`w-full px-4 py-2 rounded transition-all ${
            triggeredDialogs.has("prompt") ? "bg-green-600 text-white" : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Prompt {triggeredDialogs.has("prompt") ? "✓" : ""}
        </button>
      </div>
    </ChallengeCard>
  );
}
