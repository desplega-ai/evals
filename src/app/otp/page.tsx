"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { authenticator } from "otplib";
import qrcode from "qrcode";

interface OTPState {
  secret: string;
  qrCode: string;
}

// Generate deterministic base32 secret from a seed string
function generateDeterministicSecret(seed: string): string {
  // Create a simple hash-based deterministic secret
  // This converts the seed into a valid base32 string
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Convert hash to base32
  const base32Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let secret = "";
  let num = Math.abs(hash);

  // Generate a 32-character base32 string (256 bits, which is a valid TOTP secret)
  for (let i = 0; i < 32; i++) {
    secret += base32Chars[num % 32];
    num = Math.floor(num / 32);
  }

  return secret;
}

function OTPPageContent() {
  const searchParams = useSearchParams();
  const seedParam = searchParams?.get("seed");
  const [otpState, setOtpState] = useState<OTPState>({ secret: "", qrCode: "" });
  const [otpInput, setOtpInput] = useState("");
  const [otpInputFields, setOtpInputFields] = useState<string[]>(["", "", "", "", "", ""]);
  const [currentCode, setCurrentCode] = useState("");
  const [validationResult, setValidationResult] = useState<"ok" | "no" | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [activeTab, setActiveTab] = useState<"text" | "fields">("text");

  // Generate initial OTP secret and QR code
  useEffect(() => {
    const generateSecret = async () => {
      try {
        // Use seeded secret if provided, otherwise generate random
        const secret = seedParam
          ? generateDeterministicSecret(seedParam)
          : authenticator.generateSecret();

        const otpauthUrl = authenticator.keyuri(
          "test@example.com",
          "Desplega.ai Evals",
          secret
        );

        const qrCodeUrl = await qrcode.toDataURL(otpauthUrl);

        setOtpState({
          secret,
          qrCode: qrCodeUrl,
        });

        // Generate initial code
        const code = authenticator.generate(secret);
        setCurrentCode(code);

        setIsLoading(false);
      } catch (error) {
        console.error("Failed to generate OTP:", error);
        setIsLoading(false);
      }
    };

    generateSecret();
  }, [seedParam]);

  // Update code every second and calculate time remaining
  useEffect(() => {
    const interval = setInterval(() => {
      if (otpState.secret) {
        const code = authenticator.generate(otpState.secret);
        setCurrentCode(code);

        // Calculate time remaining in current 30-second window
        const now = Math.floor(Date.now() / 1000);
        const timeInWindow = now % 30;
        const remaining = 30 - timeInWindow;
        setTimeRemaining(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [otpState.secret]);

  // Validate OTP input - re-validate every second to check expiration
  useEffect(() => {
    if (otpInput.length === 6 && otpState.secret) {
      // authenticator.check validates the code against the secret
      // It uses a default time window - revalidates every second due to currentCode dependency
      const isValid = authenticator.check(otpInput, otpState.secret);
      setValidationResult(isValid ? "ok" : "no");
    } else {
      setValidationResult(null);
    }
  }, [otpInput, otpState.secret, currentCode]); // Added currentCode as dependency to revalidate every second

  const handleRotate = async () => {
    setIsLoading(true);
    setOtpInput("");
    setValidationResult(null);
    setCopyFeedback(false);

    try {
      const secret = authenticator.generateSecret();

      const otpauthUrl = authenticator.keyuri(
        "test@example.com",
        "Desplega.ai Evals",
        secret
      );

      const qrCodeUrl = await qrcode.toDataURL(otpauthUrl);

      setOtpState({
        secret,
        qrCode: qrCodeUrl,
      });

      const code = authenticator.generate(secret);
      setCurrentCode(code);
    } catch (error) {
      console.error("Failed to rotate OTP:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(otpState.secret);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const handleOtpFieldChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, "").slice(-1);

    const newFields = [...otpInputFields];
    newFields[index] = digit;
    setOtpInputFields(newFields);

    // Auto-focus to next field if digit was entered
    if (digit && index < 5) {
      const nextInput = document.getElementById(`otp-field-${index + 1}`);
      nextInput?.focus();
    }

    // Update otpInput for validation
    setOtpInput(newFields.join(""));
  };

  const handleOtpFieldKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    // Handle backspace to go to previous field
    if (e.key === "Backspace" && !otpInputFields[index] && index > 0) {
      const prevInput = document.getElementById(`otp-field-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpFieldPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const digits = pastedData.replace(/\D/g, "").split("").slice(0, 6);

    const newFields = ["", "", "", "", "", ""];
    digits.forEach((digit, i) => {
      newFields[i] = digit;
    });

    setOtpInputFields(newFields);
    setOtpInput(newFields.join(""));

    // Focus on the last filled field or the next empty one
    const lastIndex = digits.length < 6 ? digits.length : 5;
    setTimeout(() => {
      const target = document.getElementById(`otp-field-${lastIndex}`);
      target?.focus();
    }, 0);
  };

  return (
    <div className="font-sans min-h-screen p-8">
      <main className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-4">OTP Testing Demo</h1>

        {seedParam && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-900">
            <span className="font-medium">Seed:</span> <code className="bg-blue-100 px-2 py-1 rounded">{seedParam}</code> - Change it with <code className="bg-blue-100 px-2 py-1 rounded">?seed=your-seed</code>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Generating OTP secret...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 auto-rows-max">
            {/* Secret and QR Code Section */}
            <div className="border border-gray-300 rounded-lg p-6 bg-gray-50">
              <h2 className="text-xl font-semibold mb-4">Secret & QR Code</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secret Key
                  </label>
                  <div className="flex gap-2 items-center">
                    <div className="flex-1 p-3 bg-white border border-gray-300 rounded font-mono text-sm text-gray-900 break-all">
                      {otpState.secret}
                    </div>
                    <button
                      onClick={handleCopySecret}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                      {copyFeedback ? "✓ Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    QR Code (Click to copy secret)
                  </label>
                  <div
                    onClick={handleCopySecret}
                    className="cursor-pointer inline-block p-4 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    title="Click to copy secret"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={otpState.qrCode}
                      alt="OTP QR Code"
                      className="w-48 h-48"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Click QR code to copy secret
                  </p>
                </div>

                <button
                  onClick={handleRotate}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:bg-gray-400"
                >
                  {isLoading ? "Rotating..." : "Rotate Secret"}
                </button>
              </div>
            </div>

            {/* OTP Validation Section with Tabs */}
            <div className="border border-gray-300 rounded-lg p-6 bg-gray-50">
              <h2 className="text-xl font-semibold mb-4">Validate OTP</h2>

              {/* Tab Buttons */}
              <div className="flex gap-2 mb-4 border-b border-gray-300">
                <button
                  onClick={() => {
                    setActiveTab("text");
                    setOtpInput("");
                    setOtpInputFields(["", "", "", "", "", ""]);
                    setValidationResult(null);
                  }}
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === "text"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Text Input
                </button>
                <button
                  onClick={() => {
                    setActiveTab("fields");
                    setOtpInput("");
                    setOtpInputFields(["", "", "", "", "", ""]);
                    setValidationResult(null);
                  }}
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === "fields"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Digit Fields
                </button>
              </div>

              <div className="space-y-4">
                {/* Text Input Tab */}
                {activeTab === "text" && (
                  <div>
                    <label
                      htmlFor="otpInput"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Enter 6-digit Code
                    </label>
                    <input
                      id="otpInput"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otpInput}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        setOtpInput(value);
                      }}
                      placeholder="000000"
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl letter-spacing tracking-widest"
                      autoComplete="one-time-code"
                    />
                  </div>
                )}

                {/* Digit Fields Tab */}
                {activeTab === "fields" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Enter each digit
                    </label>
                    <div className="flex gap-2 justify-center">
                      {otpInputFields.map((value, index) => (
                        <input
                          key={index}
                          id={`otp-field-${index}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={value}
                          onChange={(e) => handleOtpFieldChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpFieldKeyDown(index, e)}
                          onPaste={handleOtpFieldPaste}
                          placeholder="0"
                          className="w-10 h-10 border border-gray-300 rounded text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          autoComplete="off"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {validationResult && (
                  <div
                    className={`p-3 rounded text-center font-semibold ${
                      validationResult === "ok"
                        ? "bg-green-100 text-green-700 border border-green-300"
                        : "bg-red-100 text-red-700 border border-red-300"
                    }`}
                  >
                    {validationResult === "ok" ? "✓ OK" : "✗ NO"}
                  </div>
                )}
              </div>
            </div>

            {/* Current Code Section (Hidden by default) */}
            <details className="border border-gray-300 rounded-lg p-6 bg-gray-50 md:col-span-2">
              <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900 flex items-center justify-between">
                <span>Show current valid code (for testing)</span>
                {/* Liveness Circle Indicator */}
                <div className="relative w-8 h-8 flex-shrink-0 ml-4">
                  <svg className="w-full h-full" viewBox="0 0 32 32">
                    {/* Background circle */}
                    <circle cx="16" cy="16" r="14" fill="none" stroke="#e5e7eb" strokeWidth="2" />
                    {/* Progress circle */}
                    <circle
                      cx="16"
                      cy="16"
                      r="14"
                      fill="none"
                      strokeWidth="2"
                      strokeDasharray={`${(timeRemaining / 30) * 88} 88`}
                      className={`transition-all duration-1000 -rotate-90 origin-center ${
                        timeRemaining > 10
                          ? "stroke-green-500"
                          : timeRemaining > 5
                          ? "stroke-yellow-500"
                          : "stroke-red-500"
                      }`}
                      style={{
                        transform: "rotate(-90deg)",
                        transformOrigin: "50% 50%",
                      }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-700">
                    {timeRemaining}
                  </span>
                </div>
              </summary>
              <div className="mt-4 p-4 bg-white border border-gray-300 rounded">
                <p className="text-sm text-gray-600 mb-2">Current valid code:</p>
                <p className="font-mono text-2xl text-gray-900 text-center letter-spacing tracking-widest">
                  {currentCode}
                </p>

                {/* Timing Indicator */}
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs text-gray-600">Expires in:</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {timeRemaining}s
                    </p>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${
                        timeRemaining > 10
                          ? "bg-green-500"
                          : timeRemaining > 5
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{
                        width: `${(timeRemaining / 30) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-3 text-center">
                  Updates every second
                </p>
              </div>
            </details>
          </div>
        )}
      </main>
    </div>
  );
}

export default function OTPPage() {
  return (
    <Suspense fallback={<div className="font-sans min-h-screen p-8"><main className="max-w-2xl mx-auto"><p className="text-gray-600">Loading...</p></main></div>}>
      <OTPPageContent />
    </Suspense>
  );
}
