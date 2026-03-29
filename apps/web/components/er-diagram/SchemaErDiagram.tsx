"use client";

import { useCallback, useEffect, useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useEdgesState,
  useNodesState,
  type NodeTypes,
} from "reactflow";
import "reactflow/dist/style.css";

import type { GeneratedSchema } from "@dbpilot/shared-types";
import { schemaToFlowElements } from "@/lib/schema-flow";
import { TableNode } from "./TableNode";

const nodeTypes: NodeTypes = {
  tableNode: TableNode,
};

type Props = {
  schema: GeneratedSchema;
  className?: string;
};

export function SchemaErDiagram({ schema, className }: Props) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => schemaToFlowElements(schema), [schema]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    const { nodes: n, edges: e } = schemaToFlowElements(schema);
    setNodes(n);
    setEdges(e);
  }, [schema, setNodes, setEdges]);

  const onInit = useCallback(
    (instance: { fitView: (opts?: { padding?: number }) => void }) => {
      requestAnimationFrame(() => instance.fitView({ padding: 0.2 }));
    },
    []
  );

  return (
    <div className={className ?? "h-[min(70vh,560px)] w-full min-h-[360px] rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950"}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onInit={onInit}
        fitView
        proOptions={{ hideAttribution: true }}
        minZoom={0.25}
        maxZoom={1.5}
      >
        <Background gap={16} color="#cbd5e1" className="dark:!bg-gray-900" />
        <Controls className="!bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-600" />
        <MiniMap
          nodeStrokeWidth={2}
          className="!bg-white/90 dark:!bg-gray-800/90"
          maskColor="rgba(0,0,0,0.08)"
        />
      </ReactFlow>
    </div>
  );
}
