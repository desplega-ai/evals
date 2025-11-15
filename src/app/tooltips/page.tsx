"use client";

import Link from "next/link";
import { useState } from "react";

interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: "tooltip" | "popover";
}

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

interface PopoverProps {
  trigger: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  children: React.ReactNode;
}

const Tooltip = ({ text, children, position = "top" }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => {
          setIsVisible(true);
        }}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>

      {isVisible && (
        <div
          className={`absolute z-10 px-3 py-2 bg-gray-900 text-white text-sm rounded whitespace-nowrap pointer-events-none ${
            position === "top"
              ? "bottom-full left-1/2 -translate-x-1/2 mb-2"
              : position === "bottom"
              ? "top-full left-1/2 -translate-x-1/2 mt-2"
              : position === "left"
              ? "right-full top-1/2 -translate-y-1/2 mr-2"
              : "left-full top-1/2 -translate-y-1/2 ml-2"
          }`}
        >
          {text}
          <div
            className={`absolute bg-gray-900 w-2 h-2 ${
              position === "top"
                ? "top-full left-1/2 -translate-x-1/2 -mt-1"
                : position === "bottom"
                ? "bottom-full left-1/2 -translate-x-1/2 -mb-1"
                : position === "left"
                ? "left-full top-1/2 -translate-y-1/2 -ml-1"
                : "right-full top-1/2 -translate-y-1/2 -mr-1"
            }`}
            style={{
              clipPath:
                position === "top"
                  ? "polygon(50% 0%, 0% 100%, 100% 100%)"
                  : position === "bottom"
                  ? "polygon(0% 0%, 50% 100%, 100% 0%)"
                  : position === "left"
                  ? "polygon(100% 0%, 100% 100%, 0% 50%)"
                  : "polygon(0% 0%, 0% 100%, 100% 50%)",
            }}
          />
        </div>
      )}
    </div>
  );
};

const Popover = ({ trigger, position = "bottom", children }: PopoverProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-20"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={`absolute z-30 bg-white border border-gray-300 rounded-lg shadow-lg p-4 min-w-max ${
              position === "top"
                ? "bottom-full left-1/2 -translate-x-1/2 mb-2"
                : position === "bottom"
                ? "top-full left-1/2 -translate-x-1/2 mt-2"
                : position === "left"
                ? "right-full top-1/2 -translate-y-1/2 mr-2"
                : "left-full top-1/2 -translate-y-1/2 ml-2"
            }`}
          >
            {children}
          </div>
        </>
      )}
    </div>
  );
};

export default function TooltipsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = (message: string, type: "tooltip" | "popover") => {
    const newLog: LogEntry = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date().toLocaleTimeString(),
      message,
      type,
    };
    setLogs((prev) => [...prev, newLog]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="font-sans min-h-screen p-8">
      <main className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8">Tooltips & Popovers Demo</h1>

        <div className="grid gap-8">
          {/* Tooltips Section */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-6">Tooltips</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Top Tooltip */}
              <div className="flex flex-col items-center justify-center p-8 bg-white border border-gray-300 rounded">
                <Tooltip text="This is a top tooltip" position="top">
                  <button
                    onMouseEnter={() => addLog("Hovered top tooltip button", "tooltip")}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Hover for Top Tooltip
                  </button>
                </Tooltip>
              </div>

              {/* Bottom Tooltip */}
              <div className="flex flex-col items-center justify-center p-8 bg-white border border-gray-300 rounded">
                <Tooltip text="This is a bottom tooltip" position="bottom">
                  <button
                    onMouseEnter={() =>
                      addLog("Hovered bottom tooltip button", "tooltip")
                    }
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    Hover for Bottom Tooltip
                  </button>
                </Tooltip>
              </div>

              {/* Left Tooltip */}
              <div className="flex flex-col items-center justify-center p-8 bg-white border border-gray-300 rounded">
                <Tooltip text="This is a left tooltip" position="left">
                  <button
                    onMouseEnter={() => addLog("Hovered left tooltip button", "tooltip")}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                  >
                    Hover for Left Tooltip
                  </button>
                </Tooltip>
              </div>

              {/* Right Tooltip */}
              <div className="flex flex-col items-center justify-center p-8 bg-white border border-gray-300 rounded">
                <Tooltip text="This is a right tooltip" position="right">
                  <button
                    onMouseEnter={() =>
                      addLog("Hovered right tooltip button", "tooltip")
                    }
                    className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
                  >
                    Hover for Right Tooltip
                  </button>
                </Tooltip>
              </div>

              {/* Tooltip on Icon */}
              <div className="flex flex-col items-center justify-center p-8 bg-white border border-gray-300 rounded">
                <Tooltip text="This is information about this feature" position="top">
                  <button
                    onMouseEnter={() => addLog("Hovered info icon", "tooltip")}
                    className="w-10 h-10 flex items-center justify-center bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors font-bold text-lg"
                  >
                    ?
                  </button>
                </Tooltip>
              </div>

              {/* Tooltip on Link */}
              <div className="flex flex-col items-center justify-center p-8 bg-white border border-gray-300 rounded">
                <Tooltip
                  text="Click to open documentation"
                  position="bottom"
                >
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      addLog("Clicked documentation link", "tooltip");
                    }}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Documentation
                  </a>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* Popovers Section */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-6">Popovers with Actions</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Basic Popover */}
              <div className="flex flex-col items-center justify-center p-8 bg-white border border-gray-300 rounded">
                <Popover
                  trigger={
                    <button
                      onClick={() => addLog("Opened basic popover", "popover")}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                      Click for Popover
                    </button>
                  }
                  position="bottom"
                >
                  <div className="space-y-3">
                    <p className="font-medium text-gray-900">
                      Popover Content
                    </p>
                    <p className="text-sm text-gray-600">
                      This is a popover with some additional information.
                    </p>
                    <button
                      onClick={() => {
                        addLog("Clicked action button in popover", "popover");
                      }}
                      className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      Action
                    </button>
                  </div>
                </Popover>
              </div>

              {/* Popover with Multiple Actions */}
              <div className="flex flex-col items-center justify-center p-8 bg-white border border-gray-300 rounded">
                <Popover
                  trigger={
                    <button
                      onClick={() =>
                        addLog("Opened multi-action popover", "popover")
                      }
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors cursor-pointer"
                    >
                      More Options
                    </button>
                  }
                  position="bottom"
                >
                  <div className="space-y-2">
                    <p className="font-medium text-gray-900">Choose Action</p>
                    <button
                      onClick={() => {
                        addLog("Clicked Edit action", "popover");
                      }}
                      className="w-full px-3 py-2 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200 transition-colors text-left"
                    >
                      ✎ Edit
                    </button>
                    <button
                      onClick={() => {
                        addLog("Clicked Delete action", "popover");
                      }}
                      className="w-full px-3 py-2 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 transition-colors text-left"
                    >
                      🗑 Delete
                    </button>
                    <button
                      onClick={() => {
                        addLog("Clicked Share action", "popover");
                      }}
                      className="w-full px-3 py-2 bg-green-100 text-green-700 text-sm rounded hover:bg-green-200 transition-colors text-left"
                    >
                      ↗ Share
                    </button>
                  </div>
                </Popover>
              </div>

              {/* Popover with Input */}
              <div className="flex flex-col items-center justify-center p-8 bg-white border border-gray-300 rounded">
                <Popover
                  trigger={
                    <button
                      onClick={() =>
                        addLog("Opened input popover", "popover")
                      }
                      className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors cursor-pointer"
                    >
                      Enter Value
                    </button>
                  }
                  position="bottom"
                >
                  <div className="space-y-3 w-48">
                    <p className="font-medium text-gray-900">Enter Name</p>
                    <input
                      type="text"
                      placeholder="Your name..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const value = (e.target as HTMLInputElement).value;
                          addLog(
                            `Submitted name: ${value || "(empty)"}`,
                            "popover"
                          );
                          (e.target as HTMLInputElement).value = "";
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      onClick={(e) => {
                        const input = (
                          e.currentTarget.parentElement?.querySelector(
                            "input"
                          ) as HTMLInputElement
                        )?.value;
                        addLog(
                          `Submitted name: ${input || "(empty)"}`,
                          "popover"
                        );
                      }}
                      className="w-full px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
                    >
                      Submit
                    </button>
                  </div>
                </Popover>
              </div>

              {/* Popover on Icon */}
              <div className="flex flex-col items-center justify-center p-8 bg-white border border-gray-300 rounded">
                <Popover
                  trigger={
                    <button
                      onClick={() =>
                        addLog("Opened help popover", "popover")
                      }
                      className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors font-bold text-lg cursor-pointer"
                    >
                      ?
                    </button>
                  }
                  position="right"
                >
                  <div className="space-y-2">
                    <p className="font-medium text-gray-900">Need Help?</p>
                    <p className="text-sm text-gray-600 max-w-xs">
                      Click this button to view helpful information about this
                      feature.
                    </p>
                    <button
                      onClick={() => {
                        addLog("Clicked Learn More button", "popover");
                      }}
                      className="text-blue-600 text-sm hover:underline font-medium"
                    >
                      Learn More →
                    </button>
                  </div>
                </Popover>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Activity Log</h2>
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
                No interactions yet. Hover over tooltips or click on popovers to log events.
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {[...logs].reverse().map((log) => (
                  <div
                    key={log.id}
                    className={`p-3 rounded border-l-4 ${
                      log.type === "tooltip"
                        ? "bg-blue-50 border-blue-500"
                        : "bg-green-50 border-green-500"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <span className="text-sm text-gray-500 font-mono">
                          [{log.timestamp}]
                        </span>
                        <span
                          className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded ${
                            log.type === "tooltip"
                              ? "bg-blue-200 text-blue-800"
                              : "bg-green-200 text-green-800"
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
