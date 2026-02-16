"use client";

import React, { useState, useEffect } from "react";
import { authenticator } from "otplib";
import { ChallengeCard } from "./challenge-card";
import type { ChallengeWrapperProps } from "./types";

export function OTPChallengeWrapper({ challenge, onComplete }: ChallengeWrapperProps) {
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
