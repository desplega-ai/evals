"use client";

import Link from "next/link";
import { useState } from "react";

interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: "alert" | "confirm" | "prompt";
}

export default function DialogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = (message: string, type: "alert" | "confirm" | "prompt") => {
    const newLog: LogEntry = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    };
    setLogs(prev => [...prev, newLog]);
  };

  const handleAlert = () => {
    alert("This is an alert dialog!");
    addLog("User dismissed the alert", "alert");
  };

  const handleConfirm = () => {
    const result = confirm("Do you confirm this action?");
    if (result) {
      addLog("User accepted the confirm", "confirm");
    } else {
      addLog("User cancelled the confirm", "confirm");
    }
  };

  const handlePrompt = () => {
    const result = prompt("Please enter your name:");
    if (result !== null) {
      if (result === "") {
        addLog("User entered an empty string", "prompt");
      } else {
        addLog(`User entered: ${result}`, "prompt");
      }
    } else {
      addLog("User cancelled the prompt", "prompt");
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="font-sans min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/"
            className="text-blue-600 hover:underline"
          >
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8">Browser Dialogs Demo</h1>

        <div className="grid gap-6">
          {/* Dialog Buttons */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Native Browser Dialogs</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={handleAlert}
                className="px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Show Alert
              </button>

              <button
                onClick={handleConfirm}
                className="px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Show Confirm
              </button>

              <button
                onClick={handlePrompt}
                className="px-6 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                Show Prompt
              </button>
            </div>
          </div>

          {/* Dialog Logs */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Dialog Activity Log</h2>
              {logs.length > 0 && (
                <button
                  onClick={clearLogs}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Clear Logs
                </button>
              )}
            </div>

            {logs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No dialog interactions yet. Click a button above to trigger a dialog.
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-3 rounded border-l-4 ${
                      log.type === "alert"
                        ? "bg-blue-50 border-blue-500"
                        : log.type === "confirm"
                        ? "bg-green-50 border-green-500"
                        : "bg-purple-50 border-purple-500"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <span className="text-sm text-gray-500 font-mono">
                          [{log.timestamp}]
                        </span>
                        <span
                          className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded ${
                            log.type === "alert"
                              ? "bg-blue-200 text-blue-800"
                              : log.type === "confirm"
                              ? "bg-green-200 text-green-800"
                              : "bg-purple-200 text-purple-800"
                          }`}
                        >
                          {log.type.toUpperCase()}
                        </span>
                        <p className="mt-1 text-gray-900">{log.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
