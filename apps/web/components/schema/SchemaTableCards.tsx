"use client";

import type { GeneratedSchema } from "@dbpilot/shared-types";

type Props = {
  schema: GeneratedSchema;
};

export function SchemaTableCards({ schema }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {schema.tables.map((table) => (
        <article
          key={table.name}
          className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden flex flex-col"
        >
          <header className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <h3 className="font-semibold text-gray-900 dark:text-white">{table.name}</h3>
            {table.purpose && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{table.purpose}</p>}
          </header>
          <div className="p-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                  <th className="pb-2 pr-2 font-medium">Column</th>
                  <th className="pb-2 pr-2 font-medium">Type</th>
                  <th className="pb-2 font-medium">Constraints</th>
                </tr>
              </thead>
              <tbody>
                {table.columns.map((col) => (
                  <tr key={col.name} className="border-b border-gray-50 dark:border-gray-800 last:border-0">
                    <td className="py-2 pr-2 font-mono text-gray-900 dark:text-gray-100">{col.name}</td>
                    <td className="py-2 pr-2 text-indigo-600 dark:text-indigo-400">{col.type}</td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">
                      {(col.constraints?.length ?? 0) > 0 ? col.constraints.join(", ") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      ))}
    </div>
  );
}
