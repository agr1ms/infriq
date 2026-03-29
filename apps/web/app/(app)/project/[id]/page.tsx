"use client";

import { ChangeEvent, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import type { GeneratedSchema } from "@dbpilot/shared-types";
import { api, getErrorMessage } from "@/lib/api";
import type { ProjectDetailResponse, GenerateSchemaResponse } from "@/types";
import { SchemaTableCards } from "@/components/schema/SchemaTableCards";

const SchemaErDiagram = dynamic(
  () => import("@/components/er-diagram/SchemaErDiagram").then((m) => m.SchemaErDiagram),
  {
    ssr: false,
    loading: () => (
      <div className="h-[min(70vh,560px)] min-h-[360px] flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-500 text-sm">
        Loading diagram…
      </div>
    ),
  }
);

function isGeneratedSchema(value: unknown): value is GeneratedSchema {
  if (!value || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  return Array.isArray(o.tables) && Array.isArray(o.relationships);
}

export default function ProjectPage() {
  const params = useParams();
  const id = params?.id as string;

  const [projectName, setProjectName] = useState<string | null>(null);
  const [prdText, setPrdText] = useState("");
  const [generatedSchema, setGeneratedSchema] = useState<GeneratedSchema | null>(null);
  const [rawSchemaJson, setRawSchemaJson] = useState("");

  const [projectLoading, setProjectLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const canSubmit = prdText.trim().length >= 20 && !isSubmitting;

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    setProjectLoading(true);
    setError("");

    api
      .get<ProjectDetailResponse>(`/api/projects/${id}`)
      .then((res) => {
        if (cancelled) return;
        const p = res.data.project;
        setProjectName(p.name);
        setPrdText(p.prdText ?? "");
        if (p.generatedSchema && isGeneratedSchema(p.generatedSchema)) {
          setGeneratedSchema(p.generatedSchema);
          setRawSchemaJson(JSON.stringify(p.generatedSchema, null, 2));
        }
      })
      .catch(() => {
        if (!cancelled) setError("Could not load project.");
      })
      .finally(() => {
        if (!cancelled) setProjectLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const content = await file.text();
      setPrdText(content);
      setError("");
      setSuccessMessage("Loaded PRD from file.");
    } catch {
      setError("Could not read file. Please try a .txt or .md file.");
    } finally {
      e.target.value = "";
    }
  }

  async function handleGenerate() {
    setError("");
    setSuccessMessage("");
    setRawSchemaJson("");
    setGeneratedSchema(null);
    setIsSubmitting(true);
    try {
      const { data } = await api.post<GenerateSchemaResponse>("/api/schema/generate", {
        prdText: prdText.trim(),
        projectId: id,
      });
      setSuccessMessage(data.message || "Schema generated successfully.");
      setRawSchemaJson(JSON.stringify(data.schema, null, 2));
      if (isGeneratedSchema(data.schema)) {
        setGeneratedSchema(data.schema);
      }
    } catch (err) {
      setError(getErrorMessage(err, "Failed to generate schema"));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (projectLoading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading project…</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{projectName ?? "Project"}</h1>
      <p className="text-gray-500 mt-2">
        Paste your PRD and generate a schema draft. Saved PRD and schema reload when you open this page again.
      </p>

      <div className="mt-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-4">
        <div className="space-y-2">
          <label htmlFor="prd-text" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            PRD Input
          </label>
          <textarea
            id="prd-text"
            value={prdText}
            onChange={(e) => setPrdText(e.target.value)}
            placeholder="Describe the product requirements, entities, and expected workflows..."
            className="w-full min-h-56 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-3 text-sm"
          />
          <p className="text-xs text-gray-500">Minimum 20 characters.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label
            htmlFor="prd-file"
            className="cursor-pointer text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Upload .txt/.md
          </label>
          <input
            id="prd-file"
            type="file"
            accept=".txt,.md,.markdown,text/plain,text/markdown"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canSubmit}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Generating..." : "Generate Schema"}
          </button>
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        {successMessage && <p className="text-sm text-green-600 dark:text-green-400">{successMessage}</p>}
      </div>

      {generatedSchema && (
        <div className="mt-8 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Tables</h2>
            <SchemaTableCards schema={generatedSchema} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">ER Diagram</h2>
            <SchemaErDiagram schema={generatedSchema} />
          </div>

          {generatedSchema.relationships.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Relationships</h2>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                {generatedSchema.relationships.map((r, i) => (
                  <li key={`${r.fromTable}-${r.toTable}-${i}`}>
                    <span className="font-mono text-gray-800 dark:text-gray-200">{r.fromTable}</span>
                    <span className="mx-1">.</span>
                    <span className="font-mono">{r.fromColumn}</span>
                    <span className="mx-2 text-gray-400">→</span>
                    <span className="font-mono text-gray-800 dark:text-gray-200">{r.toTable}</span>
                    <span className="mx-1">.</span>
                    <span className="font-mono">{r.toColumn}</span>
                    <span className="ml-2 text-indigo-600 dark:text-indigo-400">({r.type})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {rawSchemaJson && (
        <details className="mt-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4">
          <summary className="text-sm font-semibold text-gray-900 dark:text-gray-100 cursor-pointer">
            Raw schema JSON
          </summary>
          <pre className="mt-3 text-xs overflow-auto text-gray-800 dark:text-gray-200">{rawSchemaJson}</pre>
        </details>
      )}
    </div>
  );
}
