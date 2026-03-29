"use client";

import { ChangeEvent, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import type { GeneratedSchema } from "@dbpilot/shared-types";
import { api, getErrorMessage } from "@/lib/api";
import type { ProjectDetailResponse, GenerateSchemaResponse } from "@/types";
import { SchemaTableCards } from "@/components/schema/SchemaTableCards";
import { FiLoader, FiZap, FiDatabase, FiShare2, FiList, FiLink, FiCode, FiChevronDown } from "react-icons/fi";

const SchemaErDiagram = dynamic(
  () => import("@/components/er-diagram/SchemaErDiagram").then((m) => m.SchemaErDiagram),
  {
    ssr: false,
    loading: () => (
      <div className="h-[min(70vh,560px)] min-h-[360px] flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 text-gray-500 text-sm">
        <div className="flex items-center gap-2">
          <FiLoader className="animate-spin h-5 w-5 text-gray-400" />
          Loading diagram…
        </div>
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2 text-gray-400">
          <FiLoader className="animate-spin h-5 w-5" />
          <span className="text-sm">Loading project details…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto h-[calc(100vh-theme(spacing.16))] lg:h-screen flex flex-col">
      <div className="mb-6 shrink-0">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          {projectName ?? "Project"}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Paste your Product Requirements Document (PRD) to generate a database schema.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 flex-1 min-h-0">
        
        <div className="w-full lg:w-[400px] xl:w-[480px] flex flex-col shrink-0">
          <div className="card flex flex-col h-full">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50 rounded-t-xl">
              <h2 className="font-semibold text-gray-900 dark:text-white">PRD Input</h2>
              <div className="flex items-center gap-2">
                <label
                  htmlFor="prd-file"
                  className="cursor-pointer text-xs font-medium px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Upload File
                </label>
                <input
                  id="prd-file"
                  type="file"
                  accept=".txt,.md,.markdown,text/plain,text/markdown"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
            
            <div className="flex-1 p-5 flex flex-col">
              <textarea
                id="prd-text"
                value={prdText}
                onChange={(e) => setPrdText(e.target.value)}
                placeholder="Describe the product requirements, entities, and expected workflows here..."
                className="w-full flex-1 min-h-[250px] resize-none border-0 bg-transparent p-0 text-gray-900 dark:text-gray-100 text-sm focus:ring-0 placeholder:text-gray-400 dark:placeholder:text-gray-600 outline-none"
              />
            </div>

            <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 rounded-b-xl flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  {prdText.length} characters (min 20)
                </span>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={!canSubmit}
                  className="btn-primary gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <FiLoader className="animate-spin h-4 w-4" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <FiZap className="w-4 h-4" />
                      Generate Schema
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg border border-red-100 dark:border-red-900/50">
                  {error}
                </div>
              )}
              {successMessage && (
                <div className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg border border-green-100 dark:border-green-900/50">
                  {successMessage}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          {!generatedSchema ? (
            <div className="card h-full flex flex-col items-center justify-center p-12 text-center text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-900/50 border-dashed border-2">
              <FiDatabase className="w-12 h-12 mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No schema generated yet</h3>
              <p className="text-sm max-w-sm">
                Enter your requirements on the left and click &quot;Generate Schema&quot; to see the magic happen.
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-2 space-y-8 pb-8 custom-scrollbar">
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <FiShare2 className="w-5 h-5 text-brand-500" />
                    ER Diagram
                  </h2>
                </div>
                <div className="card overflow-hidden">
                  <SchemaErDiagram schema={generatedSchema} className="h-[400px] w-full" />
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <FiList className="w-5 h-5 text-brand-500" />
                    Tables
                  </h2>
                </div>
                <SchemaTableCards schema={generatedSchema} />
              </section>

              {generatedSchema.relationships.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <FiLink className="w-5 h-5 text-brand-500" />
                      Relationships
                    </h2>
                  </div>
                  <div className="card p-4">
                    <ul className="text-sm space-y-2 divide-y divide-gray-100 dark:divide-gray-800">
                      {generatedSchema.relationships.map((r, i) => (
                        <li key={`${r.fromTable}-${r.toTable}-${i}`} className="pt-2 first:pt-0 flex flex-wrap items-center gap-2">
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded font-mono text-gray-800 dark:text-gray-200">
                            {r.fromTable}.<span className="text-gray-500 dark:text-gray-400">{r.fromColumn}</span>
                          </span>
                          <span className="text-gray-400">→</span>
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded font-mono text-gray-800 dark:text-gray-200">
                            {r.toTable}.<span className="text-gray-500 dark:text-gray-400">{r.toColumn}</span>
                          </span>
                          <span className="ml-auto text-xs font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/40 px-2 py-1 rounded">
                            {r.type}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              )}

              {rawSchemaJson && (
                <section>
                  <details className="group card">
                    <summary className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white cursor-pointer list-none flex items-center justify-between border-b border-transparent group-open:border-gray-200 dark:group-open:border-gray-800 transition-colors">
                      <span className="flex items-center gap-2">
                        <FiCode className="w-5 h-5 text-gray-400" />
                        Raw JSON View
                      </span>
                      <FiChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-b-xl overflow-x-auto">
                      <pre className="text-xs font-mono text-gray-800 dark:text-gray-300">
                        {rawSchemaJson}
                      </pre>
                    </div>
                  </details>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
