"use client";

import { useState, useEffect, useRef } from "react";
import { ChallengeCard } from "./challenge-card";
import type { ChallengeWrapperProps } from "./types";

export function FileUploadChallengeWrapper({ challenge, onComplete }: ChallengeWrapperProps) {
  const [fileName, setFileName] = useState("");
  const [verifyString, setVerifyString] = useState("");
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [hasUploaded, setHasUploaded] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<"match" | "mismatch" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate file content on mount
  useEffect(() => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let randomChars = "";
    for (let i = 0; i < 6; i++) {
      randomChars += chars[Math.floor(Math.random() * chars.length)];
    }
    const name = `speedrun-challenge-${randomChars}.txt`;
    const verify = `SPEEDRUN-VERIFY-${randomChars.toUpperCase()}`;
    setFileName(name);
    setVerifyString(verify);
  }, []);

  useEffect(() => {
    if (!challenge.completed && hasDownloaded && hasUploaded) {
      onComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasDownloaded, hasUploaded, onComplete]);

  const handleDownload = () => {
    const blob = new Blob([verifyString], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setHasDownloaded(true);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = (event.target?.result as string).trim();
      if (content === verifyString) {
        setHasUploaded(true);
        setUploadFeedback("match");
      } else {
        setUploadFeedback("mismatch");
      }
    };
    reader.readAsText(file);
  };

  return (
    <ChallengeCard
      title={challenge.name}
      completed={challenge.completed}
      checklist={[
        { text: "Download the file", completed: hasDownloaded },
        { text: "Upload the same file back", completed: hasUploaded },
      ]}
    >
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">
            Download the file below, then upload it back to verify.
          </p>
          <p className="text-xs text-gray-500 mb-3">
            File: <span className="font-mono">{fileName}</span>
          </p>
          <button
            onClick={handleDownload}
            className={`w-full px-4 py-3 rounded font-medium transition-all ${
              hasDownloaded
                ? "bg-green-600 text-white"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {hasDownloaded ? "✓ Downloaded" : "Download File"}
          </button>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt"
            onChange={handleUpload}
            aria-label="File upload"
            className="sr-only"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={!hasDownloaded}
            className={`w-full px-4 py-3 rounded font-medium transition-all ${
              !hasDownloaded
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : hasUploaded
                ? "bg-green-600 text-white"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            {hasUploaded ? "✓ Uploaded & Verified" : "Upload File"}
          </button>

          {uploadFeedback === "match" && (
            <p className="mt-2 text-sm text-green-600 font-medium">✓ File content matches! Challenge complete.</p>
          )}
          {uploadFeedback === "mismatch" && (
            <p className="mt-2 text-sm text-red-600 font-medium">✗ Wrong file — content does not match. Try uploading the correct file.</p>
          )}
        </div>
      </div>
    </ChallengeCard>
  );
}
