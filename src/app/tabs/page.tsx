"use client";

import Link from "next/link";
import { useState } from "react";

// Nested accordion type
interface NestedAccordionItem {
  id: string;
  title: string;
  content?: string;
  children?: NestedAccordionItem[];
}

// Tab content with secret codes
const tabContent = [
  { id: "tab1", label: "Profile", secretCode: "ALPHA-7X", content: "User profile information including name, email, and preferences." },
  { id: "tab2", label: "Settings", secretCode: "BETA-3Y", content: "Configuration options for notifications, privacy, and display settings." },
  { id: "tab3", label: "History", secretCode: "GAMMA-9Z", content: "Activity history showing recent actions and transactions." },
  { id: "tab4", label: "Billing", secretCode: "DELTA-2W", content: "Payment details, invoices, and subscription information." },
];

// FAQ accordion items
const faqItems = [
  { id: "faq1", title: "How do I reset my password?", content: "Go to Settings > Security > Reset Password. You'll receive an email with a reset link." },
  { id: "faq2", title: "What payment methods do you accept?", content: "We accept Visa, MasterCard, American Express, PayPal, and bank transfers." },
  { id: "faq3", title: "How can I cancel my subscription?", content: "Navigate to Billing > Subscription > Cancel. Your access continues until the end of the billing period." },
  { id: "faq4", title: "Is my data secure?", content: "Yes, we use AES-256 encryption and comply with SOC 2 Type II standards." },
  { id: "faq5", title: "How do I contact support?", content: "Email support@example.com or use the chat widget in the bottom-right corner." },
];

// Nested accordion structure
const nestedAccordion: NestedAccordionItem[] = [
  {
    id: "section1",
    title: "Getting Started",
    children: [
      { id: "sub1-1", title: "Installation", content: "Download the installer from our website and run the setup wizard. Target code: NEST-A1." },
      { id: "sub1-2", title: "Initial Configuration", content: "After installation, configure your API keys in the settings panel." },
      {
        id: "sub1-3",
        title: "Quick Start Guide",
        children: [
          { id: "sub1-3-1", title: "Creating Your First Project", content: "Click 'New Project' and select a template. Hidden treasure: DEEP-X7." },
          { id: "sub1-3-2", title: "Running Your First Test", content: "Use the 'Run' button or press Ctrl+R to execute tests." },
        ],
      },
    ],
  },
  {
    id: "section2",
    title: "Advanced Features",
    children: [
      { id: "sub2-1", title: "Custom Integrations", content: "Connect to third-party services using our webhook system." },
      { id: "sub2-2", title: "API Reference", content: "Full API documentation available at /docs/api. Master key: CORE-Z9." },
    ],
  },
  {
    id: "section3",
    title: "Troubleshooting",
    children: [
      { id: "sub3-1", title: "Common Issues", content: "Check our FAQ for solutions to frequently encountered problems." },
      { id: "sub3-2", title: "Error Codes", content: "Error codes are documented at /docs/errors with resolution steps." },
    ],
  },
];

// Accordion with actions data
const actionAccordionItems = [
  {
    id: "action1",
    title: "Newsletter Preferences",
    actions: [
      { id: "weekly", label: "Weekly Digest", type: "checkbox" as const },
      { id: "monthly", label: "Monthly Summary", type: "checkbox" as const },
      { id: "breaking", label: "Breaking News", type: "checkbox" as const },
    ],
  },
  {
    id: "action2",
    title: "Quick Actions",
    buttons: [
      { id: "export", label: "Export Data", color: "blue" },
      { id: "archive", label: "Archive All", color: "gray" },
      { id: "reset", label: "Reset Settings", color: "red" },
    ],
  },
  {
    id: "action3",
    title: "Feedback Form",
    hasInput: true,
    inputLabel: "Your feedback:",
    inputPlaceholder: "Tell us what you think...",
  },
];

// Mixed challenge data
const mixedTabs = [
  {
    id: "mixed1",
    label: "Documentation",
    accordions: [
      { id: "doc1", title: "API Basics", content: "Learn the fundamentals of our REST API." },
      { id: "doc2", title: "Authentication", content: "JWT tokens are required. The auth secret is: AUTH-K3." },
      { id: "doc3", title: "Rate Limits", content: "100 requests per minute for free tier, 1000 for paid." },
    ],
  },
  {
    id: "mixed2",
    label: "Examples",
    accordions: [
      { id: "ex1", title: "Python SDK", content: "pip install our-sdk. Example code: SDK-PY42." },
      { id: "ex2", title: "JavaScript SDK", content: "npm install our-sdk. Example code: SDK-JS77." },
      { id: "ex3", title: "Go SDK", content: "go get our-sdk. Example code: SDK-GO99." },
    ],
  },
  {
    id: "mixed3",
    label: "Support",
    accordions: [
      { id: "sup1", title: "Contact Us", content: "Email: support@example.com, Phone: 1-800-EXAMPLE" },
      { id: "sup2", title: "Office Hours", content: "Mon-Fri 9am-5pm EST. Emergency code: HELP-911." },
    ],
  },
];

// Chevron icon component
function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      className={`w-5 h-5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export default function TabsPage() {
  // Basic tabs state
  const [activeTab, setActiveTab] = useState("tab1");

  // Hidden data tabs state
  const [activeHiddenTab, setActiveHiddenTab] = useState("tab1");

  // Basic accordion state (exclusive - only one open)
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  // Nested accordion state (multiple can be open)
  const [openNestedPanels, setOpenNestedPanels] = useState<Set<string>>(new Set());

  // Accordion with actions state
  const [openActionAccordion, setOpenActionAccordion] = useState<string | null>(null);
  const [newsletterPrefs, setNewsletterPrefs] = useState<Set<string>>(new Set());
  const [feedbackText, setFeedbackText] = useState("");
  const [actionLog, setActionLog] = useState<string[]>([]);

  // Mixed challenge state
  const [activeMixedTab, setActiveMixedTab] = useState("mixed1");
  const [openMixedAccordion, setOpenMixedAccordion] = useState<string | null>(null);

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  const toggleNestedPanel = (id: string) => {
    setOpenNestedPanels((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleActionAccordion = (id: string) => {
    setOpenActionAccordion(openActionAccordion === id ? null : id);
  };

  const toggleNewsletterPref = (id: string) => {
    setNewsletterPrefs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleActionButton = (action: string) => {
    setActionLog((prev) => [...prev, `${action} clicked at ${new Date().toLocaleTimeString()}`]);
  };

  const toggleMixedAccordion = (id: string) => {
    setOpenMixedAccordion(openMixedAccordion === id ? null : id);
  };

  // Recursive nested accordion renderer
  const renderNestedAccordion = (items: NestedAccordionItem[], depth = 0) => {
    return (
      <div className={`space-y-2 ${depth > 0 ? "ml-4 mt-2" : ""}`}>
        {items.map((item) => (
          <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleNestedPanel(item.id)}
              className={`w-full flex items-center justify-between p-3 text-left transition-colors ${
                openNestedPanels.has(item.id)
                  ? "bg-blue-50 text-blue-700"
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <span className={`font-medium ${depth > 0 ? "text-sm" : ""}`}>{item.title}</span>
              <ChevronIcon isOpen={openNestedPanels.has(item.id)} />
            </button>
            {openNestedPanels.has(item.id) && (
              <div className="p-3 bg-white border-t border-gray-200">
                {item.content && <p className="text-gray-600 text-sm">{item.content}</p>}
                {item.children && renderNestedAccordion(item.children, depth + 1)}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="font-sans min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8">Tabs & Accordions Demo</h1>

        <div className="space-y-12">
          {/* Section 1: Basic Tabs */}
          <section>
            <h2 className="text-xl font-semibold mb-4">1. Basic Tabs</h2>
            <p className="text-gray-600 mb-4">Click each tab to see its content. Only one panel is visible at a time.</p>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Tab headers */}
              <div className="flex border-b border-gray-200">
                {tabContent.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="p-4">
                {tabContent.map((tab) => (
                  <div key={tab.id} className={activeTab === tab.id ? "block" : "hidden"}>
                    <h3 className="font-medium text-lg mb-2">{tab.label} Panel</h3>
                    <p className="text-gray-600">{tab.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section 2: Tabs with Hidden Data */}
          <section>
            <h2 className="text-xl font-semibold mb-4">2. Tabs with Hidden Data</h2>
            <p className="text-gray-600 mb-4">
              <strong>Challenge:</strong> Find all 4 secret codes hidden across the tabs.
            </p>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Tab headers */}
              <div className="flex border-b border-gray-200 bg-gray-50">
                {tabContent.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveHiddenTab(tab.id)}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                      activeHiddenTab === tab.id
                        ? "border-b-2 border-blue-600 text-blue-600 bg-white"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content with secret codes */}
              <div className="p-6">
                {tabContent.map((tab) => (
                  <div key={tab.id} className={activeHiddenTab === tab.id ? "block" : "hidden"}>
                    <div className="space-y-4">
                      <p className="text-gray-600">{tab.content}</p>
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <span className="text-sm text-yellow-800">
                          Secret Code: <code className="font-mono font-bold">{tab.secretCode}</code>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section 3: Basic Accordion */}
          <section>
            <h2 className="text-xl font-semibold mb-4">3. Basic Accordion (FAQ)</h2>
            <p className="text-gray-600 mb-4">Click a question to expand/collapse. Only one can be open at a time.</p>

            <div className="space-y-2">
              {faqItems.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleAccordion(item.id)}
                    className={`w-full flex items-center justify-between p-4 text-left transition-colors ${
                      openAccordion === item.id
                        ? "bg-blue-50 text-blue-700"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <span className="font-medium">{item.title}</span>
                    <ChevronIcon isOpen={openAccordion === item.id} />
                  </button>
                  {openAccordion === item.id && (
                    <div className="p-4 bg-white border-t border-gray-200">
                      <p className="text-gray-600">{item.content}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Section 4: Nested Accordion */}
          <section>
            <h2 className="text-xl font-semibold mb-4">4. Nested Accordion</h2>
            <p className="text-gray-600 mb-4">
              <strong>Challenge:</strong> Navigate through 3 levels to find the hidden codes: NEST-A1 and DEEP-X7.
            </p>

            {renderNestedAccordion(nestedAccordion)}
          </section>

          {/* Section 5: Accordion with Actions */}
          <section>
            <h2 className="text-xl font-semibold mb-4">5. Accordion with Actions</h2>
            <p className="text-gray-600 mb-4">
              Expand panels to interact with elements inside (checkboxes, buttons, inputs).
            </p>

            <div className="space-y-2">
              {actionAccordionItems.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleActionAccordion(item.id)}
                    className={`w-full flex items-center justify-between p-4 text-left transition-colors ${
                      openActionAccordion === item.id
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <span className="font-medium">{item.title}</span>
                    <ChevronIcon isOpen={openActionAccordion === item.id} />
                  </button>
                  {openActionAccordion === item.id && (
                    <div className="p-4 bg-white border-t border-gray-200">
                      {/* Checkbox actions */}
                      {item.actions && (
                        <div className="space-y-2">
                          {item.actions.map((action) => (
                            <label key={action.id} className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={newsletterPrefs.has(action.id)}
                                onChange={() => toggleNewsletterPref(action.id)}
                                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                              />
                              <span className="text-gray-700">{action.label}</span>
                            </label>
                          ))}
                          <p className="text-sm text-gray-500 mt-2">
                            Selected: {newsletterPrefs.size > 0 ? Array.from(newsletterPrefs).join(", ") : "None"}
                          </p>
                        </div>
                      )}

                      {/* Button actions */}
                      {item.buttons && (
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {item.buttons.map((btn) => (
                              <button
                                key={btn.id}
                                onClick={() => handleActionButton(btn.label)}
                                className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                                  btn.color === "blue"
                                    ? "bg-blue-600 text-white hover:bg-blue-700"
                                    : btn.color === "red"
                                    ? "bg-red-600 text-white hover:bg-red-700"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                              >
                                {btn.label}
                              </button>
                            ))}
                          </div>
                          {actionLog.length > 0 && (
                            <div className="p-2 bg-gray-100 rounded text-sm">
                              <p className="font-medium mb-1">Action Log:</p>
                              {actionLog.slice(-3).map((log, i) => (
                                <p key={i} className="text-gray-600">{log}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Input action */}
                      {item.hasInput && (
                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-gray-700">{item.inputLabel}</label>
                          <textarea
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            placeholder={item.inputPlaceholder}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            rows={3}
                          />
                          <button
                            onClick={() => {
                              handleActionButton(`Feedback submitted: "${feedbackText.slice(0, 20)}..."`);
                              setFeedbackText("");
                            }}
                            disabled={!feedbackText.trim()}
                            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                          >
                            Submit Feedback
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Section 6: Mixed Challenge */}
          <section>
            <h2 className="text-xl font-semibold mb-4">6. Mixed Challenge (Tabs + Accordions)</h2>
            <p className="text-gray-600 mb-4">
              <strong>Ultimate Challenge:</strong> Find the authentication secret (AUTH-K3) and all three SDK example codes.
            </p>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Tab headers */}
              <div className="flex border-b border-gray-200">
                {mixedTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveMixedTab(tab.id);
                      setOpenMixedAccordion(null); // Reset accordion when switching tabs
                    }}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                      activeMixedTab === tab.id
                        ? "border-b-2 border-purple-600 text-purple-600 bg-purple-50"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content with accordions */}
              <div className="p-4">
                {mixedTabs.map((tab) => (
                  <div key={tab.id} className={activeMixedTab === tab.id ? "block" : "hidden"}>
                    <div className="space-y-2">
                      {tab.accordions.map((acc) => (
                        <div key={acc.id} className="border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() => toggleMixedAccordion(acc.id)}
                            className={`w-full flex items-center justify-between p-3 text-left transition-colors ${
                              openMixedAccordion === acc.id
                                ? "bg-purple-50 text-purple-700"
                                : "bg-gray-50 hover:bg-gray-100"
                            }`}
                          >
                            <span className="font-medium text-sm">{acc.title}</span>
                            <ChevronIcon isOpen={openMixedAccordion === acc.id} />
                          </button>
                          {openMixedAccordion === acc.id && (
                            <div className="p-3 bg-white border-t border-gray-200">
                              <p className="text-gray-600 text-sm">{acc.content}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
