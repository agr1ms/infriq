import type { GeneratedSchema } from "@dbpilot/shared-types";
import type { Edge, Node } from "reactflow";

const COL_W = 300;
const ROW_H = 260;

export function tableNodeId(tableName: string): string {
  return `table-${tableName}`;
}

export function schemaToFlowElements(schema: GeneratedSchema): { nodes: Node[]; edges: Edge[] } {
  const tables = schema.tables;
  const n = tables.length;
  const cols = Math.max(1, Math.ceil(Math.sqrt(n)));

  const tableNames = new Set(tables.map((t) => t.name));

  const nodes: Node[] = tables.map((t, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    return {
      id: tableNodeId(t.name),
      type: "tableNode",
      position: { x: col * COL_W, y: row * ROW_H },
      data: {
        label: t.name,
        purpose: t.purpose,
        columns: t.columns.map((c) => ({
          name: c.name,
          type: c.type,
          constraints: c.constraints ?? [],
        })),
      },
    };
  });

  const edges: Edge[] = schema.relationships
    .filter((r) => tableNames.has(r.fromTable) && tableNames.has(r.toTable))
    .map((r, i) => ({
      id: `rel-${i}-${r.fromTable}-${r.toTable}`,
      source: tableNodeId(r.fromTable),
      target: tableNodeId(r.toTable),
      sourceHandle: "right",
      targetHandle: "left",
      type: "smoothstep",
      animated: true,
      label: r.type,
      style: { stroke: "#6366f1" },
      labelStyle: { fill: "#64748b", fontSize: 11 },
      labelBgStyle: { fill: "#f8fafc" },
    }));

  return { nodes, edges };
}
