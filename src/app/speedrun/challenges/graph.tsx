"use client";

import { useState, useEffect } from "react";
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  type OnConnect,
  type Node,
  Position,
  Background,
  Controls,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ChallengeCard } from "./challenge-card";
import type { ChallengeWrapperProps } from "./types";

export function GraphChallengeWrapper({ challenge, onComplete }: ChallengeWrapperProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [addedNodes, setAddedNodes] = useState<Set<string>>(new Set());

  const onConnect: OnConnect = (connection) => {
    setEdges((eds) => addEdge(connection, eds));
  };

  const hasStart = addedNodes.has("start");
  const hasEnd = addedNodes.has("end");
  const hasBothNodes = hasStart && hasEnd;
  const hasConnections = edges.length > 0;

  useEffect(() => {
    if (!challenge.completed && hasBothNodes && hasConnections) {
      onComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasBothNodes, hasConnections, onComplete]);

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const nodeType = event.dataTransfer.getData("application/reactflow");
    if (!nodeType || addedNodes.has(nodeType)) return;

    const isStart = nodeType === "start";
    const newNode = {
      id: nodeType,
      data: { label: isStart ? "Start" : "End" },
      position: { x: isStart ? 100 : 400, y: 100 },
      sourcePosition: Position.Right as const,
      targetPosition: Position.Left as const,
      style: {
        background: isStart ? "#3b82f6" : "#ef4444",
        color: "white",
        border: "2px solid #fff",
        borderRadius: "8px",
        padding: "10px",
        fontSize: "12px",
        fontWeight: "bold" as const,
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setAddedNodes((prev) => new Set([...prev, nodeType]));
  };

  const NODE_PALETTE = [
    { type: "start", label: "Start", color: "#3b82f6", added: hasStart },
    { type: "end", label: "End", color: "#ef4444", added: hasEnd },
  ];

  return (
    <ChallengeCard
      title={challenge.name}
      completed={challenge.completed}
      checklist={[
        { text: "Drag the Start node onto the canvas", completed: hasStart },
        { text: "Drag the End node onto the canvas", completed: hasEnd },
        { text: "Connect Start to End by dragging between handles", completed: hasConnections },
      ]}
      className="md:col-span-2"
    >
      <div className="flex gap-4">
        {/* Node palette sidebar */}
        <div className="w-36 flex-shrink-0 space-y-3">
          <p className="text-xs font-medium text-gray-700">Node Types</p>
          <p className="text-xs text-gray-500">Drag each node onto the canvas to the right, then connect them by dragging from one node&apos;s handle to the other.</p>
          <div className="space-y-2">
            {NODE_PALETTE.map((node) => (
              <div
                key={node.type}
                draggable={!node.added}
                onDragStart={(e) => onDragStart(e, node.type)}
                role="button"
                aria-label={`Drag ${node.label} node to canvas`}
                tabIndex={0}
                className={`px-3 py-2 rounded-lg text-sm font-bold text-white text-center transition-all border-2 border-white ${
                  node.added
                    ? "opacity-40 cursor-not-allowed"
                    : "cursor-grab active:cursor-grabbing hover:border-gray-400"
                }`}
                style={{ background: node.color }}
              >
                {node.label} {node.added ? "✓" : ""}
              </div>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 space-y-2">
          <div
            style={{ height: "400px", border: "2px dashed #e5e7eb", borderRadius: "8px", overflow: "hidden" }}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onDragOver={onDragOver}
              onDrop={onDrop}
              fitView
              minZoom={0.5}
              maxZoom={2}
              proOptions={{ hideAttribution: true }}
            >
              <Background />
              <Controls />
            </ReactFlow>
          </div>

          <p className="text-xs text-gray-600 text-center" aria-live="polite">
            {!hasStart && !hasEnd && "Drag the Start and End nodes from the palette on the left onto the canvas"}
            {hasStart && !hasEnd && "Now drag the End node onto the canvas"}
            {!hasStart && hasEnd && "Now drag the Start node onto the canvas"}
            {hasBothNodes && !hasConnections && "Both nodes added — now connect them by dragging from one node\u2019s handle (small circle) to the other"}
            {hasConnections && "✓ Challenge complete!"}
          </p>
        </div>
      </div>
    </ChallengeCard>
  );
}
