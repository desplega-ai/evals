"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { CHALLENGES_LIST, CHALLENGE_CATEGORIES } from "../challenges";
import {
  CheckboxChallengeWrapper,
  ButtonsChallengeWrapper,
  TableChallengeWrapper,
  VisibleChallengeWrapper,
  GraphChallengeWrapper,
  ReorderSliderChallengeWrapper,
  DialogsChallengeWrapper,
  PopoversChallengeWrapper,
  IFrameChallengeWrapper,
  MathChallengeWrapper,
  MemoryChallengeWrapper,
  OTPChallengeWrapper,
  WizardChallengeWrapper,
  DatesChallengeWrapper,
  TabsChallengeWrapper,
  FileUploadChallengeWrapper,
  InfiniteScrollChallengeWrapper,
  FinalResultsPage,
  ResultsSharePage,
  type Challenge,
  type ChallengeWrapperProps,
} from "../challenges/";

type Difficulty = "easy" | "normal" | "hard" | "darksoul" | null;

const DIFFICULTY_LIMITS: Record<Exclude<Difficulty, null>, number> = {
  easy: Infinity,
  normal: 5 * 60 * 1000,
  hard: 2.5 * 60 * 1000,
  darksoul: 1 * 60 * 1000,
};

const CHALLENGE_COMPONENTS: Record<string, React.ComponentType<ChallengeWrapperProps>> = {
  "checkbox": CheckboxChallengeWrapper,
  "buttons": ButtonsChallengeWrapper,
  "table": TableChallengeWrapper,
  "dialogs": DialogsChallengeWrapper,
  "popovers": PopoversChallengeWrapper,
  "visible": VisibleChallengeWrapper,
  "math": MathChallengeWrapper,
  "memory": MemoryChallengeWrapper,
  "otp": OTPChallengeWrapper,
  "dates": DatesChallengeWrapper,
  "wizard": WizardChallengeWrapper,
  "tabs": TabsChallengeWrapper,
  "iframe": IFrameChallengeWrapper,
  "infinite-scroll": InfiniteScrollChallengeWrapper,
  "reorder-slider": ReorderSliderChallengeWrapper,
  "graph": GraphChallengeWrapper,
  "file-upload": FileUploadChallengeWrapper,
};

function SpeedrunPageContent() {
  const searchParams = useSearchParams();
  const modeParam = searchParams?.get("mode");

  const validDifficulty = modeParam && ["easy", "normal", "hard", "darksoul"].includes(modeParam)
    ? (modeParam as Difficulty)
    : null;

  const [started, setStarted] = useState(!!validDifficulty);
  const [difficulty, setDifficulty] = useState<Difficulty>(validDifficulty);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [finished, setFinished] = useState(false);
  const [timeLimitExceeded, setTimeLimitExceeded] = useState(false);
  const [resultName, setResultName] = useState("");
  const [showShareCode, setShowShareCode] = useState(false);
  const [challenges, setChallenges] = useState<Challenge[]>(
    CHALLENGES_LIST.map((c) => ({ ...c, completed: false }))
  );
  const [challengeTimes, setChallengeTimes] = useState<Record<string, number>>({});

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (started && !finished && !timeLimitExceeded) {
      if (startTimeRef.current === null) {
        startTimeRef.current = Date.now() - elapsedTime;
      }

      timerRef.current = setInterval(() => {
        const newElapsedTime = Date.now() - (startTimeRef.current || Date.now());
        setElapsedTime(newElapsedTime);

        if (difficulty && newElapsedTime > DIFFICULTY_LIMITS[difficulty]) {
          setTimeLimitExceeded(true);
          setFinished(true);
        }
      }, 10);
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
    setChallengeTimes((prev) => ({
      ...prev,
      [challengeId]: Date.now() - (startTimeRef.current || Date.now()),
    }));
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
    const ms = Math.floor((milliseconds % 1000) / 10);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  const completedCount = challenges.filter((ch) => ch.completed).length;
  const progressPercent = (completedCount / challenges.length) * 100;

  const timeLimit = difficulty ? DIFFICULTY_LIMITS[difficulty] : Infinity;
  const timeRemaining = Math.max(0, timeLimit - elapsedTime);
  const isTimeWarning = timeRemaining < 30 * 1000 && timeRemaining > 0;
  const isTimeCritical = timeRemaining < 10 * 1000 && timeRemaining > 0;

  const handleStop = () => {
    setFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleStartDifficulty = (selectedDifficulty: Difficulty) => {
    window.location.href = `/speedrun/challenge?mode=${selectedDifficulty}`;
  };

  const [showChallengesList, setShowChallengesList] = useState(false);

  // Build a map from challenge ID to its index in the challenges array
  const challengeIndexMap = new Map(challenges.map((ch, idx) => [ch.id, idx]));

  if (!validDifficulty) {
    return (
      <div className="font-sans min-h-screen p-8 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <main className="max-w-2xl w-full">
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <h1 className="text-4xl font-bold mb-4">Speedrun Challenge</h1>
            <p className="text-gray-600 mb-8 text-lg">
              Complete all challenges as fast as you can to test your AI agent&apos;s performance, accuracy, speed, and reliability.
            </p>

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
                  onClick={() => handleStartDifficulty("hard")}
                  className="p-4 bg-orange-50 border-2 border-orange-400 rounded-lg hover:bg-orange-100 transition-colors text-left"
                >
                  <p className="text-lg font-bold text-orange-700">Hard Mode</p>
                  <p className="text-sm text-orange-600">2 minute 30 second time limit - serious pressure</p>
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

            {/* Challenges Accordion */}
            <div className="mb-8 rounded-lg border border-blue-200 overflow-hidden">
              <button
                onClick={() => setShowChallengesList(!showChallengesList)}
                className="w-full p-4 bg-blue-50 flex items-center justify-between text-left hover:bg-blue-100 transition-colors"
              >
                <span className="text-lg font-semibold text-blue-900">
                  Challenges Include ({challenges.length} total)
                </span>
                <svg
                  className={`w-5 h-5 text-blue-700 transition-transform ${showChallengesList ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showChallengesList && (
                <div className="p-4 bg-blue-50/50">
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
              )}
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
        <div className="max-w-[1800px] mx-auto px-8 py-4">
          <div className="flex justify-between items-center gap-4 mb-4 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold whitespace-nowrap">Speedrun - {difficulty === "easy" ? "Easy" : difficulty === "normal" ? "Normal (5m)" : difficulty === "hard" ? "Hard (2m30s)" : "Dark Souls (1m)"}</h1>
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

              {!finished && (
                <button
                  onClick={handleStop}
                  className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold text-sm"
                >
                  Stop
                </button>
              )}
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

      <main className="max-w-[1800px] mx-auto p-8">

        {!finished ? (
          <div className="space-y-8">
            {CHALLENGE_CATEGORIES.map((category) => (
              <section key={category.name}>
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">
                  {category.name}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {category.challengeIds.map((challengeId) => {
                    const idx = challengeIndexMap.get(challengeId);
                    if (idx === undefined) return null;
                    const ChallengeComponent = CHALLENGE_COMPONENTS[challengeId];
                    if (!ChallengeComponent) return null;
                    return (
                      <ChallengeComponent
                        key={challengeId}
                        challenge={challenges[idx]}
                        onComplete={() => markChallengeComplete(challengeId)}
                      />
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : !showShareCode ? (
          <FinalResultsPage
            timeLimitExceeded={timeLimitExceeded}
            elapsedTime={elapsedTime}
            difficulty={difficulty}
            startTime={startTimeRef.current || Date.now()}
            completedCount={completedCount}
            challenges={challenges}
            challengeTimes={challengeTimes}
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
            challengeTimes={challengeTimes}
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
