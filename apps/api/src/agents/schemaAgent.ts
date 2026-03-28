import { getLLMClient } from "../llm/provider.js";
import { jsonrepair } from "jsonrepair";

interface GeneratedSchema {
  tables: Array<{
    name: string;
    purpose: string;
    columns: Array<{
      name: string;
      type: string;
      constraints: string[];
      defaultValue?: string;
    }>;
  }>;
  relationships: Array<{
    fromTable: string;
    fromColumn: string;
    toTable: string;
    toColumn: string;
    type: "one-to-one" | "one-to-many" | "many-to-many";
  }>;
}

const schemaOutputSpec = `Return ONLY valid JSON with this exact shape:
{
  "tables": [
    {
      "name": "string",
      "purpose": "string",
      "columns": [
        {
          "name": "string",
          "type": "string",
          "constraints": ["string"],
          "defaultValue": "string (optional)"
        }
      ]
    }
  ],
  "relationships": [
    {
      "fromTable": "string",
      "fromColumn": "string",
      "toTable": "string",
      "toColumn": "string",
      "type": "one-to-one | one-to-many | many-to-many"
    }
  ]
}`;

function extractJsonObject(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1);
  }
  return text.trim();
}

function isGeneratedSchema(value: unknown): value is GeneratedSchema {
  if (!value || typeof value !== "object") return false;
  const v = value as { tables?: unknown; relationships?: unknown };
  return Array.isArray(v.tables) && Array.isArray(v.relationships);
}

export async function runSchemaAgent(prdText: string): Promise<GeneratedSchema> {
  const llm = getLLMClient();

  const response = await llm.chat(
    [{ role: "user", content: `Generate a relational database schema for this PRD:\n\n${prdText}` }],
    {
      system:
        "You are an expert database architect. Produce a strictly minimal PostgreSQL schema.\n" +
        "CRITICAL: Keep 'purpose' and 'constraints' under 5 words. Omit obvious constraints like 'NOT NULL'.\n" +
        "DO NOT use whitespace formatting outside of strings. Output raw, minified JSON to save tokens.\n" +
        schemaOutputSpec,
      temperature: 0.2,
      maxTokens: 8192,
    }
  );

  let jsonText = extractJsonObject(response.text);
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch (err) {
    try {
      jsonText = jsonrepair(jsonText);
      parsed = JSON.parse(jsonText);
    } catch (repairErr) {
      throw new Error(`Failed to parse schema. Length: ${jsonText.length}. Error: ${err}`);
    }
  }

  if (!isGeneratedSchema(parsed)) {
    throw new Error("Schema agent returned an invalid schema shape");
  }

  return parsed;
}
