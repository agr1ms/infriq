import type { ILLMClient, LLMMessage, LLMOptions, LLMResponse } from "./types.js";

/**
 * Google Gemini (e.g. gemini-2.0-flash) via @google/generative-ai.
 * Install: npm install @google/generative-ai
 */
export function createGeminiClient(apiKey: string): ILLMClient {
  const getModel = async (modelId?: string) => {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({
      model: modelId ?? "gemini-2.0-flash",
      generationConfig: { maxOutputTokens: 4096 },
    });
  };

  return {
    async chat(messages: LLMMessage[], options?: LLMOptions): Promise<LLMResponse> {
      const model = await getModel(options?.model);
      const system = options?.system ?? "";
      const maxTokens = options?.maxTokens ?? 4096;

      // Gemini: concatenate system + conversation into a single prompt for simple chat
      const parts: string[] = [];
      if (system) parts.push(`System: ${system}\n\n`);
      for (const m of messages) {
        parts.push(`${m.role === "user" ? "User" : "Assistant"}: ${m.content}\n\n`);
      }
      parts.push("Assistant: ");
      const fullPrompt = parts.join("");
      const result = await model.generateContent(fullPrompt);
      const response = result.response;
      const text = response.text() ?? "";
      const usage = response.usageMetadata
        ? {
            prompt: response.usageMetadata.promptTokenCount ?? 0,
            completion: response.usageMetadata.candidatesTokenCount ?? 0,
          }
        : undefined;

      return { text, usage };
    },
  };
}
