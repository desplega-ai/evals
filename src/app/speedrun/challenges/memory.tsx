"use client";

import { useState, useEffect } from "react";
import { ChallengeCard } from "./challenge-card";
import type { ChallengeWrapperProps } from "./types";

export function MemoryChallengeWrapper({ challenge, onComplete }: ChallengeWrapperProps) {
  const [secretString, setSecretString] = useState<string>("");
  const [isHidden, setIsHidden] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Generate a random string on mount
  useEffect(() => {
    const strings = [
      "SPEEDRUN2024",
      "REACT_FLOW",
      "DESPLEGA_AI",
      "CHALLENGE_OK",
      "MEMORY_TEST",
      "HIDDEN_TEXT",
      "SECRET_CODE",
      "AWESOME_APP",
    ];
    setSecretString(strings[Math.floor(Math.random() * strings.length)]);
  }, []);

  // Validate user input when it changes
  useEffect(() => {
    if (!isHidden && userInput.trim() === "") {
      setIsCorrect(null);
      return;
    }

    if (isHidden && secretString) {
      const isMatch = userInput.trim() === secretString;
      setIsCorrect(isMatch);

      if (!challenge.completed && isMatch) {
        onComplete();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInput, isHidden, secretString, onComplete]);

  const handleHideText = () => {
    setIsHidden(true);
    setUserInput("");
    setIsCorrect(null);
  };

  const handleShowText = () => {
    setIsHidden(false);
    setUserInput("");
    setIsCorrect(null);
  };

  return (
    <ChallengeCard
      title={challenge.name}
      completed={challenge.completed}
      checklist={[
        { text: "Hide the secret string", completed: isHidden },
        { text: "Type the string correctly", completed: isCorrect === true },
      ]}
    >
      <div className="space-y-4">
        {!isHidden ? (
          <>
            <div className="p-6 bg-purple-50 border-2 border-purple-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-3 text-center">Remember this string:</p>
              <p className="text-3xl font-bold text-purple-600 text-center font-mono tracking-widest">
                {secretString}
              </p>
              <p className="text-xs text-gray-600 mt-3 text-center italic">Try to memorize it!</p>
            </div>

            <button
              onClick={handleHideText}
              className="w-full px-4 py-3 bg-red-500 text-white font-bold rounded hover:bg-red-600 transition-all"
            >
              Hide Text & Enter Answer
            </button>
          </>
        ) : (
          <>
            <div className="p-6 bg-gray-100 border-2 border-gray-300 rounded-lg text-center">
              <p className="text-gray-500 italic">Text is hidden</p>
            </div>

            <div>
              <label htmlFor="memoryInput" className="block text-sm font-medium text-gray-700 mb-2">
                Type the string you saw:
              </label>
              <input
                id="memoryInput"
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Enter the hidden string"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 text-center font-mono"
                autoFocus
              />
            </div>

            {isCorrect !== null && (
              <div
                className={`p-3 rounded text-center font-semibold ${
                  isCorrect
                    ? "bg-green-100 text-green-700 border border-green-300"
                    : "bg-red-100 text-red-700 border border-red-300"
                }`}
              >
                {isCorrect ? "✓ Correct!" : "✗ Incorrect"}
              </div>
            )}

            <button
              onClick={handleShowText}
              className="w-full px-4 py-3 bg-purple-500 text-white font-bold rounded hover:bg-purple-600 transition-all"
            >
              Show Text Again
            </button>
          </>
        )}
      </div>
    </ChallengeCard>
  );
}
