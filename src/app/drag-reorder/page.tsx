"use client";

import Link from "next/link";
import { useState, useRef, useCallback } from "react";

// --- Data ---

const initialPlaylist = [
  { id: "song1", title: "Bohemian Rhapsody", artist: "Queen", duration: "5:55" },
  { id: "song2", title: "Stairway to Heaven", artist: "Led Zeppelin", duration: "8:02" },
  { id: "song3", title: "Hotel California", artist: "Eagles", duration: "6:30" },
  { id: "song4", title: "Comfortably Numb", artist: "Pink Floyd", duration: "6:23" },
  { id: "song5", title: "Sweet Child O' Mine", artist: "Guns N' Roses", duration: "5:56" },
];

const initialTodo = [
  { id: "todo1", text: "Buy groceries", priority: "high" },
  { id: "todo2", text: "Walk the dog", priority: "medium" },
  { id: "todo3", text: "Reply to emails", priority: "low" },
  { id: "todo4", text: "Fix the bug in prod", priority: "high" },
  { id: "todo5", text: "Schedule dentist appointment", priority: "medium" },
  { id: "todo6", text: "Read a chapter of the book", priority: "low" },
];

const initialKanban = {
  backlog: [
    { id: "k1", title: "Design homepage", tag: "design" },
    { id: "k2", title: "Write API docs", tag: "docs" },
  ],
  inProgress: [
    { id: "k3", title: "Implement auth", tag: "backend" },
    { id: "k4", title: "Build dashboard", tag: "frontend" },
  ],
  done: [
    { id: "k5", title: "Setup CI/CD", tag: "devops" },
  ],
};

const initialNumberList = [5, 2, 8, 1, 9, 3, 7, 4, 6, 10];

// --- Drag Handle Icon ---
function DragHandle() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="text-gray-400">
      <circle cx="5" cy="3" r="1.5" />
      <circle cx="11" cy="3" r="1.5" />
      <circle cx="5" cy="8" r="1.5" />
      <circle cx="11" cy="8" r="1.5" />
      <circle cx="5" cy="13" r="1.5" />
      <circle cx="11" cy="13" r="1.5" />
    </svg>
  );
}

// --- Reusable Drag List Hook ---
function useDragReorder<T>(initialItems: T[]) {
  const [items, setItems] = useState(initialItems);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }
    const newItems = [...items];
    const [removed] = newItems.splice(dragIndex, 1);
    newItems.splice(index, 0, removed);
    setItems(newItems);
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  return { items, setItems, dragIndex, overIndex, handleDragStart, handleDragOver, handleDrop, handleDragEnd };
}

export default function DragReorderPage() {
  // Section 1: Basic playlist reorder
  const playlist = useDragReorder(initialPlaylist);

  // Section 2: Todo priority reorder
  const todo = useDragReorder(initialTodo);

  // Section 3: Kanban board
  const [kanban, setKanban] = useState(initialKanban);
  const [kanbanDrag, setKanbanDrag] = useState<{ id: string; sourceCol: string } | null>(null);
  const [kanbanOverCol, setKanbanOverCol] = useState<string | null>(null);

  // Section 4: Sort the numbers challenge
  const numbers = useDragReorder(initialNumberList);
  const [sortChecked, setSortChecked] = useState(false);
  const isSorted = numbers.items.every((n, i) => i === 0 || numbers.items[i - 1] <= n);

  // Section 5: Move up/down buttons (no drag, button-based reorder)
  const [buttonList, setButtonList] = useState(["Alpha", "Bravo", "Charlie", "Delta", "Echo"]);

  const moveItem = (index: number, direction: "up" | "down") => {
    const newList = [...buttonList];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newList.length) return;
    [newList[index], newList[targetIndex]] = [newList[targetIndex], newList[index]];
    setButtonList(newList);
  };

  // Kanban handlers
  const handleKanbanDragStart = (id: string, sourceCol: string) => {
    setKanbanDrag({ id, sourceCol });
  };

  const handleKanbanDragOver = (e: React.DragEvent, col: string) => {
    e.preventDefault();
    setKanbanOverCol(col);
  };

  const handleKanbanDrop = (targetCol: string) => {
    if (!kanbanDrag) return;
    const { id, sourceCol } = kanbanDrag;
    if (sourceCol === targetCol) {
      setKanbanDrag(null);
      setKanbanOverCol(null);
      return;
    }
    const newKanban = { ...kanban };
    const sourceKey = sourceCol as keyof typeof kanban;
    const targetKey = targetCol as keyof typeof kanban;
    const item = newKanban[sourceKey].find((i) => i.id === id);
    if (!item) return;
    newKanban[sourceKey] = newKanban[sourceKey].filter((i) => i.id !== id);
    newKanban[targetKey] = [...newKanban[targetKey], item];
    setKanban(newKanban);
    setKanbanDrag(null);
    setKanbanOverCol(null);
  };

  const priorityColor: Record<string, string> = {
    high: "bg-red-100 text-red-700 border-red-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    low: "bg-green-100 text-green-700 border-green-200",
  };

  const tagColor: Record<string, string> = {
    design: "bg-purple-100 text-purple-700",
    docs: "bg-blue-100 text-blue-700",
    backend: "bg-green-100 text-green-700",
    frontend: "bg-orange-100 text-orange-700",
    devops: "bg-gray-100 text-gray-700",
  };

  const columnLabels: Record<string, string> = {
    backlog: "Backlog",
    inProgress: "In Progress",
    done: "Done",
  };

  return (
    <div className="font-sans min-h-screen p-8">
      <main className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:underline">
            &larr; Back to Home
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-2">Drag-to-Reorder Demo</h1>
        <p className="text-gray-600 mb-8">
          Test drag-and-drop list reordering, cross-column moves, and button-based reordering.
        </p>

        <div className="space-y-12">
          {/* Section 1: Playlist Reorder */}
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Playlist Reorder</h2>
            <p className="text-gray-600 mb-4">Drag songs to rearrange the playlist order.</p>

            <div className="border border-gray-200 rounded-lg overflow-hidden max-w-lg">
              {playlist.items.map((song, index) => (
                <div
                  key={song.id}
                  draggable
                  onDragStart={() => playlist.handleDragStart(index)}
                  onDragOver={(e) => playlist.handleDragOver(e, index)}
                  onDrop={() => playlist.handleDrop(index)}
                  onDragEnd={playlist.handleDragEnd}
                  data-testid={`playlist-item-${index}`}
                  className={`flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0 cursor-grab active:cursor-grabbing transition-colors ${
                    playlist.dragIndex === index
                      ? "opacity-50 bg-blue-50"
                      : playlist.overIndex === index
                      ? "bg-blue-100 border-t-2 border-t-blue-400"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <DragHandle />
                  <span className="text-sm text-gray-400 min-w-[24px]">{index + 1}.</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{song.title}</p>
                    <p className="text-sm text-gray-500">{song.artist}</p>
                  </div>
                  <span className="text-sm text-gray-400 font-mono">{song.duration}</span>
                </div>
              ))}
            </div>

            <div className="mt-3 text-sm text-gray-500">
              Current order: {playlist.items.map((s) => s.title.split(" ")[0]).join(", ")}
            </div>
          </section>

          {/* Section 2: Todo Priority Reorder */}
          <section>
            <h2 className="text-xl font-semibold mb-2">2. Todo Priority Reorder</h2>
            <p className="text-gray-600 mb-4">
              <strong>Challenge:</strong> Reorder todos so all &quot;high&quot; priority items are at the top, followed by &quot;medium&quot;, then &quot;low&quot;.
            </p>

            <div className="max-w-lg space-y-2">
              {todo.items.map((item, index) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => todo.handleDragStart(index)}
                  onDragOver={(e) => todo.handleDragOver(e, index)}
                  onDrop={() => todo.handleDrop(index)}
                  onDragEnd={todo.handleDragEnd}
                  data-testid={`todo-item-${index}`}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-grab active:cursor-grabbing transition-colors ${
                    todo.dragIndex === index
                      ? "opacity-50 bg-gray-100 border-gray-300"
                      : todo.overIndex === index
                      ? "bg-blue-50 border-blue-300"
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <DragHandle />
                  <span className="flex-1 text-gray-900">{item.text}</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded border ${priorityColor[item.priority]}`}>
                    {item.priority}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-3 text-sm">
              {todo.items.every((item, i) => {
                const order = { high: 0, medium: 1, low: 2 };
                return i === 0 || order[item.priority as keyof typeof order] >= order[todo.items[i - 1].priority as keyof typeof order];
              }) ? (
                <span className="text-green-600 font-medium">Correctly sorted by priority!</span>
              ) : (
                <span className="text-gray-500">Not yet sorted by priority.</span>
              )}
            </div>
          </section>

          {/* Section 3: Kanban Board */}
          <section>
            <h2 className="text-xl font-semibold mb-2">3. Kanban Board (Cross-Column Drag)</h2>
            <p className="text-gray-600 mb-4">
              <strong>Challenge:</strong> Move &quot;Design homepage&quot; from Backlog to Done, and &quot;Build dashboard&quot; from In Progress to Done.
            </p>

            <div className="grid grid-cols-3 gap-4">
              {(["backlog", "inProgress", "done"] as const).map((col) => (
                <div
                  key={col}
                  onDragOver={(e) => handleKanbanDragOver(e, col)}
                  onDrop={() => handleKanbanDrop(col)}
                  className={`rounded-lg border-2 p-3 min-h-[200px] transition-colors ${
                    kanbanOverCol === col
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                    {columnLabels[col]}
                    <span className="ml-2 text-gray-400 font-normal">({kanban[col].length})</span>
                  </h3>
                  <div className="space-y-2">
                    {kanban[col].map((item) => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={() => handleKanbanDragStart(item.id, col)}
                        data-testid={`kanban-${item.id}`}
                        className={`bg-white p-3 rounded border border-gray-200 cursor-grab active:cursor-grabbing shadow-sm hover:shadow transition-shadow ${
                          kanbanDrag?.id === item.id ? "opacity-50" : ""
                        }`}
                      >
                        <p className="text-sm font-medium text-gray-900">{item.title}</p>
                        <span className={`inline-block text-xs px-2 py-0.5 rounded mt-1 ${tagColor[item.tag]}`}>
                          {item.tag}
                        </span>
                      </div>
                    ))}
                    {kanban[col].length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-8">Drop items here</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 4: Sort the Numbers */}
          <section>
            <h2 className="text-xl font-semibold mb-2">4. Sort the Numbers (Ascending)</h2>
            <p className="text-gray-600 mb-4">
              <strong>Challenge:</strong> Drag the numbers into ascending order (1 through 10).
            </p>

            <div className="flex flex-wrap gap-2 max-w-lg">
              {numbers.items.map((num, index) => (
                <div
                  key={`num-${num}-${index}`}
                  draggable
                  onDragStart={() => numbers.handleDragStart(index)}
                  onDragOver={(e) => numbers.handleDragOver(e, index)}
                  onDrop={() => numbers.handleDrop(index)}
                  onDragEnd={numbers.handleDragEnd}
                  data-testid={`number-item-${index}`}
                  className={`w-12 h-12 flex items-center justify-center rounded-lg border-2 font-bold text-lg cursor-grab active:cursor-grabbing transition-all ${
                    numbers.dragIndex === index
                      ? "opacity-50 border-blue-400 bg-blue-100"
                      : numbers.overIndex === index
                      ? "border-blue-500 bg-blue-50 scale-110"
                      : "border-gray-300 bg-white hover:border-gray-400"
                  }`}
                >
                  {num}
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={() => setSortChecked(true)}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
              >
                Check Order
              </button>
              <button
                onClick={() => {
                  numbers.setItems([...initialNumberList]);
                  setSortChecked(false);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded hover:bg-gray-300 transition-colors"
              >
                Reset
              </button>
              {sortChecked && (
                <span className={`text-sm font-medium ${isSorted ? "text-green-600" : "text-red-600"}`}>
                  {isSorted ? "Correctly sorted! 1-10 in ascending order." : "Not in correct order yet. Keep trying!"}
                </span>
              )}
            </div>
          </section>

          {/* Section 5: Button-Based Reorder */}
          <section>
            <h2 className="text-xl font-semibold mb-2">5. Button-Based Reorder (No Drag)</h2>
            <p className="text-gray-600 mb-4">
              <strong>Challenge:</strong> Use the up/down buttons to reverse the list order (Echo, Delta, Charlie, Bravo, Alpha).
            </p>

            <div className="max-w-sm space-y-2">
              {buttonList.map((item, index) => (
                <div
                  key={item}
                  className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-lg"
                  data-testid={`button-item-${index}`}
                >
                  <span className="text-sm text-gray-400 min-w-[24px]">{index + 1}.</span>
                  <span className="flex-1 font-medium text-gray-900">{item}</span>
                  <button
                    onClick={() => moveItem(index, "up")}
                    disabled={index === 0}
                    className="px-2 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label={`Move ${item} up`}
                  >
                    &uarr;
                  </button>
                  <button
                    onClick={() => moveItem(index, "down")}
                    disabled={index === buttonList.length - 1}
                    className="px-2 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label={`Move ${item} down`}
                  >
                    &darr;
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-3 text-sm">
              {buttonList.join(", ") === "Echo, Delta, Charlie, Bravo, Alpha" ? (
                <span className="text-green-600 font-medium">Correctly reversed!</span>
              ) : (
                <span className="text-gray-500">
                  Current order: {buttonList.join(", ")}
                </span>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
