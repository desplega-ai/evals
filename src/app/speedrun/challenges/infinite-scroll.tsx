"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChallengeCard } from "./challenge-card";
import type { ChallengeWrapperProps } from "./types";

interface ScrollItem {
  id: number;
  name: string;
  code: string;
}

function randomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `SR-${s}`;
}

const BATCH_SIZE = 8;
const TARGET_ITEM_INDEX = 21; // Item #22 (0-indexed: 21)

function generateItems(): ScrollItem[] {
  const items: ScrollItem[] = [];
  for (let i = 1; i <= 30; i++) {
    items.push({ id: i, name: `Item #${i}`, code: randomCode() });
  }
  return items;
}

export function InfiniteScrollChallengeWrapper({ challenge, onComplete }: ChallengeWrapperProps) {
  const allItemsRef = useRef<ScrollItem[] | null>(null);
  const [visibleItems, setVisibleItems] = useState<ScrollItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasScrolledToLoad, setHasScrolledToLoad] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [hasEnteredCode, setHasEnteredCode] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate items client-side only to avoid SSR hydration mismatch from Math.random()
  useEffect(() => {
    if (!allItemsRef.current) {
      const items = generateItems();
      allItemsRef.current = items;
      setVisibleItems(items.slice(0, BATCH_SIZE));
    }
  }, []);

  const allItems = allItemsRef.current;
  const targetItem = allItems?.[TARGET_ITEM_INDEX];
  const allLoaded = allItems ? visibleItems.length >= allItems.length : false;

  const loadMore = useCallback(() => {
    if (isLoading || allLoaded || !allItems) return;
    setIsLoading(true);
    const items = allItems;
    setTimeout(() => {
      setVisibleItems((prev) => {
        const nextBatch = items.slice(prev.length, prev.length + BATCH_SIZE);
        return [...prev, ...nextBatch];
      });
      setHasScrolledToLoad(true);
      setIsLoading(false);
    }, 800);
  }, [isLoading, allLoaded, allItems]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { root: containerRef.current, threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  // Check code input
  useEffect(() => {
    if (targetItem && codeInput.trim().toUpperCase() === targetItem.code) {
      setHasEnteredCode(true);
    }
  }, [codeInput, targetItem]);

  useEffect(() => {
    if (!challenge.completed && hasScrolledToLoad && hasEnteredCode) {
      onComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasScrolledToLoad, hasEnteredCode, onComplete]);

  return (
    <ChallengeCard
      title={challenge.name}
      completed={challenge.completed}
      checklist={[
        { text: "Scroll to load more items", completed: hasScrolledToLoad },
        { text: `Enter the code from Item #${TARGET_ITEM_INDEX + 1}`, completed: hasEnteredCode },
      ]}
    >
      <div className="space-y-4">
        <p className="text-xs text-gray-600">
          Scroll down in the list to load more items. Find <strong>Item #{TARGET_ITEM_INDEX + 1}</strong> and enter its code below.
        </p>

        {/* Scrollable container */}
        <div
          ref={containerRef}
          className="max-h-[300px] overflow-y-auto border border-gray-200 rounded-lg"
        >
          <div className="divide-y divide-gray-100">
            {visibleItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between px-3 py-2 text-sm ${
                  item.id === TARGET_ITEM_INDEX + 1
                    ? "bg-yellow-50 border-l-4 border-yellow-400"
                    : "hover:bg-gray-50"
                }`}
              >
                <span className="font-medium text-gray-900">{item.name}</span>
                <span className="font-mono text-xs text-gray-500">{item.code}</span>
              </div>
            ))}
          </div>

          {/* Sentinel element for IntersectionObserver */}
          {!allLoaded && (
            <div ref={sentinelRef} className="p-3 text-center">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Loading more items...
                </div>
              ) : (
                <span className="text-xs text-gray-400">Scroll for more</span>
              )}
            </div>
          )}
          {allLoaded && (
            <div className="p-2 text-center text-xs text-gray-400">
              All {allItems?.length ?? 30} items loaded
            </div>
          )}
        </div>

        {/* Code input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Enter code from Item #{TARGET_ITEM_INDEX + 1}:
          </label>
          <input
            type="text"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            placeholder="e.g. SR-A7K2"
            className={`w-full px-3 py-2 border rounded-lg text-sm font-mono ${
              hasEnteredCode
                ? "border-green-500 bg-green-50"
                : codeInput
                ? "border-gray-300"
                : "border-gray-300"
            }`}
          />
          {hasEnteredCode && (
            <p className="mt-1 text-xs text-green-600 font-medium">✓ Correct code!</p>
          )}
        </div>
      </div>
    </ChallengeCard>
  );
}
