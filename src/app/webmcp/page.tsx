"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";

// --- Types ---

interface Stamp {
  id: number;
  name: string;
  description: string;
  year: number;
  imageUrl?: string;
}

interface ToolResponse {
  content: Array<{ type: "text"; text: string }>;
}

interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<
      string,
      { type: "string" | "number"; description: string }
    >;
    required: string[];
  };
  execute: (params: Record<string, unknown>) => ToolResponse;
}

interface CallLogEntry {
  id: number;
  timestamp: Date;
  toolName: string;
  input: Record<string, unknown>;
  output: ToolResponse;
}

type ContextMode = "browse" | "edit" | "admin";

type PurchaseState =
  | { status: "idle" }
  | { status: "executing"; stampId: number }
  | { status: "awaiting-confirmation"; stampId: number; stampName: string }
  | { status: "completed"; message: string }
  | { status: "cancelled"; message: string };

// --- Constants ---

const INITIAL_STAMPS: Stamp[] = [
  {
    id: 1,
    name: "Penny Black",
    description: "The world's first adhesive postage stamp",
    year: 1840,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/15/Penny_black.jpg",
  },
  {
    id: 2,
    name: "Inverted Jenny",
    description: "Famous US airmail stamp with an upside-down airplane",
    year: 1918,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2f/US_Airmail_inverted_Jenny_24c_1918_issue.jpg",
  },
  {
    id: 3,
    name: "Treskilling Yellow",
    description: "Swedish stamp printed in the wrong color, one of the rarest stamps",
    year: 1855,
  },
  {
    id: 4,
    name: "Basel Dove",
    description: "First tricolor stamp, featuring an embossed dove",
    year: 1845,
  },
];

const CONTEXT_TOOLS: Record<ContextMode, string[]> = {
  browse: ["get-stamps", "search-stamps"],
  edit: ["add-stamp", "update-stamp", "delete-stamp"],
  admin: [
    "get-stamps",
    "search-stamps",
    "add-stamp",
    "update-stamp",
    "delete-stamp",
    "export-collection",
    "import-collection",
  ],
};

// --- Component ---

export default function WebMCPPage() {
  const [stamps, setStamps] = useState<Stamp[]>(INITIAL_STAMPS);
  const [contextMode, setContextMode] = useState<ContextMode>("edit");
  const [callLog, setCallLog] = useState<CallLogEntry[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>("");
  const [toolParams, setToolParams] = useState<Record<string, string>>({});
  const [purchaseState, setPurchaseState] = useState<PurchaseState>({ status: "idle" });

  // Form state for human UI
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formYear, setFormYear] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");

  // Refs for polyfill execute callbacks (avoids stale closures)
  const stampsRef = useRef(stamps);
  stampsRef.current = stamps;

  const nextIdRef = useRef(INITIAL_STAMPS.length + 1);

  const addStamp = useCallback(
    (name: string, description: string, year: number, imageUrl?: string) => {
      const id = nextIdRef.current++;
      setStamps((prev) => [
        ...prev,
        { id, name, description, year, imageUrl: imageUrl || undefined },
      ]);
      return id;
    },
    []
  );
  const addStampRef = useRef(addStamp);
  addStampRef.current = addStamp;

  // Build ALL_TOOLS using refs so execute callbacks are always fresh
  const ALL_TOOLS = useMemo(
    (): ToolDefinition[] => [
      {
        name: "add-stamp",
        description: "Add a new stamp to the collection",
        inputSchema: {
          type: "object" as const,
          properties: {
            name: { type: "string" as const, description: "The name of the stamp" },
            description: { type: "string" as const, description: "A brief description" },
            year: { type: "number" as const, description: "The year the stamp was issued" },
            imageUrl: { type: "string" as const, description: "Optional image URL" },
          },
          required: ["name", "description", "year"],
        },
        execute(params: Record<string, unknown>) {
          const id = addStampRef.current(
            params.name as string,
            params.description as string,
            params.year as number,
            params.imageUrl as string | undefined
          );
          return {
            content: [
              {
                type: "text" as const,
                text: `Stamp "${params.name}" added successfully with ID ${id}!`,
              },
            ],
          };
        },
      },
      {
        name: "get-stamps",
        description: "Get all stamps in the collection",
        inputSchema: { type: "object" as const, properties: {}, required: [] },
        execute() {
          return {
            content: [
              { type: "text" as const, text: JSON.stringify(stampsRef.current, null, 2) },
            ],
          };
        },
      },
      {
        name: "update-stamp",
        description: "Update an existing stamp by ID",
        inputSchema: {
          type: "object" as const,
          properties: {
            id: { type: "number" as const, description: "The stamp ID to update" },
            name: { type: "string" as const, description: "New name" },
            description: { type: "string" as const, description: "New description" },
            year: { type: "number" as const, description: "New year" },
          },
          required: ["id"],
        },
        execute(params: Record<string, unknown>) {
          const id = params.id as number;
          const stamp = stampsRef.current.find((s) => s.id === id);
          if (!stamp) {
            return {
              content: [{ type: "text" as const, text: `Stamp with ID ${id} not found.` }],
            };
          }
          setStamps((prev) =>
            prev.map((s) =>
              s.id === id
                ? {
                    ...s,
                    ...(params.name !== undefined && { name: params.name as string }),
                    ...(params.description !== undefined && {
                      description: params.description as string,
                    }),
                    ...(params.year !== undefined && { year: params.year as number }),
                  }
                : s
            )
          );
          return {
            content: [
              { type: "text" as const, text: `Stamp "${stamp.name}" (ID ${id}) updated.` },
            ],
          };
        },
      },
      {
        name: "search-stamps",
        description: "Search stamps by name or description",
        inputSchema: {
          type: "object" as const,
          properties: {
            query: { type: "string" as const, description: "Search query" },
          },
          required: ["query"],
        },
        execute(params: Record<string, unknown>) {
          const q = (params.query as string).toLowerCase();
          const results = stampsRef.current.filter(
            (s) =>
              s.name.toLowerCase().includes(q) ||
              s.description.toLowerCase().includes(q)
          );
          return {
            content: [
              { type: "text" as const, text: JSON.stringify(results, null, 2) },
            ],
          };
        },
      },
      {
        name: "delete-stamp",
        description: "Delete a stamp by ID",
        inputSchema: {
          type: "object" as const,
          properties: {
            id: { type: "number" as const, description: "The stamp ID to delete" },
          },
          required: ["id"],
        },
        execute(params: Record<string, unknown>) {
          const id = params.id as number;
          const stamp = stampsRef.current.find((s) => s.id === id);
          if (!stamp) {
            return {
              content: [{ type: "text" as const, text: `Stamp with ID ${id} not found.` }],
            };
          }
          setStamps((prev) => prev.filter((s) => s.id !== id));
          return {
            content: [
              { type: "text" as const, text: `Stamp "${stamp.name}" (ID ${id}) deleted.` },
            ],
          };
        },
      },
      {
        name: "export-collection",
        description: "Export the entire stamp collection as JSON",
        inputSchema: { type: "object" as const, properties: {}, required: [] },
        execute() {
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(
                  { exportedAt: new Date().toISOString(), stamps: stampsRef.current },
                  null,
                  2
                ),
              },
            ],
          };
        },
      },
      {
        name: "import-collection",
        description: "Import stamps from a JSON array",
        inputSchema: {
          type: "object" as const,
          properties: {
            json: {
              type: "string" as const,
              description: "JSON array of stamp objects",
            },
          },
          required: ["json"],
        },
        execute(params: Record<string, unknown>) {
          try {
            const imported = JSON.parse(params.json as string) as Stamp[];
            setStamps((prev) => {
              let nextId = Math.max(...prev.map((s) => s.id), 0) + 1;
              const newStamps = imported.map((s) => ({ ...s, id: nextId++ }));
              return [...prev, ...newStamps];
            });
            return {
              content: [
                {
                  type: "text" as const,
                  text: `Imported ${imported.length} stamps successfully.`,
                },
              ],
            };
          } catch {
            return {
              content: [{ type: "text" as const, text: "Failed to parse JSON input." }],
            };
          }
        },
      },
    ],
    []
  );

  // Filtered tools based on context mode
  const registeredTools = useMemo(
    () => ALL_TOOLS.filter((t) => CONTEXT_TOOLS[contextMode].includes(t.name)),
    [contextMode, ALL_TOOLS]
  );

  // Keep a ref of ALL_TOOLS for the polyfill
  const allToolsRef = useRef(ALL_TOOLS);
  allToolsRef.current = ALL_TOOLS;

  const registeredToolsRef = useRef(registeredTools);
  registeredToolsRef.current = registeredTools;

  // --- navigator.modelContext polyfill ---
  useEffect(() => {
    const toolsMap: Record<string, ToolDefinition> = {};

    const syncTools = () => {
      Object.keys(toolsMap).forEach((k) => delete toolsMap[k]);
      for (const t of registeredToolsRef.current) {
        toolsMap[t.name] = t;
      }
    };

    syncTools();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigator as any).modelContext = {
      provideContext(ctx: { tools?: ToolDefinition[] }) {
        Object.keys(toolsMap).forEach((k) => delete toolsMap[k]);
        const ts = ctx?.tools || [];
        for (const t of ts) toolsMap[t.name] = t;
      },
      registerTool(tool: ToolDefinition) {
        toolsMap[tool.name] = tool;
        return {
          unregister: () => {
            delete toolsMap[tool.name];
          },
        };
      },
      unregisterTool(name: string) {
        delete toolsMap[name];
      },
      // Extension: allow external callers to list and execute tools
      getTools() {
        return Object.values(toolsMap).map((t) => ({
          name: t.name,
          description: t.description,
          inputSchema: t.inputSchema,
        }));
      },
      async callTool(name: string, params: Record<string, unknown>) {
        const tool = toolsMap[name];
        if (!tool) {
          return {
            content: [{ type: "text", text: `Tool "${name}" not found.` }],
          };
        }
        return tool.execute(params);
      },
    };

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (navigator as any).modelContext;
    };
  }, []);

  // Sync polyfill tools when registeredTools change
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mc = (navigator as any).modelContext;
    if (mc) {
      mc.provideContext({
        tools: registeredTools,
      });
    }
  }, [registeredTools]);

  // --- Handlers ---

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formDescription || !formYear) return;
    addStamp(formName, formDescription, parseInt(formYear, 10), formImageUrl || undefined);
    setFormName("");
    setFormDescription("");
    setFormYear("");
    setFormImageUrl("");
  };

  const executeToolFromConsole = () => {
    const tool = registeredTools.find((t) => t.name === selectedTool);
    if (!tool) return;

    const params: Record<string, unknown> = {};
    for (const [key, prop] of Object.entries(tool.inputSchema.properties)) {
      const val = toolParams[key];
      if (val !== undefined && val !== "") {
        params[key] = prop.type === "number" ? Number(val) : val;
      }
    }

    const output = tool.execute(params);
    setCallLog((prev) => [
      {
        id: prev.length + 1,
        timestamp: new Date(),
        toolName: selectedTool,
        input: params,
        output,
      },
      ...prev,
    ]);
    setToolParams({});
  };

  const handleBuyStamp = (stampId: number) => {
    setPurchaseState({ status: "executing", stampId });
    setTimeout(() => {
      const stamp = stamps.find((s) => s.id === stampId);
      setPurchaseState({
        status: "awaiting-confirmation",
        stampId,
        stampName: stamp?.name ?? "Unknown",
      });
    }, 800);
  };

  const handleConfirmPurchase = () => {
    if (purchaseState.status !== "awaiting-confirmation") return;
    setPurchaseState({
      status: "completed",
      message: `Successfully purchased "${purchaseState.stampName}"! Transaction logged.`,
    });
  };

  const handleCancelPurchase = () => {
    if (purchaseState.status !== "awaiting-confirmation") return;
    setPurchaseState({
      status: "cancelled",
      message: `Purchase of "${purchaseState.stampName}" was cancelled by user.`,
    });
  };

  const currentToolDef = registeredTools.find((t) => t.name === selectedTool);

  return (
    <div className="font-sans min-h-screen p-8">
      <main className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:underline">
            &larr; Back to Home
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-2">WebMCP Demo</h1>
        <p className="text-gray-600 mb-8">
          Interactive demonstration of{" "}
          <a
            href="https://nicolo.ribaudo.dev/mcp-proposal/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            WebMCP
          </a>{" "}
          API concepts. This page includes a real{" "}
          <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">
            navigator.modelContext
          </code>{" "}
          polyfill &mdash; open your browser devtools to interact with it
          programmatically.
        </p>

        {/* ============================================ */}
        {/* SECTION: Context Mode Switcher               */}
        {/* ============================================ */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Context Mode</h2>
          <p className="text-gray-600 text-sm mb-3">
            Switch modes to change which tools are available. This simulates how
            an SPA dynamically calls{" "}
            <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">
              provideContext()
            </code>{" "}
            as the user navigates.
          </p>
          <div className="flex gap-1 bg-gray-200 rounded-lg p-1 w-fit">
            {(["browse", "edit", "admin"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setContextMode(mode)}
                className={`px-4 py-1.5 text-sm font-medium rounded capitalize transition-colors ${
                  contextMode === mode
                    ? "bg-white text-gray-900 shadow"
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </section>

        {/* ============================================ */}
        {/* SECTION: Tool Registry                       */}
        {/* ============================================ */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            Registered Tools{" "}
            <span className="text-sm font-normal text-gray-500">
              ({registeredTools.length})
            </span>
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {registeredTools.map((tool) => (
              <div
                key={tool.name}
                className="border border-gray-300 rounded-lg p-4"
              >
                <h3 className="font-mono text-sm font-semibold text-gray-900 mb-1">
                  {tool.name}
                </h3>
                <p className="text-gray-600 text-sm mb-2">{tool.description}</p>
                <details className="text-xs">
                  <summary className="text-gray-500 cursor-pointer hover:text-gray-700">
                    Input schema
                  </summary>
                  <pre className="mt-1 bg-gray-50 rounded p-2 overflow-x-auto">
                    {JSON.stringify(tool.inputSchema, null, 2)}
                  </pre>
                </details>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================ */}
        {/* SECTION: Stamp Collection                    */}
        {/* ============================================ */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Stamp Collection</h2>

          <div className="grid gap-6 lg:grid-cols-2 mb-6">
            {/* Human UI: Add Stamp Form */}
            <div className="border border-gray-300 rounded-lg p-5">
              <h3 className="font-semibold mb-3">Add Stamp (Human UI)</h3>
              <form onSubmit={handleFormSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Penny Red"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <input
                    type="text"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="A brief description"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year *
                  </label>
                  <input
                    type="number"
                    value={formYear}
                    onChange={(e) => setFormYear(e.target.value)}
                    placeholder="1840"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Add Stamp
                </button>
              </form>
            </div>

            {/* Agent Tool Call Console */}
            <div className="border border-gray-800 bg-gray-900 rounded-lg p-5 text-gray-100">
              <h3 className="font-semibold mb-3 text-gray-100">
                Tool Call Console (Agent UI)
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Select Tool
                  </label>
                  <select
                    value={selectedTool}
                    onChange={(e) => {
                      setSelectedTool(e.target.value);
                      setToolParams({});
                    }}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- choose a tool --</option>
                    {registeredTools.map((t) => (
                      <option key={t.name} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                {currentToolDef && (
                  <>
                    <p className="text-xs text-gray-400">
                      {currentToolDef.description}
                    </p>
                    {Object.entries(
                      currentToolDef.inputSchema.properties
                    ).map(([key, prop]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          {key}
                          {currentToolDef.inputSchema.required.includes(key) && (
                            <span className="text-red-400"> *</span>
                          )}
                        </label>
                        <input
                          type={prop.type === "number" ? "number" : "text"}
                          placeholder={prop.description}
                          value={toolParams[key] || ""}
                          onChange={(e) =>
                            setToolParams((prev) => ({
                              ...prev,
                              [key]: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    ))}
                    <button
                      onClick={executeToolFromConsole}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-mono text-sm"
                    >
                      Execute
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Stamps Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-900">
                    ID
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-900">
                    Name
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-900">
                    Description
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-900">
                    Year
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-900">
                    Image
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {stamps.map((stamp) => (
                  <tr key={stamp.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">
                      {stamp.id}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900">
                      {stamp.name}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">
                      {stamp.description}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">
                      {stamp.year}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-500">
                      {stamp.imageUrl ? (
                        <a
                          href={stamp.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-xs"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-xs">-</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      <button
                        onClick={() => handleBuyStamp(stamp.id)}
                        disabled={purchaseState.status !== "idle" && purchaseState.status !== "completed" && purchaseState.status !== "cancelled"}
                        className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Buy
                      </button>
                    </td>
                  </tr>
                ))}
                {stamps.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="border border-gray-300 px-4 py-8 text-center text-gray-500"
                    >
                      No stamps in the collection. Add one above!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ============================================ */}
        {/* SECTION: User Interaction Request Demo       */}
        {/* ============================================ */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">User Interaction Request</h2>
          <p className="text-gray-600 text-sm mb-4">
            Demonstrates{" "}
            <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">
              agent.requestUserInteraction()
            </code>{" "}
            &mdash; a tool execution that pauses mid-flow to ask the user for
            confirmation before proceeding.
          </p>

          {purchaseState.status === "executing" && (
            <div className="flex items-center gap-2 text-gray-600 p-4 bg-gray-50 rounded-lg">
              <svg
                className="animate-spin h-5 w-5 text-purple-600"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Tool executing&hellip; processing purchase request
            </div>
          )}

          {(purchaseState.status === "completed" ||
            purchaseState.status === "cancelled") && (
            <div
              className={`p-4 rounded-lg mb-4 ${
                purchaseState.status === "completed"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-yellow-50 text-yellow-800 border border-yellow-200"
              }`}
            >
              <p className="text-sm">{purchaseState.message}</p>
              <button
                onClick={() => setPurchaseState({ status: "idle" })}
                className="mt-2 text-xs underline"
              >
                Reset
              </button>
            </div>
          )}

          {purchaseState.status === "idle" && (
            <p className="text-sm text-gray-500">
              Click &quot;Buy&quot; on any stamp in the table above to trigger
              the user interaction flow.
            </p>
          )}
        </section>

        {/* ============================================ */}
        {/* SECTION: Call Log                            */}
        {/* ============================================ */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            Tool Call Log{" "}
            <span className="text-sm font-normal text-gray-500">
              ({callLog.length})
            </span>
          </h2>
          {callLog.length === 0 ? (
            <p className="text-sm text-gray-500">
              No tool calls yet. Use the console above to execute a tool.
            </p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {callLog.map((entry) => (
                <div
                  key={entry.id}
                  className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-semibold text-gray-900">
                      {entry.toolName}
                    </span>
                    <span className="text-xs text-gray-400">
                      {entry.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Input:</span>
                      <pre className="mt-0.5 bg-white rounded p-1.5 overflow-x-auto border border-gray-200">
                        {JSON.stringify(entry.input, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <span className="text-gray-500">Output:</span>
                      <pre className="mt-0.5 bg-white rounded p-1.5 overflow-x-auto border border-gray-200">
                        {entry.output.content
                          .map((c) => c.text)
                          .join("\n")}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ============================================ */}
        {/* Confirmation Modal (User Interaction)        */}
        {/* ============================================ */}
        {purchaseState.status === "awaiting-confirmation" && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md shadow-xl">
              <h3 className="text-lg font-semibold mb-2">Confirm Purchase</h3>
              <p className="text-gray-600 mb-4">
                Buy stamp &quot;{purchaseState.stampName}&quot;? This action
                simulates{" "}
                <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                  requestUserInteraction()
                </code>
                .
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleCancelPurchase}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmPurchase}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
