"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";

// --- Section 1: Tab Navigation Grid ---
const gridItems = [
  { id: "g1", label: "Alpha", code: "KBD-A1" },
  { id: "g2", label: "Bravo", code: "KBD-B2" },
  { id: "g3", label: "Charlie", code: "KBD-C3" },
  { id: "g4", label: "Delta", code: "KBD-D4" },
  { id: "g5", label: "Echo", code: "KBD-E5" },
  { id: "g6", label: "Foxtrot", code: "KBD-F6" },
];

// --- Section 3: Menu Data ---
const menuItems = [
  {
    id: "file",
    label: "File",
    children: [
      { id: "new", label: "New", shortcut: "Ctrl+N" },
      { id: "open", label: "Open", shortcut: "Ctrl+O" },
      { id: "save", label: "Save", shortcut: "Ctrl+S" },
      { id: "exit", label: "Exit", shortcut: "Alt+F4" },
    ],
  },
  {
    id: "edit",
    label: "Edit",
    children: [
      { id: "undo", label: "Undo", shortcut: "Ctrl+Z" },
      { id: "redo", label: "Redo", shortcut: "Ctrl+Y" },
      { id: "cut", label: "Cut", shortcut: "Ctrl+X" },
      { id: "copy", label: "Copy", shortcut: "Ctrl+C" },
      { id: "paste", label: "Paste", shortcut: "Ctrl+V" },
    ],
  },
  {
    id: "view",
    label: "View",
    children: [
      { id: "zoom-in", label: "Zoom In", shortcut: "Ctrl+=" },
      { id: "zoom-out", label: "Zoom Out", shortcut: "Ctrl+-" },
      { id: "fullscreen", label: "Fullscreen", shortcut: "F11" },
    ],
  },
];

// --- Section 5: Keyboard Shortcut Game ---
const shortcuts = [
  { combo: "Ctrl+S", action: "Save" },
  { combo: "Ctrl+Z", action: "Undo" },
  { combo: "Ctrl+C", action: "Copy" },
  { combo: "Escape", action: "Close" },
  { combo: "Enter", action: "Submit" },
  { combo: "Tab", action: "Next Field" },
];

export default function KeyboardPage() {
  // Section 1: Tab navigation
  const [activatedItems, setActivatedItems] = useState<Set<string>>(new Set());
  const [focusedGrid, setFocusedGrid] = useState<number | null>(null);

  // Section 2: Focus trap modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(0);
  const [modalInput, setModalInput] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const modalFirstFocusRef = useRef<HTMLInputElement>(null);

  // Section 3: Arrow key menu
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [menuFocusIndex, setMenuFocusIndex] = useState(0);
  const [menuLog, setMenuLog] = useState<string[]>([]);

  // Section 4: Skip links
  const [skipLinkUsed, setSkipLinkUsed] = useState(false);

  // Section 5: Shortcut game
  const [currentShortcut, setCurrentShortcut] = useState(0);
  const [shortcutScore, setShortcutScore] = useState(0);
  const [shortcutFailed, setShortcutFailed] = useState(false);
  const [shortcutComplete, setShortcutComplete] = useState(false);

  // Section 6: Arrow key list
  const [arrowListIndex, setArrowListIndex] = useState(0);
  const [arrowSelectedItems, setArrowSelectedItems] = useState<Set<number>>(new Set());
  const arrowItems = ["Apple", "Banana", "Cherry", "Date", "Elderberry", "Fig", "Grape"];

  // --- Section 1: Grid keyboard handler ---
  const handleGridKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setActivatedItems((prev) => {
        const next = new Set(prev);
        next.add(gridItems[index].id);
        return next;
      });
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = Math.min(index + 1, gridItems.length - 1);
      setFocusedGrid(next);
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = Math.max(index - 1, 0);
      setFocusedGrid(prev);
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.min(index + 3, gridItems.length - 1);
      setFocusedGrid(next);
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = Math.max(index - 3, 0);
      setFocusedGrid(prev);
    }
  };

  // Auto-focus grid item when focusedGrid changes
  useEffect(() => {
    if (focusedGrid !== null) {
      const el = document.querySelector(`[data-grid-index="${focusedGrid}"]`) as HTMLElement;
      el?.focus();
    }
  }, [focusedGrid]);

  // --- Section 2: Modal focus trap ---
  useEffect(() => {
    if (modalOpen && modalFirstFocusRef.current) {
      modalFirstFocusRef.current.focus();
    }
  }, [modalOpen]);

  const handleModalKeyDown = useCallback((e: KeyboardEvent) => {
    if (!modalOpen) return;
    if (e.key === "Escape") {
      setModalOpen(false);
      return;
    }
    if (e.key === "Tab" && modalRef.current) {
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  }, [modalOpen]);

  useEffect(() => {
    document.addEventListener("keydown", handleModalKeyDown);
    return () => document.removeEventListener("keydown", handleModalKeyDown);
  }, [handleModalKeyDown]);

  // --- Section 3: Menu keyboard handler ---
  const handleMenuBarKeyDown = (e: React.KeyboardEvent, menuId: string) => {
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      setOpenMenu(openMenu === menuId ? null : menuId);
      setMenuFocusIndex(0);
    }
    if (e.key === "Escape") {
      setOpenMenu(null);
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const idx = menuItems.findIndex((m) => m.id === menuId);
      const nextIdx = (idx + 1) % menuItems.length;
      setOpenMenu(menuItems[nextIdx].id);
      setMenuFocusIndex(0);
      const el = document.querySelector(`[data-menu-trigger="${menuItems[nextIdx].id}"]`) as HTMLElement;
      el?.focus();
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      const idx = menuItems.findIndex((m) => m.id === menuId);
      const prevIdx = (idx - 1 + menuItems.length) % menuItems.length;
      setOpenMenu(menuItems[prevIdx].id);
      setMenuFocusIndex(0);
      const el = document.querySelector(`[data-menu-trigger="${menuItems[prevIdx].id}"]`) as HTMLElement;
      el?.focus();
    }
  };

  const handleMenuItemKeyDown = (e: React.KeyboardEvent, menu: typeof menuItems[0]) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setMenuFocusIndex((prev) => Math.min(prev + 1, menu.children.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setMenuFocusIndex((prev) => Math.max(prev - 1, 0));
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const item = menu.children[menuFocusIndex];
      setMenuLog((prev) => [...prev, `${item.label} (${item.shortcut})`].slice(-5));
      setOpenMenu(null);
    }
    if (e.key === "Escape") {
      setOpenMenu(null);
      const el = document.querySelector(`[data-menu-trigger="${menu.id}"]`) as HTMLElement;
      el?.focus();
    }
  };

  useEffect(() => {
    if (openMenu) {
      const el = document.querySelector(`[data-menu-item-index="${menuFocusIndex}"]`) as HTMLElement;
      el?.focus();
    }
  }, [menuFocusIndex, openMenu]);

  // --- Section 5: Shortcut game handler ---
  useEffect(() => {
    if (shortcutComplete) return;

    const handler = (e: KeyboardEvent) => {
      const target = shortcuts[currentShortcut];
      if (!target) return;

      let pressed = "";
      if (e.ctrlKey) pressed += "Ctrl+";
      if (e.altKey) pressed += "Alt+";
      if (e.shiftKey) pressed += "Shift+";

      if (e.key === "Escape") pressed = "Escape";
      else if (e.key === "Enter") pressed = "Enter";
      else if (e.key === "Tab") {
        pressed = "Tab";
        e.preventDefault();
      } else pressed += e.key.toUpperCase();

      // Normalize
      const normalizedTarget = target.combo.replace(/\+([a-z])$/, (_, c) => "+" + c.toUpperCase());

      if (pressed === normalizedTarget) {
        e.preventDefault();
        const nextIndex = currentShortcut + 1;
        setShortcutScore((prev) => prev + 1);
        setShortcutFailed(false);
        if (nextIndex >= shortcuts.length) {
          setShortcutComplete(true);
        } else {
          setCurrentShortcut(nextIndex);
        }
      } else {
        setShortcutFailed(true);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentShortcut, shortcutComplete]);

  // --- Section 6: Arrow key list handler ---
  const handleArrowListKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setArrowListIndex((prev) => Math.min(prev + 1, arrowItems.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setArrowListIndex((prev) => Math.max(prev - 1, 0));
    }
    if (e.key === " ") {
      e.preventDefault();
      setArrowSelectedItems((prev) => {
        const next = new Set(prev);
        if (next.has(arrowListIndex)) {
          next.delete(arrowListIndex);
        } else {
          next.add(arrowListIndex);
        }
        return next;
      });
    }
    if (e.key === "Enter") {
      e.preventDefault();
      setArrowSelectedItems((prev) => {
        const next = new Set(prev);
        next.add(arrowListIndex);
        return next;
      });
    }
  };

  return (
    <div className="font-sans min-h-screen p-8">
      {/* Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:outline-none"
        onClick={() => setSkipLinkUsed(true)}
        data-testid="skip-link"
      >
        Skip to main content
      </a>

      <main id="main-content" className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:underline">&larr; Back to Home</Link>
        </div>

        <h1 className="text-3xl font-bold mb-2">Keyboard-Only Navigation Demo</h1>
        <p className="text-gray-600 mb-8">
          All interactions on this page can be performed using only the keyboard. No mouse clicks required.
        </p>

        <div className="space-y-12">
          {/* Section 1: Tab + Arrow Key Grid */}
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Keyboard Grid Navigation</h2>
            <p className="text-gray-600 mb-4">
              <strong>Challenge:</strong> Use <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Tab</kbd> to focus the grid, then arrow keys to navigate. Press <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Enter</kbd> or <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Space</kbd> to activate each card. Activate all 6 to reveal the codes.
            </p>

            <div className="grid grid-cols-3 gap-3 max-w-lg" role="grid" aria-label="Activation grid">
              {gridItems.map((item, index) => (
                <div
                  key={item.id}
                  tabIndex={index === 0 || focusedGrid === index ? 0 : -1}
                  role="gridcell"
                  data-grid-index={index}
                  data-testid={`grid-${item.id}`}
                  onKeyDown={(e) => handleGridKeyDown(e, index)}
                  onFocus={() => setFocusedGrid(index)}
                  className={`p-4 rounded-lg border-2 text-center cursor-default transition-all outline-none ${
                    activatedItems.has(item.id)
                      ? "border-green-500 bg-green-50"
                      : focusedGrid === index
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-300"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className="font-semibold text-gray-900">{item.label}</p>
                  {activatedItems.has(item.id) ? (
                    <p className="text-xs text-green-600 font-mono mt-1">{item.code}</p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1">Not activated</p>
                  )}
                </div>
              ))}
            </div>

            <p className="mt-3 text-sm">
              Activated: {activatedItems.size} / {gridItems.length}
              {activatedItems.size === gridItems.length && (
                <span className="text-green-600 font-medium ml-2">All items activated!</span>
              )}
            </p>
          </section>

          {/* Section 2: Focus Trap Modal */}
          <section>
            <h2 className="text-xl font-semibold mb-2">2. Focus Trap Modal</h2>
            <p className="text-gray-600 mb-4">
              <strong>Challenge:</strong> Open the modal, complete 3 steps by pressing Tab to cycle through elements and Enter to confirm.
              Press <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Escape</kbd> to close.
              Focus stays trapped inside the modal.
            </p>

            <button
              onClick={() => { setModalOpen(true); setModalStep(0); setModalInput(""); }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              data-testid="open-modal"
            >
              Open Modal (Keyboard Only)
            </button>

            <p className="mt-2 text-sm text-gray-500">
              Modal completed steps: {modalStep} / 3
            </p>

            {modalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" aria-modal="true" role="dialog">
                <div ref={modalRef} className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                  <h3 className="text-lg font-semibold mb-4">Keyboard Modal - Step {modalStep + 1}</h3>

                  {modalStep === 0 && (
                    <div className="space-y-4">
                      <p className="text-gray-600">Type your name and press the Continue button.</p>
                      <input
                        ref={modalFirstFocusRef}
                        type="text"
                        value={modalInput}
                        onChange={(e) => setModalInput(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Your name"
                        data-testid="modal-input"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setModalOpen(false)}
                          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => { if (modalInput.trim()) setModalStep(1); }}
                          disabled={!modalInput.trim()}
                          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          data-testid="modal-continue-1"
                        >
                          Continue
                        </button>
                      </div>
                    </div>
                  )}

                  {modalStep === 1 && (
                    <div className="space-y-4">
                      <p className="text-gray-600">
                        Hello, <strong>{modalInput}</strong>! Now select an option and press Continue.
                      </p>
                      <div className="space-y-2">
                        {["Option A", "Option B", "Option C"].map((opt) => (
                          <label key={opt} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer">
                            <input type="radio" name="modal-option" value={opt} className="w-4 h-4 text-blue-600" />
                            <span className="text-gray-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setModalStep(0)}
                          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Back
                        </button>
                        <button
                          onClick={() => setModalStep(2)}
                          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          data-testid="modal-continue-2"
                        >
                          Continue
                        </button>
                      </div>
                    </div>
                  )}

                  {modalStep === 2 && (
                    <div className="space-y-4">
                      <p className="text-gray-600">Final step! Confirm to close the modal.</p>
                      <div className="p-3 bg-green-50 border border-green-200 rounded">
                        <p className="text-sm text-green-700">Completion code: <code className="font-mono font-bold">FOCUS-TRAP-OK</code></p>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setModalStep(1)}
                          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Back
                        </button>
                        <button
                          onClick={() => { setModalStep(3); setModalOpen(false); }}
                          className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                          data-testid="modal-confirm"
                        >
                          Confirm & Close
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Section 3: Keyboard Menu Bar */}
          <section>
            <h2 className="text-xl font-semibold mb-2">3. Menu Bar Navigation</h2>
            <p className="text-gray-600 mb-4">
              <strong>Challenge:</strong> Use arrow keys to navigate between menus and menu items.
              Press <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Enter</kbd> to open a menu and select items.
              <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Escape</kbd> to close.
              Select &quot;Save&quot; from File and &quot;Copy&quot; from Edit.
            </p>

            <div className="border border-gray-200 rounded-lg overflow-hidden max-w-md" role="menubar" aria-label="Application menu">
              <div className="flex bg-gray-50 border-b border-gray-200">
                {menuItems.map((menu) => (
                  <div key={menu.id} className="relative">
                    <button
                      data-menu-trigger={menu.id}
                      role="menuitem"
                      aria-haspopup="true"
                      aria-expanded={openMenu === menu.id}
                      onKeyDown={(e) => handleMenuBarKeyDown(e, menu.id)}
                      onClick={() => setOpenMenu(openMenu === menu.id ? null : menu.id)}
                      className={`px-4 py-2 text-sm font-medium transition-colors outline-none focus:bg-blue-100 focus:text-blue-700 ${
                        openMenu === menu.id ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {menu.label}
                    </button>

                    {openMenu === menu.id && (
                      <div className="absolute top-full left-0 z-10 bg-white border border-gray-200 rounded-b-lg shadow-lg min-w-[200px]" role="menu">
                        {menu.children.map((child, childIdx) => (
                          <button
                            key={child.id}
                            role="menuitem"
                            data-menu-item-index={childIdx}
                            tabIndex={-1}
                            onKeyDown={(e) => handleMenuItemKeyDown(e, menu)}
                            onClick={() => {
                              setMenuLog((prev) => [...prev, `${child.label} (${child.shortcut})`].slice(-5));
                              setOpenMenu(null);
                            }}
                            className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left transition-colors outline-none ${
                              menuFocusIndex === childIdx ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <span>{child.label}</span>
                            <span className="text-xs text-gray-400 font-mono">{child.shortcut}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-4 min-h-[80px]">
                {menuLog.length > 0 ? (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-700">Action Log:</p>
                    {menuLog.map((log, i) => (
                      <p key={i} className="text-sm text-gray-500">{log}</p>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No actions performed yet.</p>
                )}
              </div>
            </div>
          </section>

          {/* Section 4: Skip Link */}
          <section>
            <h2 className="text-xl font-semibold mb-2">4. Skip Link</h2>
            <p className="text-gray-600 mb-4">
              <strong>Challenge:</strong> Press <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Tab</kbd> from the browser address bar.
              A &quot;Skip to main content&quot; link should appear. Activate it to jump past the navigation.
            </p>

            <div className={`p-4 rounded-lg border-2 ${skipLinkUsed ? "border-green-500 bg-green-50" : "border-gray-200"}`}>
              <p className="text-sm">
                Skip link status: {skipLinkUsed ? (
                  <span className="text-green-600 font-medium">Used! The skip link was activated.</span>
                ) : (
                  <span className="text-gray-500">Not yet used. Try pressing Tab from the top of the page.</span>
                )}
              </p>
            </div>
          </section>

          {/* Section 5: Keyboard Shortcut Challenge */}
          <section>
            <h2 className="text-xl font-semibold mb-2">5. Keyboard Shortcut Challenge</h2>
            <p className="text-gray-600 mb-4">
              <strong>Challenge:</strong> Press the correct keyboard shortcut shown on screen. Complete all 6 to win.
            </p>

            <div className="p-6 border border-gray-200 rounded-lg max-w-md text-center">
              {shortcutComplete ? (
                <div>
                  <p className="text-green-600 font-bold text-lg mb-2">All shortcuts completed!</p>
                  <p className="text-sm text-gray-500">Score: {shortcutScore}/{shortcuts.length}</p>
                  <p className="text-sm text-green-600 font-mono mt-2">Completion code: KEYS-MASTER</p>
                  <button
                    onClick={() => { setCurrentShortcut(0); setShortcutScore(0); setShortcutComplete(false); setShortcutFailed(false); }}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Play Again
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Press this shortcut:</p>
                  <p className="text-3xl font-mono font-bold text-gray-900 mb-2">
                    {shortcuts[currentShortcut].combo}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Action: {shortcuts[currentShortcut].action}
                  </p>
                  <p className="text-sm text-gray-400">
                    Progress: {currentShortcut}/{shortcuts.length}
                  </p>
                  {shortcutFailed && (
                    <p className="text-red-500 text-sm mt-2">Wrong key! Try again.</p>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Section 6: Arrow Key List Selection */}
          <section>
            <h2 className="text-xl font-semibold mb-2">6. Arrow Key List Selection</h2>
            <p className="text-gray-600 mb-4">
              <strong>Challenge:</strong> Use Up/Down arrows to navigate, <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Space</kbd> to toggle selection, <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Enter</kbd> to select.
              Select all fruits that start with a vowel (Apple, Elderberry).
            </p>

            <div
              className="max-w-sm border border-gray-200 rounded-lg overflow-hidden"
              role="listbox"
              aria-label="Fruit selection"
              tabIndex={0}
              onKeyDown={handleArrowListKeyDown}
              data-testid="arrow-list"
            >
              {arrowItems.map((item, index) => (
                <div
                  key={item}
                  role="option"
                  aria-selected={arrowSelectedItems.has(index)}
                  data-testid={`arrow-item-${index}`}
                  className={`flex items-center gap-3 px-4 py-2.5 border-b border-gray-100 last:border-b-0 transition-colors ${
                    arrowListIndex === index
                      ? "bg-blue-50 outline outline-2 outline-blue-400 -outline-offset-2"
                      : ""
                  } ${arrowSelectedItems.has(index) ? "bg-green-50" : ""}`}
                >
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    arrowSelectedItems.has(index) ? "border-green-500 bg-green-500" : "border-gray-300"
                  }`}>
                    {arrowSelectedItems.has(index) && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-gray-900">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-3 text-sm">
              <p className="text-gray-500">
                Selected: {arrowSelectedItems.size > 0
                  ? Array.from(arrowSelectedItems).map((i) => arrowItems[i]).join(", ")
                  : "None"}
              </p>
              {arrowSelectedItems.size === 2 &&
                arrowSelectedItems.has(0) &&
                arrowSelectedItems.has(4) &&
                !Array.from(arrowSelectedItems).some((i) => i !== 0 && i !== 4) && (
                <p className="text-green-600 font-medium mt-1">Correct! Apple and Elderberry selected.</p>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
