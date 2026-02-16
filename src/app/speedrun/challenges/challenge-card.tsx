import React from "react";

interface ChallengeCardProps {
  title: string;
  completed: boolean;
  children: React.ReactNode;
  checklist?: { text: string; completed: boolean }[];
  onComplete?: () => void;
  className?: string;
}

export function ChallengeCard({ title, completed, children, checklist = [], className = "" }: ChallengeCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow p-6 ${completed ? "ring-2 ring-green-500" : ""} ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {completed ? (
          <span className="inline-block px-3 py-1 bg-green-100 text-green-700 font-bold rounded-full text-sm">
            ✓ Complete
          </span>
        ) : (
          <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-700 font-bold rounded-full text-sm">
            In Progress
          </span>
        )}
      </div>
      <div className={completed ? "opacity-75 pointer-events-none" : ""}>{children}</div>

      {/* Checklist */}
      {checklist.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-600 mb-2">Tasks:</p>
          <ul className="space-y-1">
            {checklist.map((item, idx) => (
              <li key={idx} className="flex items-center text-xs text-gray-700">
                <span className={`inline-flex items-center justify-center w-4 h-4 rounded border mr-2 ${
                  item.completed
                    ? "bg-green-500 border-green-500 text-white"
                    : "border-gray-300"
                }`}>
                  {item.completed && "✓"}
                </span>
                <span className={item.completed ? "line-through text-gray-500" : ""}>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
