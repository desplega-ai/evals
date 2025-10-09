"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  type OnConnect,
  type Node,
  type Edge,
  type ReactFlowInstance,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// Seeded random number generator
class SeededRandom {
  private seed: number;

  constructor(seed: string) {
    this.seed = this.hashString(seed);
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

const NODE_TYPES = [
  { id: "process", label: "Process", color: "#3b82f6" },
  { id: "data", label: "Data", color: "#10b981" },
  { id: "decision", label: "Decision", color: "#f59e0b" },
  { id: "output", label: "Output", color: "#ef4444" },
  { id: "input", label: "Input", color: "#8b5cf6" },
];

function generateRandomGraph(seed: string, nodeCount?: number): { nodes: Node[]; edges: Edge[] } {
  const rng = new SeededRandom(seed);
  const finalNodeCount = nodeCount && nodeCount > 0 ? nodeCount : rng.nextInt(5, 8);
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const HORIZONTAL_SPACING = 250;
  const VERTICAL_SPACING = 120;
  const START_X = 50;
  const START_Y = 250;

  // Create tree structure
  const levels: number[][] = [];
  let remainingNodes = finalNodeCount;
  let currentLevel = 0;

  levels.push([0]);
  remainingNodes--;

  while (remainingNodes > 0) {
    const nodesInPreviousLevel = levels[currentLevel].length;
    const maxNodesInLevel = nodesInPreviousLevel * 2;
    const nodesInThisLevel = Math.min(
      rng.nextInt(1, Math.min(maxNodesInLevel, remainingNodes)),
      remainingNodes
    );

    const levelNodes: number[] = [];
    for (let i = 0; i < nodesInThisLevel; i++) {
      levelNodes.push(finalNodeCount - remainingNodes);
      remainingNodes--;
    }
    levels.push(levelNodes);
    currentLevel++;
  }

  // Generate nodes
  for (let levelIndex = 0; levelIndex < levels.length; levelIndex++) {
    const levelNodeIds = levels[levelIndex];
    const nodesInLevel = levelNodeIds.length;

    for (let i = 0; i < nodesInLevel; i++) {
      const nodeId = levelNodeIds[i];
      const nodeType = NODE_TYPES[rng.nextInt(0, NODE_TYPES.length - 1)];
      const x = START_X + levelIndex * HORIZONTAL_SPACING;
      const y = START_Y + (i - (nodesInLevel - 1) / 2) * VERTICAL_SPACING;

      nodes.push({
        id: `node-${nodeId}`,
        type: "default",
        position: { x, y },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        data: { label: `${nodeType.label} ${nodeId + 1}` },
        style: {
          background: nodeType.color,
          color: "white",
          border: "2px solid #fff",
          borderRadius: "8px",
          padding: "10px",
          fontSize: "12px",
          fontWeight: "bold",
        },
      });
    }
  }

  // Generate edges
  for (let levelIndex = 0; levelIndex < levels.length - 1; levelIndex++) {
    const currentLevelNodes = levels[levelIndex];
    const nextLevelNodes = levels[levelIndex + 1];

    let childIndex = 0;
    for (let parentIndex = 0; parentIndex < currentLevelNodes.length; parentIndex++) {
      const parent = currentLevelNodes[parentIndex];
      const numChildren = Math.min(
        rng.nextInt(1, 2),
        nextLevelNodes.length - childIndex
      );

      for (let i = 0; i < numChildren && childIndex < nextLevelNodes.length; i++) {
        const child = nextLevelNodes[childIndex];
        edges.push({
          id: `edge-${parent}-${child}`,
          source: `node-${parent}`,
          target: `node-${child}`,
          type: "smoothstep",
          animated: rng.next() > 0.5,
          style: { stroke: "#94a3b8", strokeWidth: 2 },
        });
        childIndex++;
      }
    }
  }

  return { nodes, edges };
}

function GraphContent() {
  const searchParams = useSearchParams();
  const seed = searchParams.get("seed") || "default";
  const isEmpty = searchParams.get("empty") !== null;
  const nodeCount = searchParams.get("nodes") ? parseInt(searchParams.get("nodes")!) : undefined;
  const [nodeIdCounter, setNodeIdCounter] = useState(0);
  const hasInitializedRef = useRef(false);

  const initialGraph = useMemo(() => {
    if (isEmpty) {
      return { nodes: [], edges: [] };
    }
    return generateRandomGraph(seed, nodeCount);
  }, [seed, isEmpty, nodeCount]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialGraph.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialGraph.edges);

  useEffect(() => {
    if (isEmpty) {
      setNodes([]);
      setEdges([]);
      setNodeIdCounter(0);
    } else {
      const newGraph = generateRandomGraph(seed, nodeCount);
      setNodes(newGraph.nodes);
      setEdges(newGraph.edges);
      setNodeIdCounter(newGraph.nodes.length);
    }
  }, [seed, isEmpty, nodeCount, setNodes, setEdges]);

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      if (!type) return;

      const nodeTypeData = NODE_TYPES.find((nt) => nt.id === type);
      if (!nodeTypeData) return;

      const reactFlowBounds = (event.target as HTMLElement).getBoundingClientRect();
      const position = {
        x: event.clientX - reactFlowBounds.left - 50,
        y: event.clientY - reactFlowBounds.top - 20,
      };

      const newNode: Node = {
        id: `node-${nodeIdCounter}`,
        type: "default",
        position,
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        data: { label: `${nodeTypeData.label} ${nodeIdCounter + 1}` },
        style: {
          background: nodeTypeData.color,
          color: "white",
          border: "2px solid #fff",
          borderRadius: "8px",
          padding: "10px",
          fontSize: "12px",
          fontWeight: "bold",
        },
      };

      setNodes((nds) => nds.concat(newNode));
      setNodeIdCounter((c) => c + 1);
    },
    [nodeIdCounter, setNodes]
  );

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const onInit = useCallback((instance: ReactFlowInstance) => {
    if (!hasInitializedRef.current && !isEmpty) {
      hasInitializedRef.current = true;
      setTimeout(() => {
        instance.fitView({ padding: 0.2, duration: 300 });
      }, 100);
    }
  }, [isEmpty]);

  const handleDeleteSelected = useCallback(() => {
    setNodes((nds) => nds.filter((node) => !node.selected));
    setEdges((eds) => {
      const selectedNodeIds = nodes.filter((n) => n.selected).map((n) => n.id);
      return eds.filter(
        (edge) =>
          !edge.selected &&
          !selectedNodeIds.includes(edge.source) &&
          !selectedNodeIds.includes(edge.target)
      );
    });
  }, [setNodes, setEdges, nodes]);

  const handleUnselect = useCallback(() => {
    setNodes((nds) => nds.map((node) => ({ ...node, selected: false })));
    setEdges((eds) => eds.map((edge) => ({ ...edge, selected: false })));
  }, [setNodes, setEdges]);

  const hasSelection = nodes.some((n) => n.selected) || edges.some((e) => e.selected);

  const selectedNode = nodes.find((n) => n.selected);
  const selectedEdge = edges.find((e) => e.selected);
  const selectionText = selectedNode
    ? `Selected Node: ${selectedNode.data.label}`
    : selectedEdge
    ? `Selected Edge`
    : '';

  return (
    <div className="font-sans min-h-screen p-8">
      <style jsx global>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 0 3px rgba(0, 0, 0, 1),
                        0 0 15px 2px rgba(255, 255, 255, 0.6);
          }
          50% {
            box-shadow: 0 0 0 3px rgba(0, 0, 0, 1),
                        0 0 20px 4px rgba(255, 255, 255, 0.8);
          }
        }

        .react-flow__node.selected {
          animation: pulse-glow 2s ease-in-out infinite !important;
          transform: scale(1.02);
        }

        @keyframes pulse-edge {
          0%, 100% {
            filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.6));
          }
          50% {
            filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.9));
          }
        }

        .react-flow__edge.selected path {
          stroke: #000 !important;
          stroke-width: 3 !important;
          animation: pulse-edge 2s ease-in-out infinite;
        }
      `}</style>

      <main className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-4">Graph Demo</h1>
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Seed: <code className="bg-gray-100 px-2 py-1 rounded">{seed}</code> -
            Change it with <code className="bg-gray-100 px-2 py-1 rounded">?seed=your-seed</code>
            {isEmpty && <span className="ml-2 text-green-600 font-semibold">(Empty mode)</span>}
          </p>

          <div className="flex items-center gap-3">
            {hasSelection ? (
              <>
                <span className="text-gray-700 font-medium">{selectionText}</span>
                <button
                  onClick={handleDeleteSelected}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Delete
                </button>
                <button
                  onClick={handleUnselect}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Unselect
                </button>
              </>
            ) : (
              <span className="text-gray-500 italic text-sm">
                Select a node or edge to interact with it
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-64 bg-gray-50 border border-gray-300 rounded-lg p-4">
            <h2 className="font-bold mb-4 text-lg">Node Types</h2>
            <p className="text-sm text-gray-600 mb-4">Drag nodes onto the canvas</p>
            <div className="space-y-2">
              {NODE_TYPES.map((nodeType) => (
                <div
                  key={nodeType.id}
                  draggable
                  onDragStart={(event) => onDragStart(event, nodeType.id)}
                  className="p-3 rounded-lg cursor-move border-2 border-white hover:border-gray-400 transition-all"
                  style={{
                    background: nodeType.color,
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                >
                  {nodeType.label}
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-gray-300">
              <p className="text-xs text-gray-500">
                <strong>Instructions:</strong>
                <br />
                • Drag nodes from the list
                <br />
                • Drop them on the canvas
                <br />
                • Connect nodes by dragging from node handles
                <br />
                • Move nodes by dragging them
                <br />• Change seed in URL to generate different graphs
              </p>
            </div>
          </div>

          <div
            className="flex-1 border border-gray-300 rounded-lg overflow-hidden bg-white"
            style={{ height: "700px" }}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onInit={onInit}
              minZoom={0.5}
              maxZoom={2}
              proOptions={{ hideAttribution: true }}
            >
              <Background />
              <Controls />
            </ReactFlow>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function GraphPage() {
  return (
    <Suspense fallback={<div className="font-sans min-h-screen p-8 flex items-center justify-center">Loading graph...</div>}>
      <GraphContent />
    </Suspense>
  );
}
