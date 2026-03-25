export type LLMProvider = "anthropic" | "gemini" | "openrouter";

export interface LLMMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface LLMOptions {
  system?: string;
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

export interface LLMResponse {
  text: string;
  usage?: { prompt: number; completion: number };
}

export interface ILLMClient {
  chat(messages: LLMMessage[], options?: LLMOptions): Promise<LLMResponse>;
}
