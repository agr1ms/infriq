"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";

interface GenerateSchemaResponse {
  success: boolean;
  message: string;
  schema: unknown;
}

export default function ProjectPage() {
  const params = useParams();
  const id = params?.id as string;
  const [prdText, setPrdText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [responsePreview, setResponsePreview] = useState("");

  const canSubmit = useMemo(() => prdText.trim().length >= 20 && !isSubmitting, [prdText, isSubmitting]);

  async function handleFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      setPrdText(content);
      setError("");
      setSuccessMessage("Loaded PRD from file.");
    } catch {
      setError("Could not read file. Please try a .txt or .md file.");
    } finally {
      event.target.value = "";
    }
  }

  async function handleGenerate() {
    setError("");
    setSuccessMessage("");
    setResponsePreview("");
    setIsSubmitting(true);
    try {
      const { data } = await api.post<GenerateSchemaResponse>("/api/schema/generate", { prdText: prdText.trim() });
      setSuccessMessage(data.message || "Schema generated successfully.");
      setResponsePreview(JSON.stringify(data.schema, null, 2));
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string; message?: string } } }).response?.data?.error ??
            (err as { response?: { data?: { error?: string; message?: string } } }).response?.data?.message ??
            "Failed to generate schema"
          : "Failed to generate schema";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Project {id}</h1>
      <p className="text-gray-500 mt-2">Paste your PRD and generate the first schema draft.</p>

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
          <input id="prd-file" type="file" accept=".txt,.md,.markdown,text/plain,text/markdown" onChange={handleFileUpload} className="hidden" />

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

      {responsePreview && (
        <div className="mt-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Schema JSON (preview)</h2>
          <pre className="text-xs overflow-auto text-gray-800 dark:text-gray-200">{responsePreview}</pre>
        </div>
      )}
    </div>
  );
}
