import type { ILLMClient, LLMMessage, LLMOptions, LLMResponse } from "./types.js";

const OPENROUTER_BASE = "https://openrouter.ai/api/v1/chat/completions";

/**
 * OpenRouter: single API for many models (Claude, Gemini, Llama, etc.).
 * Install: no extra deps, uses fetch.
 */
export function createOpenRouterClient(apiKey: string): ILLMClient {
  return {
    async chat(messages: LLMMessage[], options?: LLMOptions): Promise<LLMResponse> {
      const model = options?.model ?? "anthropic/claude-3-haiku";
      const maxTokens = options?.maxTokens ?? 4096;
      const system = options?.system;

      const apiMessages: Array<{ role: string; content: string }> = messages.map((m) => ({
        role: m.role === "system" ? "system" : m.role,
        content: m.content,
      }));
      const body: Record<string, unknown> = {
        model,
        max_tokens: maxTokens,
        messages: system ? [{ role: "system", content: system }, ...apiMessages] : apiMessages,
      };

      const res = await fetch(OPENROUTER_BASE, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.FRONTEND_URL ?? "http://localhost:3000",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`OpenRouter API error ${res.status}: ${err}`);
      }

      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string }; finish_reason?: string }>;
        usage?: { prompt_tokens?: number; completion_tokens?: number };
      };

      const text =
        data.choices?.[0]?.message?.content?.trim() ?? "";
      const usage = data.usage
        ? { prompt: data.usage.prompt_tokens ?? 0, completion: data.usage.completion_tokens ?? 0 }
        : undefined;

      return { text, usage };
    },
  };
}
