"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

type PopupKind =
  | "cookie"
  | "newsletter"
  | "exitIntent"
  | "promo"
  | "multiStep";

interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
}

const POPUP_LABEL: Record<PopupKind, string> = {
  cookie: "Cookie banner",
  newsletter: "Newsletter modal",
  exitIntent: "Exit-intent overlay",
  promo: "Promo bar",
  multiStep: "Multi-step confirmation",
};

const SLUG_TO_KIND: Record<string, PopupKind> = {
  cookie: "cookie",
  newsletter: "newsletter",
  "exit-intent": "exitIntent",
  promo: "promo",
  "multi-step": "multiStep",
};

const MULTI_STEP_TOTAL = 3;
const MULTI_STEP_CONFIRM_WORD = "DELETE";

function PopupsContent() {
  const [open, setOpen] = useState<Set<PopupKind>>(new Set());
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [email, setEmail] = useState("");
  const [multiStepCurrent, setMultiStepCurrent] = useState(1);
  const [confirmText, setConfirmText] = useState("");
  const searchParams = useSearchParams();
  const autoOpenedRef = useRef(false);

  const addLog = (message: string) => {
    setLogs((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        timestamp: new Date().toLocaleTimeString(),
        message,
      },
    ]);
  };

  const resetMultiStep = () => {
    setMultiStepCurrent(1);
    setConfirmText("");
  };

  const showPopup = (kind: PopupKind) => {
    if (kind === "multiStep") {
      resetMultiStep();
    }
    setOpen((prev) => {
      if (prev.has(kind)) return prev;
      const next = new Set(prev);
      next.add(kind);
      return next;
    });
    addLog(`Shown: ${POPUP_LABEL[kind]}`);
  };

  const dismissPopup = (kind: PopupKind, reason: string) => {
    setOpen((prev) => {
      if (!prev.has(kind)) return prev;
      const next = new Set(prev);
      next.delete(kind);
      return next;
    });
    addLog(`Dismissed: ${POPUP_LABEL[kind]} (${reason})`);
    if (kind === "multiStep") {
      resetMultiStep();
    }
  };

  const goToMultiStep = (target: number, reason: string) => {
    setMultiStepCurrent(target);
    addLog(`Multi-step: step ${target}/${MULTI_STEP_TOTAL} (${reason})`);
  };

  const isOpen = (kind: PopupKind) => open.has(kind);

  useEffect(() => {
    if (autoOpenedRef.current) return;
    const slug = searchParams.get("open");
    if (!slug) return;
    const kind = SLUG_TO_KIND[slug];
    if (!kind) return;
    autoOpenedRef.current = true;
    showPopup(kind);
  }, [searchParams]);

  return (
    <div className="font-sans min-h-screen p-8">
      <main className="max-w-6xl mx-auto">
        <Link href="/" className="text-blue-600 hover:underline">
          ← Back to Home
        </Link>

        <h1 className="text-3xl font-bold mt-4 mb-8">Pop-ups Demo</h1>

        {isOpen("promo") && (
          <div
            data-testid="popup-promo"
            className="sticky top-0 z-30 bg-orange-600 text-white px-4 py-2 mb-6 flex items-center justify-between rounded shadow"
          >
            <div className="flex items-center gap-3">
              <span className="font-semibold">🎉 Limited time:</span>
              <span>Save 20% on annual plans this week only.</span>
              <a
                href="#"
                data-testid="promo-cta"
                onClick={(e) => {
                  e.preventDefault();
                  dismissPopup("promo", "cta");
                }}
                className="underline font-medium hover:text-orange-100"
              >
                Claim now →
              </a>
            </div>
            <button
              type="button"
              data-testid="promo-close"
              onClick={() => dismissPopup("promo", "close-x")}
              aria-label="Close promo bar"
              className="text-white/90 hover:text-white text-xl leading-none px-2"
            >
              ×
            </button>
          </div>
        )}

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Triggers</h2>
          <p className="text-gray-600 mb-4">
            Click a button to show the corresponding pop-up. Multiple pop-ups can be open at once.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              data-testid="trigger-cookie"
              onClick={() => showPopup("cookie")}
              disabled={isOpen("cookie")}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Show cookie banner
            </button>
            <button
              type="button"
              data-testid="trigger-newsletter"
              onClick={() => showPopup("newsletter")}
              disabled={isOpen("newsletter")}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Show newsletter modal
            </button>
            <button
              type="button"
              data-testid="trigger-exit-intent"
              onClick={() => showPopup("exitIntent")}
              disabled={isOpen("exitIntent")}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Simulate exit-intent
            </button>
            <button
              type="button"
              data-testid="trigger-promo"
              onClick={() => showPopup("promo")}
              disabled={isOpen("promo")}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Show promo bar
            </button>
            <button
              type="button"
              data-testid="trigger-multi-step"
              onClick={() => showPopup("multiStep")}
              disabled={isOpen("multiStep")}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Show multi-step confirmation
            </button>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Activity log</h2>
            {logs.length > 0 && (
              <button
                type="button"
                data-testid="clear-log"
                onClick={() => setLogs([])}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Clear
              </button>
            )}
          </div>
          <div
            data-testid="popup-log"
            className="bg-gray-50 border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto"
          >
            {logs.length === 0 ? (
              <p className="text-gray-500 text-sm">No activity yet. Trigger a pop-up to get started.</p>
            ) : (
              <ul className="space-y-1 font-mono text-sm">
                {logs.map((entry) => (
                  <li key={entry.id} className="text-gray-800">
                    <span className="text-gray-500">[{entry.timestamp}]</span> {entry.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>

      {isOpen("cookie") && (
        <div
          data-testid="popup-cookie"
          className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-300 shadow-lg"
          role="dialog"
          aria-label="Cookie consent banner"
        >
          <div className="max-w-6xl mx-auto p-4 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">We use cookies</h3>
              <p className="text-sm text-gray-600">
                We use cookies to improve your experience, analyze traffic, and personalize content.
                Read our <a href="#" className="text-blue-600 hover:underline">cookie policy</a>.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                data-testid="cookie-reject"
                onClick={() => dismissPopup("cookie", "reject")}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition-colors"
              >
                Reject all
              </button>
              <button
                type="button"
                data-testid="cookie-customize"
                onClick={() => dismissPopup("cookie", "customize")}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition-colors"
              >
                Customize
              </button>
              <button
                type="button"
                data-testid="cookie-accept"
                onClick={() => dismissPopup("cookie", "accept")}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Accept all
              </button>
            </div>
          </div>
        </div>
      )}

      {isOpen("newsletter") && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => dismissPopup("newsletter", "backdrop")}
          data-testid="popup-newsletter-backdrop"
        >
          <div
            data-testid="popup-newsletter"
            className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full relative"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Newsletter signup"
          >
            <button
              type="button"
              data-testid="newsletter-close"
              onClick={() => dismissPopup("newsletter", "close-x")}
              aria-label="Close newsletter modal"
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl leading-none"
            >
              ×
            </button>
            <h3 className="text-xl font-semibold mb-2">Join our newsletter</h3>
            <p className="text-gray-600 mb-4">
              Get weekly updates on new features, tutorials, and product news.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                dismissPopup("newsletter", `subscribe:${email || "(empty)"}`);
                setEmail("");
              }}
              className="space-y-3"
            >
              <input
                type="email"
                data-testid="newsletter-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  data-testid="newsletter-dismiss"
                  onClick={() => dismissPopup("newsletter", "no-thanks")}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  No thanks
                </button>
                <button
                  type="submit"
                  data-testid="newsletter-subscribe"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isOpen("exitIntent") && (
        <div
          className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4"
          onClick={() => dismissPopup("exitIntent", "backdrop")}
          data-testid="popup-exit-intent-backdrop"
        >
          <div
            data-testid="popup-exit-intent"
            className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full relative"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Exit-intent offer"
          >
            <button
              type="button"
              data-testid="exit-intent-close"
              onClick={() => dismissPopup("exitIntent", "close-x")}
              aria-label="Close offer"
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl leading-none"
            >
              ×
            </button>
            <div className="text-center">
              <div className="text-4xl mb-3">👋</div>
              <h3 className="text-2xl font-bold mb-2">Wait! Before you go...</h3>
              <p className="text-gray-600 mb-6">
                Here&apos;s an exclusive <strong>30% discount</strong> on your first purchase.
                Use code <code className="bg-gray-100 px-2 py-1 rounded">STAY30</code> at checkout.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  type="button"
                  data-testid="exit-intent-dismiss"
                  onClick={() => dismissPopup("exitIntent", "dismiss")}
                  className="px-6 py-2 text-gray-600 hover:text-gray-900"
                >
                  No thanks
                </button>
                <button
                  type="button"
                  data-testid="exit-intent-claim"
                  onClick={() => dismissPopup("exitIntent", "claim")}
                  className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors font-semibold"
                >
                  Claim offer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isOpen("multiStep") && (
        <div
          className="fixed inset-0 z-[55] bg-black/60 flex items-center justify-center p-4"
          onClick={() => dismissPopup("multiStep", "backdrop")}
          data-testid="popup-multi-step-backdrop"
        >
          <div
            data-testid="popup-multi-step"
            data-step={multiStepCurrent}
            className="bg-white rounded-lg shadow-xl max-w-md w-full relative"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Multi-step confirmation"
          >
            <button
              type="button"
              data-testid="multi-step-close"
              onClick={() => dismissPopup("multiStep", "close-x")}
              aria-label="Close confirmation"
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl leading-none"
            >
              ×
            </button>

            <div
              data-testid="multi-step-indicator"
              className="px-6 pt-6 text-xs font-medium uppercase tracking-wide text-gray-500"
            >
              Step {multiStepCurrent} of {MULTI_STEP_TOTAL}
            </div>

            {multiStepCurrent === 1 && (
              <div data-testid="multi-step-panel-1" className="p-6">
                <h3 className="text-xl font-semibold mb-2">Delete your account?</h3>
                <p className="text-gray-600 mb-6">
                  This will permanently remove your profile, preferences, and all associated data.
                  You&apos;ll have a chance to confirm before anything is deleted.
                </p>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    data-testid="multi-step-cancel"
                    onClick={() => dismissPopup("multiStep", "cancel-step-1")}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    data-testid="multi-step-continue"
                    onClick={() => goToMultiStep(2, "continue")}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {multiStepCurrent === 2 && (
              <div data-testid="multi-step-panel-2" className="p-6">
                <h3 className="text-xl font-semibold mb-2">Confirm deletion</h3>
                <p className="text-gray-600 mb-4">
                  Type <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">{MULTI_STEP_CONFIRM_WORD}</code> to confirm.
                  This action cannot be undone.
                </p>
                <input
                  type="text"
                  data-testid="multi-step-confirm-input"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={MULTI_STEP_CONFIRM_WORD}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500 mb-4 font-mono"
                  autoFocus
                />
                <div className="flex gap-2 justify-between">
                  <button
                    type="button"
                    data-testid="multi-step-back"
                    onClick={() => goToMultiStep(1, "back")}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900"
                  >
                    ← Back
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      data-testid="multi-step-cancel"
                      onClick={() => dismissPopup("multiStep", "cancel-step-2")}
                      className="px-4 py-2 text-gray-600 hover:text-gray-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      data-testid="multi-step-confirm"
                      onClick={() => goToMultiStep(3, "confirm")}
                      disabled={confirmText !== MULTI_STEP_CONFIRM_WORD}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Delete account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {multiStepCurrent === 3 && (
              <div data-testid="multi-step-panel-3" className="p-6 text-center">
                <div className="text-4xl mb-3">✓</div>
                <h3 className="text-xl font-semibold mb-2">Account deleted</h3>
                <p className="text-gray-600 mb-6">
                  Your account and all associated data have been permanently removed.
                </p>
                <button
                  type="button"
                  data-testid="multi-step-done"
                  onClick={() => dismissPopup("multiStep", "done")}
                  className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PopupsPage() {
  return (
    <Suspense fallback={null}>
      <PopupsContent />
    </Suspense>
  );
}
