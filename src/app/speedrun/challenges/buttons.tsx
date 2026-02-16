"use client";

import { useState, useEffect } from "react";
import { ChallengeCard } from "./challenge-card";
import type { ChallengeWrapperProps } from "./types";

export function ButtonsChallengeWrapper({ challenge, onComplete }: ChallengeWrapperProps) {
  const [clicked, setClicked] = useState<Set<string>>(new Set());
  const [loadingState, setLoadingState] = useState<"idle" | "loading" | "loaded">("idle");

  useEffect(() => {
    if (!challenge.completed && clicked.size >= 5) {
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

  const handleLoadingClick = () => {
    if (loadingState !== "idle") return;
    setLoadingState("loading");
    setTimeout(() => {
      setLoadingState("loaded");
    }, 2000);
  };

  return (
    <ChallengeCard
      title={challenge.name}
      completed={challenge.completed}
      checklist={[
        { text: "Click the price selection button", completed: clicked.has("btn-price") },
        { text: "Click the icon button", completed: clicked.has("btn-icon") },
        { text: "Click the pill button", completed: clicked.has("btn-pill") },
        { text: "Click the ghost button", completed: clicked.has("btn-ghost") },
        { text: "Click the loading button and wait for confirmation", completed: clicked.has("btn-loading") },
      ]}
    >
      <div className="space-y-3">
        {/* Price selection button — complex nested content */}
        <button
          type="button"
          onClick={() => handleClick("btn-price")}
          className={`w-full rounded transition-all duration-200 ${
            clicked.has("btn-price")
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
          data-cy="selectYourchoiceButton-0"
        >
          <div className="p-2">
            <div className="flex items-center justify-center gap-2">
              <span className="font-semibold text-lg">11.74&thinsp;€<span className="text-sm">/kg</span></span>
              <span className={clicked.has("btn-price") ? "text-green-200" : "text-blue-200"}>/</span>
              <span className="font-semibold text-lg">140.84&thinsp;€</span>
            </div>
            <span className="block text-center text-sm mt-1">
              {clicked.has("btn-price") ? "✓ Selected" : "Select"}
            </span>
          </div>
        </button>

        {/* Icon button — SVG icon with label */}
        <button
          onClick={() => handleClick("btn-icon")}
          className={`w-full p-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 ${
            clicked.has("btn-icon")
              ? "bg-green-100 text-green-700 hover:bg-green-200"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm font-medium">
            {clicked.has("btn-icon") ? "✓ Settings" : "Settings"}
          </span>
        </button>

        {/* Pill button — rounded-full shape */}
        <button
          onClick={() => handleClick("btn-pill")}
          className={`w-full px-6 py-3 rounded-full font-medium transition-all duration-200 ${
            clicked.has("btn-pill")
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-purple-600 text-white hover:bg-purple-700"
          }`}
        >
          {clicked.has("btn-pill") ? "✓ Pill Selected" : "Pill Button"}
        </button>

        <div className="flex gap-3">
          {/* Ghost button — minimal styling, no background */}
          <button
            onClick={() => handleClick("btn-ghost")}
            className={`flex-1 px-6 py-3 rounded font-medium transition-all duration-200 ${
              clicked.has("btn-ghost")
                ? "text-green-600 hover:bg-green-50"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {clicked.has("btn-ghost") ? "✓ Ghost" : "Ghost Button"}
          </button>

          {/* Disabled button — distractor, should NOT be clicked */}
          <button
            disabled
            className="flex-1 px-6 py-3 bg-gray-300 text-gray-500 rounded cursor-not-allowed"
          >
            Disabled
          </button>
        </div>

        {/* Loading button — tests agent patience/polling */}
        <div className="border-t border-gray-200 pt-3">
          {loadingState === "idle" && (
            <button
              onClick={handleLoadingClick}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded font-medium hover:bg-indigo-700 transition-all duration-200"
            >
              Load Data
            </button>
          )}
          {loadingState === "loading" && (
            <button
              disabled
              className="w-full px-6 py-3 bg-indigo-400 text-white rounded font-medium cursor-wait transition-all duration-200 animate-pulse"
            >
              <span className="inline-flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading...
              </span>
            </button>
          )}
          {loadingState === "loaded" && !clicked.has("btn-loading") && (
            <button
              onClick={() => handleClick("btn-loading")}
              className="w-full px-6 py-3 bg-emerald-600 text-white rounded font-medium hover:bg-emerald-700 transition-all duration-200"
            >
              Confirm ✓
            </button>
          )}
          {clicked.has("btn-loading") && (
            <button
              disabled
              className="w-full px-6 py-3 bg-green-600 text-white rounded font-medium cursor-default"
            >
              ✓ Confirmed
            </button>
          )}
        </div>
      </div>
    </ChallengeCard>
  );
}
