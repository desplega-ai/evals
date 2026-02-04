"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  type OnConnect,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { authenticator } from "otplib";

interface Challenge {
  id: string;
  name: string;
  description: string;
  completed: boolean;
}

/* Final Results Page Component */
function FinalResultsPage({
  timeLimitExceeded,
  elapsedTime,
  difficulty,
  startTime,
  completedCount,
  challenges,
  onShare,
  onHome,
}: {
  timeLimitExceeded: boolean;
  elapsedTime: number;
  difficulty: Difficulty;
  startTime: number;
  completedCount: number;
  challenges: Challenge[];
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

  return (
    <div className="bg-white rounded-lg shadow-lg p-12">
      {timeLimitExceeded ? (
        <>
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-red-600 mb-2">⏰ Time&apos;s Up!</h2>
            <p className="text-gray-600 text-lg">You ran out of time in {difficulty === "normal" ? "Normal Mode (5 min)" : "Dark Souls Mode (1 min)"}!</p>
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
      ) : (
        <>
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-green-600 mb-2">🎉 All Challenges Complete!</h2>
            <p className="text-gray-600 text-lg">You&apos;ve successfully completed the speedrun in {difficulty === "easy" ? "Easy Mode" : difficulty === "normal" ? "Normal Mode (5 min)" : "Dark Souls Mode (1 min)"}!</p>
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
          {challenges.map((challenge) => (
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
              <span className="text-sm font-medium">{challenge.name}</span>
            </div>
          ))}
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
function ResultsSharePage({
  elapsedTime,
  startTime,
  challenges,
  resultName,
  setResultName,
  onBack,
}: {
  elapsedTime: number;
  startTime: number;
  challenges: Challenge[];
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
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Unknown",
    platform: typeof navigator !== "undefined" ? navigator.platform : "Unknown",
  };

  const encoded = Buffer.from(JSON.stringify(resultsData)).toString("base64");
  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/speedrun/results?data=${encoded}`;
  const twitterText = encodeURIComponent(
    `I completed the AI Speedrun Challenge in ${timeString}! 🚀\n\nCompleted ${resultsData.completedChallenges}/${resultsData.totalChallenges} challenges.\n\nCan you beat my time? 👊`
  );
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${twitterText}&url=${encodeURIComponent(shareUrl)}`;

  const [copyFeedback, setCopyFeedback] = React.useState(false);

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

type Difficulty = "easy" | "normal" | "darksoul" | null;

const DIFFICULTY_LIMITS: Record<Exclude<Difficulty, null>, number> = {
  easy: Infinity, // No limit
  normal: 5 * 60 * 1000, // 5 minutes
  darksoul: 1 * 60 * 1000, // 1 minute
};

function SpeedrunPageContent() {
  const searchParams = useSearchParams();
  const modeParam = searchParams?.get("mode");

  // Check if mode is valid and set it from query params
  const validDifficulty = modeParam && ["easy", "normal", "darksoul"].includes(modeParam)
    ? (modeParam as Difficulty)
    : null;

  const [started, setStarted] = useState(!!validDifficulty);
  const [difficulty, setDifficulty] = useState<Difficulty>(validDifficulty);
  const [elapsedTime, setElapsedTime] = useState(0); // in milliseconds
  const [finished, setFinished] = useState(false);
  const [timeLimitExceeded, setTimeLimitExceeded] = useState(false);
  const [resultName, setResultName] = useState("");
  const [showShareCode, setShowShareCode] = useState(false);
  const [challenges, setChallenges] = useState<Challenge[]>([
    { id: "checkbox", name: "Checkbox Challenge", description: "Toggle a switch and check a checkbox", completed: false },
    { id: "buttons", name: "Buttons Challenge", description: "Click 3 different button types", completed: false },
    { id: "table", name: "Table Challenge", description: "Filter, select a row, and add a new row", completed: false },
    { id: "visible", name: "Visibility Challenge", description: "Click the hidden and partially hidden buttons", completed: false },
    { id: "graph", name: "Graph Challenge", description: "Add a node and connect it to an existing one", completed: false },
    { id: "dialogs", name: "Dialogs Challenge", description: "Trigger all three dialog types", completed: false },
    { id: "popovers", name: "Popovers Challenge", description: "Open a popover and click an action button inside", completed: false },
    { id: "iframe", name: "IFrame Challenge", description: "Interact with an embedded iframe content", completed: false },
    { id: "math", name: "Math Challenge", description: "Solve a random math operation", completed: false },
    { id: "memory", name: "Memory Challenge", description: "Remember a hidden string and type it back", completed: false },
    { id: "otp", name: "OTP Challenge", description: "Enter the correct 6-digit OTP code", completed: false },
  ]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Timer effect - elapsedTime is intentionally not included in dependencies to prevent interval recreation
  useEffect(() => {
    if (started && !finished && !timeLimitExceeded) {
      if (startTimeRef.current === null) {
        startTimeRef.current = Date.now() - elapsedTime;
      }

      timerRef.current = setInterval(() => {
        const newElapsedTime = Date.now() - (startTimeRef.current || Date.now());
        setElapsedTime(newElapsedTime);

        // Check time limit
        if (difficulty && newElapsedTime > DIFFICULTY_LIMITS[difficulty]) {
          setTimeLimitExceeded(true);
          setFinished(true);
        }
      }, 10); // Update every 10ms for millisecond precision
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, finished, timeLimitExceeded, difficulty]);

  const markChallengeComplete = useCallback((challengeId: string) => {
    setChallenges((prev) =>
      prev.map((ch) =>
        ch.id === challengeId ? { ...ch, completed: true } : ch
      )
    );
  }, []);

  const allChallengesComplete = challenges.every((ch) => ch.completed);

  useEffect(() => {
    if (allChallengesComplete && started && !finished) {
      setFinished(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [allChallengesComplete, started, finished]);

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10); // 2 digit milliseconds (0-99)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  const completedCount = challenges.filter((ch) => ch.completed).length;
  const progressPercent = (completedCount / challenges.length) * 100;

  const timeLimit = difficulty ? DIFFICULTY_LIMITS[difficulty] : Infinity;
  const timeRemaining = Math.max(0, timeLimit - elapsedTime);
  const isTimeWarning = timeRemaining < 30 * 1000 && timeRemaining > 0; // Less than 30 seconds
  const isTimeCritical = timeRemaining < 10 * 1000 && timeRemaining > 0; // Less than 10 seconds

  const handleStop = () => {
    setFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleStartDifficulty = (selectedDifficulty: Difficulty) => {
    // Navigate to challenge page with mode parameter
    window.location.href = `/speedrun/challenge?mode=${selectedDifficulty}`;
  };

  // Only show difficulty selection if no mode is provided
  if (!validDifficulty) {
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
                {challenges.map((ch) => (
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

  return (
    <div className="font-sans min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Full-width Sticky Header */}
      <div className={`sticky top-0 z-50 bg-gradient-to-b from-white via-white to-gray-50 shadow-sm border-b-2 transition-colors ${
        isTimeCritical ? "border-red-500" : isTimeWarning ? "border-yellow-500" : "border-gray-200"
      }`}>
        <div className="max-w-6xl mx-auto px-8 py-4">
          <div className="flex justify-between items-center gap-4 mb-4 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold whitespace-nowrap">Speedrun - {difficulty === "easy" ? "Easy" : difficulty === "normal" ? "Normal (5m)" : "Dark Souls (1m)"}</h1>
              <Link
                href="/"
                className="px-3 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium whitespace-nowrap"
              >
                🏠 Home
              </Link>
            </div>
            <div className="flex gap-6 items-center">
              <div className="text-right">
                <div className={`text-5xl font-mono font-bold transition-colors ${
                  isTimeCritical ? "text-red-600" : isTimeWarning ? "text-yellow-600" : "text-blue-600"
                }`}>
                  {formatTime(elapsedTime)}
                </div>
                <p className="text-gray-600 text-sm">Elapsed Time</p>
              </div>

              {timeLimit !== Infinity && (
                <div className="text-right border-l-2 border-gray-300 pl-6">
                  <div className={`text-5xl font-mono font-bold transition-colors ${
                    isTimeCritical ? "text-red-600" : isTimeWarning ? "text-yellow-600" : "text-green-600"
                  }`}>
                    {(() => {
                      const totalSeconds = Math.max(0, Math.floor(timeRemaining / 1000));
                      const mins = Math.floor(totalSeconds / 60);
                      const secs = totalSeconds % 60;
                      return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
                    })()}
                  </div>
                  <p className="text-gray-600 text-sm">Time Remaining</p>
                  {isTimeCritical && (
                    <p className="text-xs font-bold text-red-600 animate-pulse mt-1">⚠️ CRITICAL</p>
                  )}
                  {isTimeWarning && !isTimeCritical && (
                    <p className="text-xs font-bold text-yellow-600 mt-1">⚠️ Warning</p>
                  )}
                </div>
              )}

              <button
                onClick={handleStop}
                className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold text-sm"
              >
                Stop
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    isTimeCritical ? "bg-gradient-to-r from-red-500 to-red-600" :
                    isTimeWarning ? "bg-gradient-to-r from-yellow-500 to-yellow-600" :
                    "bg-gradient-to-r from-blue-500 to-indigo-600"
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            <span className="text-sm font-bold text-blue-600 whitespace-nowrap">
              {completedCount}/{challenges.length}
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto p-8">

        {!finished ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Checkbox Challenge */}
            <CheckboxChallengeWrapper
              challenge={challenges[0]}
              onComplete={() => markChallengeComplete("checkbox")}
            />

            {/* Buttons Challenge */}
            <ButtonsChallengeWrapper
              challenge={challenges[1]}
              onComplete={() => markChallengeComplete("buttons")}
            />

            {/* Table Challenge */}
            <TableChallengeWrapper
              challenge={challenges[2]}
              onComplete={() => markChallengeComplete("table")}
            />

            {/* Visible Challenge */}
            <VisibleChallengeWrapper
              challenge={challenges[3]}
              onComplete={() => markChallengeComplete("visible")}
            />

            {/* Graph Challenge */}
            <GraphChallengeWrapper
              challenge={challenges[4]}
              onComplete={() => markChallengeComplete("graph")}
            />

            {/* Dialogs Challenge */}
            <DialogsChallengeWrapper
              challenge={challenges[5]}
              onComplete={() => markChallengeComplete("dialogs")}
            />

            {/* Popovers Challenge */}
            <PopoversChallengeWrapper
              challenge={challenges[6]}
              onComplete={() => markChallengeComplete("popovers")}
            />

            {/* IFrame Challenge */}
            <IFrameChallengeWrapper
              challenge={challenges[7]}
              onComplete={() => markChallengeComplete("iframe")}
            />

            {/* Math Challenge */}
            <MathChallengeWrapper
              challenge={challenges[8]}
              onComplete={() => markChallengeComplete("math")}
            />

            {/* Memory Challenge */}
            <MemoryChallengeWrapper
              challenge={challenges[9]}
              onComplete={() => markChallengeComplete("memory")}
            />

            {/* OTP Challenge */}
            <OTPChallengeWrapper
              challenge={challenges[10]}
              onComplete={() => markChallengeComplete("otp")}
            />
          </div>
        ) : !showShareCode ? (
          <FinalResultsPage
            timeLimitExceeded={timeLimitExceeded}
            elapsedTime={elapsedTime}
            difficulty={difficulty}
            startTime={startTimeRef.current || Date.now()}
            completedCount={completedCount}
            challenges={challenges}
            onShare={() => setShowShareCode(true)}
            onHome={() => {
              window.location.href = "/";
            }}
          />
        ) : (
          <ResultsSharePage
            elapsedTime={elapsedTime}
            startTime={startTimeRef.current || Date.now()}
            challenges={challenges}
            resultName={resultName}
            setResultName={setResultName}
            onBack={() => setShowShareCode(false)}
          />
        )}
      </main>
    </div>
  );
}

export default function SpeedrunPage() {
  return (
    <Suspense fallback={<div className="font-sans min-h-screen p-8 flex items-center justify-center"><main className="max-w-2xl mx-auto"><p className="text-gray-600">Loading...</p></main></div>}>
      <SpeedrunPageContent />
    </Suspense>
  );
}

interface ChallengeCardProps {
  title: string;
  completed: boolean;
  children: React.ReactNode;
  checklist?: { text: string; completed: boolean }[];
  onComplete?: () => void;
  className?: string;
}

function ChallengeCard({ title, completed, children, checklist = [], className = "" }: ChallengeCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow p-6 ${completed ? "ring-2 ring-green-500" : ""} ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {completed ? (
          <span className="inline-block px-3 py-1 bg-green-100 text-green-700 font-bold rounded-full text-sm">
            ✓ Complete
          </span>
        ) : (
          <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-700 font-bold rounded-full text-sm">
            In Progress
          </span>
        )}
      </div>
      <div className={completed ? "opacity-75 pointer-events-none" : ""}>{children}</div>

      {/* Checklist */}
      {checklist.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-600 mb-2">Tasks:</p>
          <ul className="space-y-1">
            {checklist.map((item, idx) => (
              <li key={idx} className="flex items-center text-xs text-gray-700">
                <span className={`inline-flex items-center justify-center w-4 h-4 rounded border mr-2 ${
                  item.completed
                    ? "bg-green-500 border-green-500 text-white"
                    : "border-gray-300"
                }`}>
                  {item.completed && "✓"}
                </span>
                <span className={item.completed ? "line-through text-gray-500" : ""}>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ================ CHALLENGE COMPONENTS ================ */

/* Checkbox Challenge Wrapper */
function CheckboxChallengeWrapper({
  challenge,
  onComplete,
}: {
  challenge: Challenge;
  onComplete: () => void;
}) {
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
/* Buttons Challenge Wrapper */
function ButtonsChallengeWrapper({
  challenge,
  onComplete,
}: {
  challenge: Challenge;
  onComplete: () => void;
}) {
  const [clicked, setClicked] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!challenge.completed && clicked.size >= 3) {
      onComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clicked, onComplete]);

  const handleClick = (id: string) => {
    setClicked((prev) => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
  };

  return (
    <ChallengeCard
      title={challenge.name}
      completed={challenge.completed}
      checklist={[
        { text: "Click Button 1", completed: clicked.has("btn-1") },
        { text: "Click Button 2", completed: clicked.has("btn-2") },
        { text: "Click Button 3", completed: clicked.has("btn-3") },
      ]}
    >
      <div className="space-y-3">
        <button
          onClick={() => handleClick("btn-1")}
          className={`w-full px-4 py-2 rounded transition-all ${
            clicked.has("btn-1")
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Button 1 {clicked.has("btn-1") ? "✓" : ""}
        </button>
        <button
          onClick={() => handleClick("btn-2")}
          className={`w-full px-4 py-2 rounded border-2 transition-all ${
            clicked.has("btn-2")
              ? "border-green-600 text-green-600 bg-green-50"
              : "border-blue-600 text-blue-600 hover:bg-blue-50"
          }`}
        >
          Button 2 {clicked.has("btn-2") ? "✓" : ""}
        </button>
        <button
          onClick={() => handleClick("btn-3")}
          className={`w-full px-4 py-2 rounded transition-all font-medium ${
            clicked.has("btn-3")
              ? "text-green-600 hover:bg-green-50"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          Button 3 {clicked.has("btn-3") ? "✓" : ""}
        </button>
      </div>
    </ChallengeCard>
  );
}

/* IFrame Challenge Wrapper */
function IFrameChallengeWrapper({
  challenge,
  onComplete,
}: {
  challenge: Challenge;
  onComplete: () => void;
}) {
  const [iframeClicked, setIframeClicked] = useState(false);
  const [outsideClicked, setOutsideClicked] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!challenge.completed && iframeClicked && outsideClicked) {
      onComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iframeClicked, outsideClicked, onComplete]);

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.action === "button-clicked") {
        setIframeClicked(true);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const iframeContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; margin: 0; }
        .content { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h2 { margin-top: 0; color: #333; }
        p { color: #666; }
        button { padding: 8px 16px; margin: 10px 5px 10px 0; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; background: #3b82f6; color: white; }
        button:hover { background: #2563eb; }
      </style>
    </head>
    <body>
      <div class="content">
        <h2>IFrame Content</h2>
        <p>Click the button inside this iframe:</p>
        <button onclick="window.parent.postMessage({action: 'button-clicked'}, '*'); this.textContent = '✓ Clicked'; this.style.background = '#16a34a';">Click Me Inside</button>
      </div>
    </body>
    </html>
  `;

  return (
    <ChallengeCard
      title={challenge.name}
      completed={challenge.completed}
      checklist={[
        { text: "Click the button inside the iframe", completed: iframeClicked },
        { text: "Click the button outside the iframe", completed: outsideClicked },
      ]}
    >
      <div className="space-y-4">
        <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm bg-gray-50">
          <iframe
            ref={iframeRef}
            srcDoc={iframeContent}
            title="Interactive IFrame"
            style={{ width: "100%", height: "200px", border: "none" }}
          />
        </div>

        <button
          onClick={() => setOutsideClicked(true)}
          className={`w-full px-4 py-2 rounded transition-all font-medium ${
            outsideClicked
              ? "bg-green-600 text-white"
              : "bg-purple-500 text-white hover:bg-purple-600"
          }`}
        >
          {outsideClicked ? "✓ Clicked" : "Click Me (Outside)"}
        </button>

        <p className="text-xs text-gray-600 text-center">
          {!iframeClicked && "First, click the button inside the iframe above"}
          {iframeClicked && !outsideClicked && "Now click the button outside"}
          {iframeClicked && outsideClicked && "✓ Challenge complete!"}
        </p>
      </div>
    </ChallengeCard>
  );
}

/* Math Challenge Wrapper */
function MathChallengeWrapper({
  challenge,
  onComplete,
}: {
  challenge: Challenge;
  onComplete: () => void;
}) {
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

/* Memory Challenge Wrapper */
function MemoryChallengeWrapper({
  challenge,
  onComplete,
}: {
  challenge: Challenge;
  onComplete: () => void;
}) {
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
          </>
        )}
      </div>
    </ChallengeCard>
  );
}

/* OTP Challenge Wrapper */
function OTPChallengeWrapper({
  challenge,
  onComplete,
}: {
  challenge: Challenge;
  onComplete: () => void;
}) {
  const [otpInput, setOtpInput] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [secret, setSecret] = useState("");
  const [currentCode, setCurrentCode] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [isLoading, setIsLoading] = useState(true);

  // Generate deterministic secret for speedrun
  const generateSpeedrunSecret = () => {
    let hash = 0;
    const seed = "speedrun-challenge";
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }

    const base32Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let result = "";
    let num = Math.abs(hash);

    for (let i = 0; i < 32; i++) {
      result += base32Chars[num % 32];
      num = Math.floor(num / 32);
    }

    return result;
  };

  // Initialize secret on mount
  useEffect(() => {
    const generatedSecret = generateSpeedrunSecret();
    setSecret(generatedSecret);

    try {
      const code = authenticator.generate(generatedSecret);
      setCurrentCode(code);
    } catch (error) {
      console.error("Failed to generate OTP:", error);
    }

    setIsLoading(false);
  }, []);

  // Update code every second
  useEffect(() => {
    if (!secret) return;

    const interval = setInterval(() => {
      try {
        const code = authenticator.generate(secret);
        setCurrentCode(code);

        const now = Math.floor(Date.now() / 1000);
        const timeInWindow = now % 30;
        const remaining = 30 - timeInWindow;
        setTimeRemaining(remaining);
      } catch (error) {
        console.error("Failed to update OTP code:", error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [secret]);

  // Validate OTP input
  useEffect(() => {
    // Don't re-validate if challenge is already completed
    if (challenge.completed) {
      return;
    }

    if (otpInput.length === 6 && secret) {
      try {
        const isValidCode = authenticator.check(otpInput, secret);
        setIsValid(isValidCode);
      } catch (error) {
        console.error("Failed to validate OTP:", error);
        setIsValid(false);
      }
    } else {
      setIsValid(false);
    }
  }, [otpInput, secret]);

  useEffect(() => {
    if (!challenge.completed && isValid) {
      onComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isValid, onComplete]);

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtpInput(value);
  };

  if (isLoading) {
    return (
      <ChallengeCard
        title={challenge.name}
        completed={challenge.completed}
        className="md:col-span-2"
      >
        <p className="text-gray-600">Generating OTP secret...</p>
      </ChallengeCard>
    );
  }

  return (
    <ChallengeCard
      title={challenge.name}
      completed={challenge.completed}
      checklist={[
        { text: "Enter the correct 6-digit OTP code", completed: isValid },
      ]}
      className="md:col-span-2"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">Secret Key</label>
          <input
            type="text"
            value={secret}
            readOnly
            className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded text-xs font-mono text-gray-700"
          />
        </div>

        {/* Token validity - only hide when completed, not while in progress */}
        {!challenge.completed && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Token Validity</label>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    timeRemaining <= 5 ? "bg-red-500" : timeRemaining <= 10 ? "bg-yellow-500" : "bg-green-500"
                  }`}
                  style={{ width: `${(timeRemaining / 30) * 100}%` }}
                />
              </div>
              <span className={`text-sm font-mono font-bold min-w-[2rem] ${
                timeRemaining <= 5 ? "text-red-600" : timeRemaining <= 10 ? "text-yellow-600" : "text-green-600"
              }`}>
                {timeRemaining}s
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Code refreshes every 30 seconds</p>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">Enter 6-digit OTP code</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otpInput}
            onChange={handleOtpChange}
            placeholder="000000"
            className={`w-full px-3 py-2 border rounded text-center text-3xl letter-spacing tracking-widest transition-all font-mono ${
              isValid
                ? "border-green-500 ring-2 ring-green-200 bg-green-50 font-bold"
                : otpInput.length === 6 && !isValid
                ? "border-red-500 ring-2 ring-red-200 bg-red-50"
                : "border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            }`}
          />
          {isValid && <p className="mt-2 text-sm text-green-600 font-medium">✓ Code correct! Challenge complete!</p>}
          {otpInput.length === 6 && !isValid && <p className="mt-2 text-sm text-red-600 font-medium">✗ Incorrect code, try again</p>}
          {otpInput.length < 6 && otpInput.length > 0 && <p className="mt-2 text-sm text-gray-500">Enter {6 - otpInput.length} more digit{6 - otpInput.length !== 1 ? 's' : ''}</p>}
        </div>
      </div>
    </ChallengeCard>
  );
}

/* Table Challenge Wrapper */
function TableChallengeWrapper({
  challenge,
  onComplete,
}: {
  challenge: Challenge;
  onComplete: () => void;
}) {
  const [filterText, setFilterText] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [data, setData] = useState([
    { id: 1, name: "John Doe", email: "john@example.com", age: 28, department: "Engineering" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", age: 34, department: "Design" },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", age: 45, department: "Sales" },
    { id: 4, name: "Alice Williams", email: "alice@example.com", age: 29, department: "Engineering" },
    { id: 5, name: "Charlie Brown", email: "charlie@example.com", age: 38, department: "Marketing" },
  ]);

  const filteredData = data.filter((row) =>
    `${row.name} ${row.email} ${row.department}`.toLowerCase().includes(filterText.toLowerCase())
  );

  const hasFiltered = filterText.length > 0;
  const hasSelected = selectedRows.size > 0;
  const hasAddedRow = data.length > 5;

  useEffect(() => {
    if (!challenge.completed && hasFiltered && hasSelected && hasAddedRow) {
      onComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasFiltered, hasSelected, hasAddedRow, onComplete]);

  const toggleRowSelection = (id: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const addRow = () => {
    setData([...data, {
      id: data.length + 1,
      name: "New Employee",
      email: "new@example.com",
      age: 25,
      department: "Engineering"
    }]);
  };

  return (
    <ChallengeCard
      title={challenge.name}
      completed={challenge.completed}
      checklist={[
        { text: "Filter the table", completed: hasFiltered },
        { text: "Select a row", completed: hasSelected },
        { text: "Add a new row", completed: hasAddedRow },
      ]}
    >
      <div className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Filter by name, email, or department..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="border p-2 text-left">
                  <input type="checkbox" className="w-4 h-4" readOnly />
                </th>
                <th className="border p-2 text-left">Name</th>
                <th className="border p-2 text-left">Email</th>
                <th className="border p-2 text-left">Age</th>
                <th className="border p-2 text-left">Department</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row) => (
                <tr key={row.id} className="border-b hover:bg-gray-50">
                  <td className="border p-2">
                    <input
                      type="checkbox"
                      className="w-4 h-4"
                      checked={selectedRows.has(row.id)}
                      onChange={() => toggleRowSelection(row.id)}
                    />
                  </td>
                  <td className="border p-2">{row.name}</td>
                  <td className="border p-2">{row.email}</td>
                  <td className="border p-2">{row.age}</td>
                  <td className="border p-2">{row.department}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={addRow}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-all"
        >
          + Add New Row
        </button>
      </div>
    </ChallengeCard>
  );
}

/* Visible Challenge Wrapper */
function VisibleChallengeWrapper({
  challenge,
  onComplete,
}: {
  challenge: Challenge;
  onComplete: () => void;
}) {
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

/* Graph Challenge Wrapper */
function GraphChallengeWrapper({
  challenge,
  onComplete,
}: {
  challenge: Challenge;
  onComplete: () => void;
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState([
    {
      id: "1",
      data: { label: "Start" },
      position: { x: 100, y: 100 },
      sourcePosition: Position.Right as const,
      targetPosition: Position.Left as const,
    },
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [draggedNodeType, setDraggedNodeType] = useState<string | null>(null);

  const onConnect: OnConnect = (connection) => {
    setEdges((eds) => addEdge(connection, eds));
  };

  const hasAddedNode = nodes.length > 1;
  const hasConnections = edges.length > 0;

  useEffect(() => {
    if (!challenge.completed && hasAddedNode && hasConnections) {
      onComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAddedNode, hasConnections, onComplete]);

  // Auto-layout nodes - spreads them horizontally
  const autoLayoutNodes = (nodesToLayout: typeof nodes) => {
    if (nodesToLayout.length <= 1) return nodesToLayout;

    const spacing = 300;
    return nodesToLayout.map((node, index) => ({
      ...node,
      position: {
        x: index * spacing,
        y: 100,
      },
      sourcePosition: Position.Right as const,
      targetPosition: Position.Left as const,
    }));
  };

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    setDraggedNodeType(nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!draggedNodeType || hasAddedNode) return;

    const newNode = {
      id: "2",
      data: { label: "Node 2" },
      position: { x: 400, y: 100 },
      sourcePosition: Position.Right as const,
      targetPosition: Position.Left as const,
    };

    // Add new node and auto-layout all nodes
    const updatedNodes = [...nodes, newNode];
    const layoutedNodes = autoLayoutNodes(updatedNodes);
    setNodes(layoutedNodes);
    setDraggedNodeType(null);
  };

  return (
    <ChallengeCard
      title={challenge.name}
      completed={challenge.completed}
      checklist={[
        { text: "One 'Start' node already added", completed: true },
        { text: "Drag a second node into the canvas", completed: hasAddedNode },
        { text: "Connect the two nodes", completed: hasConnections },
      ]}
      className="md:col-span-2"
    >
      <div className="space-y-4">
        <p className="text-xs text-gray-600 mb-2">There&apos;s already a &quot;Start&quot; node on the canvas. Drag a new node to add a second one:</p>
        <div className="flex gap-2 items-center">
          <span className="text-xs font-medium text-gray-700">Drag to add node:</span>
          <div
            draggable
            onDragStart={(e) => onDragStart(e, "new")}
            className={`px-3 py-1 rounded text-sm cursor-move transition-all ${
              hasAddedNode
                ? "bg-green-200 text-green-700 opacity-50 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            📦 New Node
          </div>
        </div>

        <div
          style={{ height: "400px", border: "2px dashed #e5e7eb", borderRadius: "8px", overflow: "hidden" }}
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
          >
            <p className="text-xs text-gray-500 p-2">Drag node here • Connect by dragging from handles</p>
          </ReactFlow>
        </div>

        <p className="text-xs text-gray-600 text-center">
          {nodes.length === 1 && "👉 Drag the &apos;📦 New Node&apos; box above into the canvas"}
          {nodes.length > 1 && edges.length === 0 && "Now drag from one node&apos;s handle to another to connect them"}
          {edges.length > 0 && "✓ Challenge complete!"}
        </p>
      </div>
    </ChallengeCard>
  );
}

/* Dialogs Challenge Wrapper */
function DialogsChallengeWrapper({
  challenge,
  onComplete,
}: {
  challenge: Challenge;
  onComplete: () => void;
}) {
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

/* Popovers Challenge Wrapper */
function PopoversChallengeWrapper({
  challenge,
  onComplete,
}: {
  challenge: Challenge;
  onComplete: () => void;
}) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [hasOpenedPopover, setHasOpenedPopover] = useState(false);
  const [actionClicked, setActionClicked] = useState(false);

  const handleOpenPopover = () => {
    setPopoverOpen(!popoverOpen);
    if (!popoverOpen) {
      setHasOpenedPopover(true);
    }
  };

  useEffect(() => {
    if (!challenge.completed && hasOpenedPopover && actionClicked) {
      onComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasOpenedPopover, actionClicked, onComplete]);

  return (
    <ChallengeCard
      title={challenge.name}
      completed={challenge.completed}
      checklist={[
        { text: "Open the popover", completed: hasOpenedPopover },
        { text: "Click the action button", completed: actionClicked },
      ]}
    >
      <div className="relative">
        <button
          onClick={handleOpenPopover}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-all"
        >
          Open Popover {hasOpenedPopover ? "✓" : ""}
        </button>

        {popoverOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setPopoverOpen(false)}
            />
            <div className="absolute top-full left-0 mt-2 p-4 bg-white border border-gray-300 rounded shadow-lg z-20 min-w-max">
              <p className="font-semibold text-gray-900 mb-2">Actions</p>
              <p className="text-sm text-gray-600 mb-3">Click the button below to complete the challenge.</p>
              <button
                onClick={() => {
                  setActionClicked(true);
                  setPopoverOpen(false);
                }}
                className={`w-full px-3 py-2 rounded transition-all text-sm font-medium ${
                  actionClicked
                    ? "bg-green-600 text-white"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                Click Me {actionClicked ? "✓" : ""}
              </button>
            </div>
          </>
        )}
      </div>
    </ChallengeCard>
  );
}

