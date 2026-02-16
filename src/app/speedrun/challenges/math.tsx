"use client";

import { useState, useEffect } from "react";
import { ChallengeCard } from "./challenge-card";
import type { ChallengeWrapperProps } from "./types";

export function MathChallengeWrapper({ challenge, onComplete }: ChallengeWrapperProps) {
  const [problem, setProblem] = useState<{ num1: number; num2: number; operator: string; answer: number } | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Generate a random math problem
  useEffect(() => {
    const generateProblem = () => {
      const num1 = Math.floor(Math.random() * 20) + 1; // 1-20
      const num2 = Math.floor(Math.random() * 20) + 1; // 1-20
      const operators = ["+", "-", "*", "/"];
      const operator = operators[Math.floor(Math.random() * operators.length)];

      let answer = 0;
      switch (operator) {
        case "+":
          answer = num1 + num2;
          break;
        case "-":
          answer = num1 - num2;
          break;
        case "*":
          answer = num1 * num2;
          break;
        case "/":
          answer = Math.round((num1 / num2) * 100) / 100;
          break;
      }

      setProblem({ num1, num2, operator, answer });
    };

    generateProblem();
  }, []);

  // Validate answer when user enters it
  useEffect(() => {
    if (userAnswer.trim() === "") {
      setIsCorrect(null);
      return;
    }

    if (problem) {
      const userNum = parseFloat(userAnswer);
      const isMatch = Math.abs(userNum - problem.answer) < 0.01; // Allow small floating point errors
      setIsCorrect(isMatch);

      if (!challenge.completed && isMatch) {
        onComplete();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAnswer, problem, onComplete]);

  return (
    <ChallengeCard
      title={challenge.name}
      completed={challenge.completed}
      checklist={[{ text: `Solve: ${problem?.num1} ${problem?.operator} ${problem?.num2}`, completed: isCorrect === true }]}
    >
      <div className="space-y-4">
        <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <p className="text-sm text-gray-600 mb-2">Solve this math problem:</p>
          <p className="text-4xl font-bold text-blue-600 font-mono">
            {problem?.num1} {problem?.operator} {problem?.num2} = ?
          </p>
        </div>

        <div>
          <label htmlFor="mathInput" className="block text-sm font-medium text-gray-700 mb-2">
            Your Answer:
          </label>
          <input
            id="mathInput"
            type="text"
            inputMode="decimal"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Enter the answer"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg"
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
      </div>
    </ChallengeCard>
  );
}
