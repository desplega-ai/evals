"use client";

import React, { useState, useEffect } from "react";
import { ChallengeCard } from "./challenge-card";
import type { ChallengeWrapperProps } from "./types";

const REORDER_ITEMS = [
  { id: "item-c", label: "3. Deploy to production", correctIndex: 2 },
  { id: "item-a", label: "1. Write the code", correctIndex: 0 },
  { id: "item-b", label: "2. Run the tests", correctIndex: 1 },
];

export function ReorderSliderChallengeWrapper({ challenge, onComplete }: ChallengeWrapperProps) {
  const [items, setItems] = useState(REORDER_ITEMS);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [sliderValue, setSliderValue] = useState(0);

  const isCorrectOrder = items.every((item, i) => item.correctIndex === i);
  const sliderComplete = sliderValue === 100;

  useEffect(() => {
    if (!challenge.completed && isCorrectOrder && sliderComplete) {
      onComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCorrectOrder, sliderComplete, onComplete]);

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }
    const newItems = [...items];
    const [removed] = newItems.splice(dragIndex, 1);
    newItems.splice(index, 0, removed);
    setItems(newItems);
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  return (
    <ChallengeCard
      title={challenge.name}
      completed={challenge.completed}
      checklist={[
        { text: "Drag items into the correct order", completed: isCorrectOrder },
        { text: "Slide the slider all the way to the right", completed: sliderComplete },
      ]}
    >
      <div className="space-y-4">
        <p className="text-xs text-gray-600">Drag the steps into the correct order (1, 2, 3):</p>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={() => handleDrop(index)}
              onDragEnd={handleDragEnd}
              data-testid={`reorder-item-${index}`}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg border cursor-grab active:cursor-grabbing transition-colors ${
                dragIndex === index
                  ? "opacity-50 bg-blue-50 border-blue-300"
                  : overIndex === index
                  ? "bg-blue-100 border-blue-400"
                  : isCorrectOrder
                  ? "bg-green-50 border-green-300"
                  : "bg-white border-gray-200 hover:border-gray-300"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="text-gray-400 flex-shrink-0">
                <circle cx="5" cy="3" r="1.5" />
                <circle cx="11" cy="3" r="1.5" />
                <circle cx="5" cy="8" r="1.5" />
                <circle cx="11" cy="8" r="1.5" />
                <circle cx="5" cy="13" r="1.5" />
                <circle cx="11" cy="13" r="1.5" />
              </svg>
              <span className="text-sm font-medium text-gray-900">{item.label}</span>
            </div>
          ))}
        </div>
        {isCorrectOrder && (
          <p className="text-xs text-green-600 font-medium">Correct order!</p>
        )}

        <div className="border-t border-gray-200 pt-4">
          <p className="text-xs text-gray-600 mb-2">
            Slide all the way to the right to confirm:
          </p>
          <input
            type="range"
            min={0}
            max={100}
            value={sliderValue}
            onChange={(e) => setSliderValue(Number(e.target.value))}
            className="w-full accent-blue-600"
            aria-label="Confirmation slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span className={sliderComplete ? "text-green-600 font-medium" : ""}>
              {sliderValue}%{sliderComplete ? " — Confirmed!" : ""}
            </span>
            <span>100</span>
          </div>
        </div>
      </div>
    </ChallengeCard>
  );
}
