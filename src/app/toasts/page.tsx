"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type ToastType = "success" | "error" | "warning" | "info";
type DismissReason = "auto" | "manual" | "action";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  autoDismissMs?: number;
  actionLabel?: string;
  actionTextClassName?: string;
  countdownSeconds?: number;
  onAction?: (toast: Toast) => void;
}

interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
}

const TOAST_STYLE: Record<ToastType, string> = {
  success: "bg-green-50 border-green-300 text-green-900",
  error: "bg-red-50 border-red-300 text-red-900",
  warning: "bg-yellow-50 border-yellow-300 text-yellow-900",
  info: "bg-blue-50 border-blue-300 text-blue-900",
};

export default function ToastsPage() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const toastsRef = useRef<Toast[]>([]);
  const timeoutRefs = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );
  const intervalRefs = useRef<Map<string, ReturnType<typeof setInterval>>>(
    new Map()
  );

  useEffect(() => {
    toastsRef.current = toasts;
  }, [toasts]);

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

  const clearToastTimers = (toastId: string) => {
    const timeout = timeoutRefs.current.get(toastId);
    if (timeout) {
      clearTimeout(timeout);
      timeoutRefs.current.delete(toastId);
    }

    const interval = intervalRefs.current.get(toastId);
    if (interval) {
      clearInterval(interval);
      intervalRefs.current.delete(toastId);
    }
  };

  const dismissToast = (toastId: string, reason: DismissReason) => {
    const existingToast = toastsRef.current.find((toast) => toast.id === toastId);
    if (!existingToast) {
      return;
    }

    clearToastTimers(toastId);
    setToasts((prev) => prev.filter((toast) => toast.id !== toastId));

    const reasonText =
      reason === "auto"
        ? "auto-dismissed"
        : reason === "manual"
        ? "closed manually"
        : "closed from action";
    addLog(
      `${existingToast.type.toUpperCase()} toast "${existingToast.message}" ${reasonText}`
    );
  };

  const createToast = (toast: Omit<Toast, "id">) => {
    const nextToast: Toast = {
      ...toast,
      id: `${Date.now()}-${Math.random()}`,
    };
    setToasts((prev) => [...prev, nextToast]);
    addLog(`Spawned ${nextToast.type.toUpperCase()} toast "${nextToast.message}"`);
    return nextToast.id;
  };

  useEffect(() => {
    for (const toast of toasts) {
      if (toast.autoDismissMs && !timeoutRefs.current.has(toast.id)) {
        const timeoutId = setTimeout(() => {
          dismissToast(toast.id, "auto");
        }, toast.autoDismissMs);
        timeoutRefs.current.set(toast.id, timeoutId);
      }

      if (
        toast.countdownSeconds !== undefined &&
        !intervalRefs.current.has(toast.id)
      ) {
        const intervalId = setInterval(() => {
          setToasts((prev) =>
            prev.map((item) => {
              if (item.id !== toast.id || item.countdownSeconds === undefined) {
                return item;
              }
              return {
                ...item,
                countdownSeconds: Math.max(0, item.countdownSeconds - 1),
              };
            })
          );
        }, 1000);
        intervalRefs.current.set(toast.id, intervalId);
      }
    }

    for (const [toastId, timeout] of timeoutRefs.current.entries()) {
      if (!toasts.some((toast) => toast.id === toastId)) {
        clearTimeout(timeout);
        timeoutRefs.current.delete(toastId);
      }
    }

    for (const [toastId, interval] of intervalRefs.current.entries()) {
      if (!toasts.some((toast) => toast.id === toastId)) {
        clearInterval(interval);
        intervalRefs.current.delete(toastId);
      }
    }
  }, [toasts]);

  useEffect(() => {
    return () => {
      for (const timeoutId of timeoutRefs.current.values()) {
        clearTimeout(timeoutId);
      }
      for (const intervalId of intervalRefs.current.values()) {
        clearInterval(intervalId);
      }
      timeoutRefs.current.clear();
      intervalRefs.current.clear();
    };
  }, []);

  const triggerTypeToast = (type: ToastType) => {
    createToast({
      type,
      message: `${type.toUpperCase()} toast fired`,
      autoDismissMs: 4000,
    });
  };

  const triggerActionToast = () => {
    createToast({
      type: "info",
      message: "Item archived. Undo?",
      autoDismissMs: 4000,
      actionLabel: "Undo",
      onAction: (toast) => {
        addLog(`Undo clicked for "${toast.message}" before timeout`);
        dismissToast(toast.id, "action");
      },
    });
  };

  const triggerStackedToasts = () => {
    const stacked = [
      { type: "success" as const, message: "Sync finished successfully" },
      { type: "warning" as const, message: "Disk usage is above 85%" },
      { type: "error" as const, message: "Background job failed to retry" },
    ];

    for (const item of stacked) {
      createToast({
        ...item,
        autoDismissMs: 4200,
      });
    }
  };

  const triggerPersistentToast = () => {
    createToast({
      type: "warning",
      message: "Persistent warning. Close with X.",
    });
  };

  const triggerCountdownToast = () => {
    createToast({
      type: "error",
      message: "Deploy in progress. Cancel before 0.",
      autoDismissMs: 5000,
      countdownSeconds: 5,
      actionLabel: "Cancel",
      actionTextClassName: "text-red-700 hover:text-red-900",
      onAction: (toast) => {
        const remaining = toast.countdownSeconds ?? 0;
        addLog(`Countdown cancelled with ${remaining}s remaining`);
        dismissToast(toast.id, "action");
      },
    });
  };

  return (
    <div className="font-sans min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8">Toasts Demo</h1>

        <div className="grid gap-6">
          <section className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">Trigger Toasts by Type</h2>
            <p className="text-sm text-gray-600 mb-4">
              Each toast auto-dismisses in about 4 seconds.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => triggerTypeToast("success")}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Success
              </button>
              <button
                onClick={() => triggerTypeToast("error")}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Error
              </button>
              <button
                onClick={() => triggerTypeToast("warning")}
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
              >
                Warning
              </button>
              <button
                onClick={() => triggerTypeToast("info")}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Info
              </button>
            </div>
          </section>

          <section className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">Toast with Action Button</h2>
            <p className="text-sm text-gray-600 mb-4">
              Click Undo before it auto-dismisses to confirm the action flow.
            </p>
            <button
              onClick={triggerActionToast}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Trigger Undo Toast
            </button>
          </section>

          <section className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">Stacked Toasts</h2>
            <p className="text-sm text-gray-600 mb-4">
              Spawn a burst of multiple toasts; dismiss any one manually with X.
            </p>
            <button
              onClick={triggerStackedToasts}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Spam Toasts
            </button>
          </section>

          <section className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">Persistent Toast</h2>
            <p className="text-sm text-gray-600 mb-4">
              This toast stays on screen until you close it via X.
            </p>
            <button
              onClick={triggerPersistentToast}
              className="px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-800"
            >
              Trigger Persistent Toast
            </button>
          </section>

          <section className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">Toast with Countdown</h2>
            <p className="text-sm text-gray-600 mb-4">
              Starts at 5 seconds. Click Cancel before it reaches zero.
            </p>
            <button
              onClick={triggerCountdownToast}
              className="px-4 py-2 bg-rose-700 text-white rounded hover:bg-rose-800"
            >
              Trigger Countdown Toast
            </button>
          </section>

          <section className="bg-gray-50 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Activity Log</h2>
              {logs.length > 0 && (
                <button
                  onClick={() => setLogs([])}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Clear Logs
                </button>
              )}
            </div>
            {logs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No toast activity yet. Trigger a toast above.
              </p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {[...logs].reverse().map((log) => (
                  <div key={log.id} className="p-3 bg-white border rounded">
                    <span className="text-sm text-gray-500 font-mono">
                      [{log.timestamp}]
                    </span>
                    <p className="text-gray-900 mt-1">{log.message}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <div className="fixed bottom-6 right-6 z-50 w-[min(24rem,calc(100vw-2rem))] space-y-3 pointer-events-none">
        {[...toasts].reverse().map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto border rounded-lg shadow-lg p-4 ${TOAST_STYLE[toast.type]}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="font-semibold">{toast.type.toUpperCase()}</p>
                <p className="text-sm mt-1">{toast.message}</p>
                {toast.countdownSeconds !== undefined && (
                  <p className="text-xs mt-2 font-mono">
                    Countdown: {toast.countdownSeconds}
                  </p>
                )}
                {toast.actionLabel && (
                  <button
                    onClick={() => toast.onAction?.(toast)}
                    className={`text-sm font-semibold mt-2 underline ${
                      toast.actionTextClassName ?? "text-blue-700 hover:text-blue-900"
                    }`}
                  >
                    {toast.actionLabel}
                  </button>
                )}
              </div>
              <button
                onClick={() => dismissToast(toast.id, "manual")}
                aria-label={`Dismiss ${toast.message}`}
                className="text-lg leading-none text-gray-600 hover:text-gray-900"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
