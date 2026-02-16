"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { CHALLENGES_LIST } from "../challenges";

interface ResultsData {
  name: string;
  time: number;
  timeFormatted: string;
  startTime: string;
  endTime: string;
  completedChallenges: number;
  totalChallenges: number;
  completedIds?: string[];
  challengeTimes?: Record<string, number>;
  userAgent: string;
  platform: string;
}

function formatChallengeTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function ResultsPageContent() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<ResultsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const data = searchParams?.get("data");
    if (!data) {
      setError("No results data found");
      return;
    }

    try {
      const decoded = Buffer.from(data, "base64").toString("utf-8");
      const parsed: ResultsData = JSON.parse(decoded);
      setResults(parsed);
    } catch {
      setError("Failed to decode results");
    }
  }, [searchParams]);

  if (error) {
    return (
      <div className="font-sans min-h-screen p-8 bg-gradient-to-br from-gray-50 to-gray-100">
        <main className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/speedrun"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
            >
              ← Back to Speedrun
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="font-sans min-h-screen p-8 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  const startDate = new Date(results.startTime);
  const endDate = new Date(results.endTime);
  const duration = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);

  return (
    <div className="font-sans min-h-screen p-8 bg-gradient-to-br from-gray-50 to-gray-100">
      <main className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              🏆 {results.name}&apos;s Results
            </h1>
            <p className="text-gray-600">AI Speedrun Challenge</p>
          </div>

          {/* Main Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 bg-blue-50 rounded-lg border-2 border-blue-300 text-center">
              <p className="text-gray-600 text-sm mb-2">Final Time</p>
              <p className="text-4xl font-mono font-bold text-blue-600">
                {results.timeFormatted}
              </p>
            </div>

            <div className="p-6 bg-green-50 rounded-lg border-2 border-green-300 text-center">
              <p className="text-gray-600 text-sm mb-2">Challenges Completed</p>
              <p className="text-4xl font-bold text-green-600">
                {results.completedChallenges}/{results.totalChallenges}
              </p>
            </div>

            <div className="p-6 bg-purple-50 rounded-lg border-2 border-purple-300 text-center">
              <p className="text-gray-600 text-sm mb-2">Success Rate</p>
              <p className="text-4xl font-bold text-purple-600">
                {Math.round(
                  (results.completedChallenges / results.totalChallenges) * 100
                )}
                %
              </p>
            </div>
          </div>

          {/* Timing Details */}
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-300 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Timing Details</h2>
            <div className="space-y-2 text-sm">
              <p className="text-gray-700">
                <strong>Started:</strong> {startDate.toLocaleString()}
              </p>
              <p className="text-gray-700">
                <strong>Completed:</strong> {endDate.toLocaleString()}
              </p>
              <p className="text-gray-700">
                <strong>Duration:</strong> {Math.floor(duration / 60)}m {duration % 60}s
              </p>
            </div>
          </div>

          {/* Challenges Breakdown */}
          {results.completedIds && (
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-300 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Challenges Breakdown</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {CHALLENGES_LIST.map((challenge) => {
                  const completed = results.completedIds!.includes(challenge.id);
                  const time = results.challengeTimes?.[challenge.id];
                  return (
                    <div
                      key={challenge.id}
                      className={`flex items-center p-3 rounded ${
                        completed
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full mr-3 text-sm font-bold ${
                        completed
                          ? "bg-green-600 text-white"
                          : "bg-gray-400 text-white"
                      }`}>
                        {completed ? "✓" : "✗"}
                      </span>
                      <span className="text-sm font-medium flex-1">{challenge.name}</span>
                      {completed && time !== undefined && (
                        <span className="text-xs font-mono text-green-600 ml-2">
                          {formatChallengeTime(time)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* System Info */}
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-300 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">System Information</h2>
            <div className="space-y-2 text-sm break-all">
              <p className="text-gray-700">
                <strong>Browser:</strong> {results.userAgent}
              </p>
              <p className="text-gray-700">
                <strong>Platform:</strong> {results.platform}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                `Check out ${results.name}&apos;s AI Speedrun Challenge results! 🚀\n\nTime: ${results.timeFormatted}\nChallenges: ${results.completedChallenges}/${results.totalChallenges}\n\nCan you beat this time? 👊`
              )}&url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-6 py-3 bg-blue-400 text-white font-bold rounded-lg hover:bg-blue-500 transition-colors text-center"
            >
              Share on Twitter 𝕏
            </a>
            <Link
              href="/speedrun"
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              Try the Challenge
            </Link>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="text-blue-600 hover:underline font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="font-sans min-h-screen p-8"><main className="max-w-2xl mx-auto"><p className="text-gray-600">Loading...</p></main></div>}>
      <ResultsPageContent />
    </Suspense>
  );
}
