"use client";

import { useState, useEffect, useRef } from "react";
import { ChallengeCard } from "./challenge-card";
import type { ChallengeWrapperProps } from "./types";

interface NestedItem {
  id: string;
  title: string;
  content?: string;
  code?: string;
  children?: NestedItem[];
}

function randomCode(prefix: string): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}-${s}`;
}

function generateCodes() {
  const tabCode = randomCode("TAB");
  const nestCode = randomCode("NEST");

  const tabContent = [
    { id: "profile", label: "Profile", content: "User profile information and settings.", code: null as string | null },
    { id: "security", label: "Security", content: `Password and authentication settings. Secret: ${tabCode}`, code: tabCode },
    { id: "billing", label: "Billing", content: "Payment methods and invoices.", code: null as string | null },
  ];

  const nestedAccordion: NestedItem[] = [
    {
      id: "getting-started",
      title: "Getting Started",
      children: [
        { id: "install", title: "Installation", content: "Download and run the installer." },
        {
          id: "config",
          title: "Configuration",
          children: [
            { id: "basic", title: "Basic Setup", content: "Configure your API keys." },
            { id: "advanced", title: "Advanced Options", content: `Hidden code: ${nestCode}`, code: nestCode },
          ],
        },
      ],
    },
    {
      id: "features",
      title: "Features",
      content: "Explore our product features and capabilities.",
    },
  ];

  return { tabCode, nestCode, tabContent, nestedAccordion };
}

export function TabsChallengeWrapper({ challenge, onComplete }: ChallengeWrapperProps) {
  const codesRef = useRef<ReturnType<typeof generateCodes> | null>(null);
  const [ready, setReady] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [openPanels, setOpenPanels] = useState<Set<string>>(new Set());
  const [tabCodeInput, setTabCodeInput] = useState("");
  const [nestCodeInput, setNestCodeInput] = useState("");
  const [tabCodeValid, setTabCodeValid] = useState(false);
  const [nestCodeValid, setNestCodeValid] = useState(false);

  // Generate codes client-side only to avoid SSR hydration mismatch
  useEffect(() => {
    if (!codesRef.current) {
      codesRef.current = generateCodes();
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!challenge.completed && tabCodeValid && nestCodeValid) {
      onComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabCodeValid, nestCodeValid, onComplete]);

  const togglePanel = (id: string) => {
    setOpenPanels((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const codes = codesRef.current;

  const validateTabCode = (value: string) => {
    setTabCodeInput(value);
    setTabCodeValid(!!codes && value.trim().toUpperCase() === codes.tabCode);
  };

  const validateNestCode = (value: string) => {
    setNestCodeInput(value);
    setNestCodeValid(!!codes && value.trim().toUpperCase() === codes.nestCode);
  };

  const renderNestedAccordion = (items: NestedItem[], depth = 0) => {
    return (
      <div className={`space-y-1 ${depth > 0 ? "ml-3 mt-1" : ""}`}>
        {items.map((item) => (
          <div key={item.id} className="border border-gray-200 rounded overflow-hidden">
            <button
              onClick={() => togglePanel(item.id)}
              className={`w-full flex items-center justify-between p-2 text-left text-sm transition-colors ${
                openPanels.has(item.id)
                  ? "bg-purple-50 text-purple-700"
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <span className={depth > 0 ? "text-xs" : "text-sm"}>{item.title}</span>
              <svg
                className={`w-4 h-4 transition-transform ${openPanels.has(item.id) ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openPanels.has(item.id) && (
              <div className="p-2 bg-white border-t border-gray-200">
                {item.content && (
                  <p className={`text-gray-600 ${item.code ? "text-yellow-700 font-medium bg-yellow-50 p-1 rounded" : ""} ${depth > 0 ? "text-xs" : "text-sm"}`}>
                    {item.content}
                  </p>
                )}
                {item.children && renderNestedAccordion(item.children, depth + 1)}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <ChallengeCard
      title={challenge.name}
      completed={challenge.completed}
      checklist={[
        { text: "Find secret code from a tab", completed: tabCodeValid },
        { text: "Find secret code from nested accordion", completed: nestCodeValid },
      ]}
    >
      <div className="space-y-4">
        <p className="text-xs text-gray-600">
          Two secret codes are hidden in the UI below. One is inside a tab you haven&apos;t viewed yet — switch between tabs to find it.
          The other is buried in a nested accordion — expand each level until you reach the deepest item.
          Enter both codes in the inputs at the bottom.
        </p>

        {/* Tabs */}
        {ready && codes && (
          <>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="flex border-b border-gray-200">
                {codes.tabContent.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="p-3">
                {codes.tabContent.map((tab) => (
                  <div key={tab.id} className={activeTab === tab.id ? "block" : "hidden"}>
                    <p className={`text-sm ${tab.code ? "text-yellow-700 font-medium bg-yellow-50 p-2 rounded" : "text-gray-600"}`}>
                      {tab.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Nested Accordion */}
            <div>
              <p className="text-xs text-gray-600 mb-2">Navigate nested accordions to find the second code:</p>
              {renderNestedAccordion(codes.nestedAccordion)}
            </div>
          </>
        )}

        {/* Code Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Tab Code</label>
            <input
              type="text"
              value={tabCodeInput}
              onChange={(e) => validateTabCode(e.target.value)}
              placeholder="Enter tab code"
              className={`w-full px-2 py-1 border rounded text-sm ${
                tabCodeValid
                  ? "border-green-500 bg-green-50"
                  : tabCodeInput
                  ? "border-red-300"
                  : "border-gray-300"
              }`}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nested Code</label>
            <input
              type="text"
              value={nestCodeInput}
              onChange={(e) => validateNestCode(e.target.value)}
              placeholder="Enter nested code"
              className={`w-full px-2 py-1 border rounded text-sm ${
                nestCodeValid
                  ? "border-green-500 bg-green-50"
                  : nestCodeInput
                  ? "border-red-300"
                  : "border-gray-300"
              }`}
            />
          </div>
        </div>
      </div>
    </ChallengeCard>
  );
}
