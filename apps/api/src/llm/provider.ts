import type { ILLMClient, LLMMessage, LLMOptions, LLMProvider, LLMResponse } from "./types.js";
import { createAnthropicClient } from "./anthropic.js";
import { createGeminiClient } from "./gemini.js";
import { createOpenRouterClient } from "./openrouter.js";

const provider = (process.env.LLM_PROVIDER ?? "anthropic").toLowerCase() as LLMProvider;
const anthropicKey = process.env.ANTHROPIC_API_KEY;
const googleKey = process.env.GOOGLE_API_KEY ?? process.env.GEMINI_API_KEY;
const openRouterKey = process.env.OPENROUTER_API_KEY;

function createClient(): ILLMClient {
  switch (provider) {
    case "anthropic":
      if (!anthropicKey) throw new Error("ANTHROPIC_API_KEY is required when LLM_PROVIDER=anthropic");
      return createAnthropicClient(anthropicKey);
    case "gemini":
      if (!googleKey) throw new Error("GOOGLE_API_KEY or GEMINI_API_KEY is required when LLM_PROVIDER=gemini");
      return createGeminiClient(googleKey);
    case "openrouter":
      if (!openRouterKey) throw new Error("OPENROUTER_API_KEY is required when LLM_PROVIDER=openrouter");
      return createOpenRouterClient(openRouterKey);
    default:
      throw new Error(`Unknown LLM_PROVIDER: ${provider}. Use anthropic | gemini | openrouter`);
  }
}

let cached: ILLMClient | null = null;

/**
 * Get the configured LLM client (singleton).
 * Set LLM_PROVIDER and the corresponding API key in .env.
 */
export function getLLMClient(): ILLMClient {
  if (!cached) cached = createClient();
  return cached;
}

export type { ILLMClient, LLMMessage, LLMOptions, LLMResponse, LLMProvider };
