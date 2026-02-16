"use client";

import React, { useState } from "react";
import type { Challenge } from "./types";

type Difficulty = "easy" | "normal" | "hard" | "darksoul" | null;

/* Final Results Page Component */
export function FinalResultsPage({
  timeLimitExceeded,
  elapsedTime,
  difficulty,
  startTime,
  completedCount,
  challenges,
  challengeTimes,
  onShare,
  onHome,
}: {
  timeLimitExceeded: boolean;
  elapsedTime: number;
  difficulty: Difficulty;
  startTime: number;
  completedCount: number;
  challenges: Challenge[];
  challengeTimes: Record<string, number>;
  onShare: () => void;
  onHome: () => void;
}) {
  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  const allComplete = completedCount === challenges.length;
  const stoppedEarly = !timeLimitExceeded && !allComplete;

  return (
    <div className="bg-white rounded-lg shadow-lg p-12">
      {timeLimitExceeded ? (
        <>
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-red-600 mb-2">⏰ Time&apos;s Up!</h2>
            <p className="text-gray-600 text-lg">You ran out of time in {difficulty === "normal" ? "Normal Mode (5 min)" : difficulty === "hard" ? "Hard Mode (2m30s)" : "Dark Souls Mode (1 min)"}!</p>
          </div>

          <div className="mb-8 p-8 bg-red-50 rounded-lg border-2 border-red-300">
            <p className="text-gray-700 mb-4">Elapsed Time:</p>
            <p className="text-6xl font-mono font-bold text-red-600 mb-4">{formatTime(elapsedTime)}</p>
            <p className="text-gray-700 mb-2">Challenges Completed: {completedCount}/{challenges.length}</p>
            <p className="text-sm text-gray-600">
              Better luck next time! Try a different difficulty mode.
            </p>
          </div>
        </>
      ) : stoppedEarly ? (
        <>
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-orange-600 mb-2">⏹️ Speedrun Stopped</h2>
            <p className="text-gray-600 text-lg">You stopped the speedrun before completing all challenges.</p>
          </div>

          <div className="mb-8 p-8 bg-orange-50 rounded-lg border-2 border-orange-300">
            <p className="text-gray-700 mb-4">Elapsed Time:</p>
            <p className="text-6xl font-mono font-bold text-orange-600 mb-4">{formatTime(elapsedTime)}</p>
            <p className="text-gray-700 mb-2">Challenges Completed: {completedCount}/{challenges.length}</p>
            <p className="text-sm text-gray-600">
              Try again to complete all challenges!
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-green-600 mb-2">🎉 All Challenges Complete!</h2>
            <p className="text-gray-600 text-lg">You&apos;ve successfully completed the speedrun in {difficulty === "easy" ? "Easy Mode" : difficulty === "normal" ? "Normal Mode (5 min)" : difficulty === "hard" ? "Hard Mode (2m30s)" : "Dark Souls Mode (1 min)"}!</p>
          </div>

          <div className="mb-8 p-8 bg-green-50 rounded-lg border-2 border-green-300">
            <p className="text-gray-700 mb-4">Final Time:</p>
            <p className="text-6xl font-mono font-bold text-green-600 mb-4">{formatTime(elapsedTime)}</p>
            <p className="text-sm text-gray-600 mb-4">
              Started: {new Date(startTime).toLocaleTimeString()}
            </p>
            <p className="text-sm text-gray-600">
              Completed: {new Date().toLocaleTimeString()}
            </p>
          </div>
        </>
      )}

      {/* Challenges Breakdown */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-300">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Challenges Completed:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {challenges.map((challenge) => {
            const time = challengeTimes[challenge.id];
            return (
              <div
                key={challenge.id}
                className={`flex items-center p-3 rounded ${
                  challenge.completed
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full mr-3 text-sm font-bold ${
                  challenge.completed
                    ? "bg-green-600 text-white"
                    : "bg-gray-400 text-white"
                }`}>
                  {challenge.completed ? "✓" : "✗"}
                </span>
                <span className="text-sm font-medium flex-1">{challenge.name}</span>
                {challenge.completed && time !== undefined && (
                  <span className="text-xs font-mono text-green-600 ml-2">
                    {formatTime(time)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <button
          onClick={onShare}
          className="px-8 py-4 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors"
        >
          Share Results 📤
        </button>
        <button
          onClick={() => window.location.href = "/speedrun"}
          className="px-8 py-4 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors text-center"
        >
          Restart 🔄
        </button>
        <button
          onClick={onHome}
          className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors text-center"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}

/* Results Share Page Component */
export function ResultsSharePage({
  elapsedTime,
  startTime,
  challenges,
  challengeTimes,
  resultName,
  setResultName,
  onBack,
}: {
  elapsedTime: number;
  startTime: number;
  challenges: Challenge[];
  challengeTimes: Record<string, number>;
  resultName: string;
  setResultName: (name: string) => void;
  onBack: () => void;
}) {
  const totalSeconds = Math.floor(elapsedTime / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const ms = Math.floor((elapsedTime % 1000) / 10);
  const timeString = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;

  const resultsData = {
    name: resultName || "Anonymous",
    time: elapsedTime,
    timeFormatted: timeString,
    startTime: new Date(startTime).toISOString(),
    endTime: new Date().toISOString(),
    completedChallenges: challenges.filter((c) => c.completed).length,
    totalChallenges: challenges.length,
    completedIds: challenges.filter((c) => c.completed).map((c) => c.id),
    challengeTimes,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Unknown",
    platform: typeof navigator !== "undefined" ? navigator.platform : "Unknown",
  };

  const encoded = Buffer.from(JSON.stringify(resultsData)).toString("base64");
  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/speedrun/results?data=${encoded}`;
  const twitterText = encodeURIComponent(
    `I completed the AI Speedrun Challenge in ${timeString}! 🚀\n\nCompleted ${resultsData.completedChallenges}/${resultsData.totalChallenges} challenges.\n\nCan you beat my time? 👊`
  );
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${twitterText}&url=${encodeURIComponent(shareUrl)}`;

  const [copyFeedback, setCopyFeedback] = useState(false);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Share Your Results</h2>
        <p className="text-gray-600">Show off your speedrun performance!</p>
      </div>

      <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Name (Optional)
          </label>
          <input
            type="text"
            value={resultName}
            onChange={(e) => setResultName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-gray-600 text-sm">Final Time</p>
            <p className="text-2xl font-mono font-bold text-purple-600">{timeString}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Challenges</p>
            <p className="text-2xl font-bold text-purple-600">
              {resultsData.completedChallenges}/{resultsData.totalChallenges}
            </p>
          </div>
        </div>

        <div className="p-3 bg-white border border-gray-300 rounded-lg">
          <p className="text-xs text-gray-600 mb-2">Share Link (Click to copy):</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded text-xs font-mono"
            />
            <button
              onClick={handleCopyUrl}
              className={`px-4 py-2 rounded transition-colors font-medium text-sm ${
                copyFeedback
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {copyFeedback ? "✓ Copied!" : "Copy"}
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <a
          href={twitterShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 px-6 py-3 bg-blue-400 text-white font-bold rounded-lg hover:bg-blue-500 transition-colors text-center"
        >
          Share on Twitter 𝕏
        </a>
        <button
          onClick={onBack}
          className="flex-1 px-6 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition-colors"
        >
          Back
        </button>
      </div>

      <div className="p-4 bg-gray-100 rounded-lg">
        <p className="text-xs text-gray-700">
          <strong>Browser Info:</strong> {resultsData.userAgent}
        </p>
        <p className="text-xs text-gray-700 mt-1">
          <strong>Platform:</strong> {resultsData.platform}
        </p>
      </div>
    </div>
  );
}
