"use client";

import { useState, useEffect, useRef } from "react";
import { ChallengeCard } from "./challenge-card";
import type { ChallengeWrapperProps } from "./types";

export function PopoversChallengeWrapper({ challenge, onComplete }: ChallengeWrapperProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [hasOpenedPopover, setHasOpenedPopover] = useState(false);
  const [actionClicked, setActionClicked] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openPopover = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setPopoverOpen(true);
    setHasOpenedPopover(true);
  };

  const startCloseTimer = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setPopoverOpen(false);
      closeTimerRef.current = null;
    }, 2000);
  };

  const handleClick = () => {
    if (popoverOpen) {
      setPopoverOpen(false);
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    } else {
      openPopover();
    }
  };

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

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
        { text: "Open the popover (click or hover)", completed: hasOpenedPopover },
        { text: "Click the action button inside", completed: actionClicked },
      ]}
    >
      <div
        className="relative"
        onMouseEnter={openPopover}
        onMouseLeave={startCloseTimer}
      >
        <button
          onClick={handleClick}
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
                  if (closeTimerRef.current) {
                    clearTimeout(closeTimerRef.current);
                    closeTimerRef.current = null;
                  }
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
