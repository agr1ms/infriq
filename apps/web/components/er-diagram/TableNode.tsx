"use client";

import { Handle, Position, type NodeProps } from "reactflow";

export type TableNodeData = {
  label: string;
  purpose: string;
  columns: Array<{ name: string; type: string; constraints: string[] }>;
};

export function TableNode({ data }: NodeProps<TableNodeData>) {
  return (
    <div className="rounded-lg border-2 border-indigo-500/80 bg-white dark:bg-gray-900 shadow-md min-w-[220px] max-w-[280px] text-left">
      <Handle type="target" position={Position.Left} id="left" className="!h-2 !w-2 !border-0 !bg-indigo-500" />
      <Handle type="source" position={Position.Right} id="right" className="!h-2 !w-2 !border-0 !bg-indigo-500" />

      <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-indigo-50 dark:bg-indigo-950/40">
        <div className="font-semibold text-sm text-gray-900 dark:text-white truncate" title={data.label}>
          {data.label}
        </div>
        {data.purpose && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2" title={data.purpose}>
            {data.purpose}
          </p>
        )}
      </div>
      <ul className="max-h-40 overflow-y-auto text-xs">
        {data.columns.map((col) => (
          <li
            key={col.name}
            className="px-3 py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0 flex justify-between gap-2"
          >
            <span className="font-mono text-gray-800 dark:text-gray-200 truncate">{col.name}</span>
            <span className="text-indigo-600 dark:text-indigo-400 shrink-0">{col.type}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
