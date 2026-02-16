"use client";

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ChallengeCard } from "./challenge-card";
import type { ChallengeWrapperProps } from "./types";

export function DatesChallengeWrapper({ challenge, onComplete }: ChallengeWrapperProps) {
  const [nativeDate, setNativeDate] = useState<string>("");
  const [pickerDate, setPickerDate] = useState<Date | null>(null);

  const hasNativeDate = nativeDate !== "";
  const hasPickerDate = pickerDate !== null;

  useEffect(() => {
    if (!challenge.completed && hasNativeDate && hasPickerDate) {
      onComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasNativeDate, hasPickerDate, onComplete]);

  return (
    <ChallengeCard
      title={challenge.name}
      completed={challenge.completed}
      checklist={[
        { text: "Select date from native HTML picker", completed: hasNativeDate },
        { text: "Select date from react-datepicker", completed: hasPickerDate },
      ]}
    >
      <div className="space-y-4">
        {/* Native HTML Date Picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Native HTML Date Picker
          </label>
          <input
            type="date"
            value={nativeDate}
            onChange={(e) => setNativeDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {nativeDate && (
            <p className="mt-1 text-xs text-green-600">Selected: {nativeDate}</p>
          )}
        </div>

        {/* React DatePicker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            React DatePicker
          </label>
          <DatePicker
            selected={pickerDate}
            onChange={(date: Date | null) => setPickerDate(date)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholderText="Select a date"
            dateFormat="yyyy-MM-dd"
          />
          {pickerDate && (
            <p className="mt-1 text-xs text-green-600">
              Selected: {pickerDate.toISOString().split("T")[0]}
            </p>
          )}
        </div>
      </div>
    </ChallengeCard>
  );
}
