import type { ILLMClient, LLMMessage, LLMOptions, LLMResponse } from "./types.js";

/**
 * Anthropic Claude via @anthropic-ai/sdk.
 * Install: npm install @anthropic-ai/sdk
 */
export function createAnthropicClient(apiKey: string): ILLMClient {
  // Dynamic import so API works without the dependency if using another provider
  const getClient = async () => {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    return new Anthropic({ apiKey });
  };

  return {
    async chat(messages: LLMMessage[], options?: LLMOptions): Promise<LLMResponse> {
      const client = await getClient();
      const system = options?.system ?? "";
      const maxTokens = options?.maxTokens ?? 4096;
      const model = options?.model ?? "claude-3-5-haiku-20241022";

      // Anthropic: system + alternating user/assistant messages
      const apiMessages = messages
        .filter((m) => m.role !== "system")
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

      const response = await client.messages.create({
        model,
        max_tokens: maxTokens,
        system: system || undefined,
        messages: apiMessages,
      });

      const block = response.content.find((b) => b.type === "text");
      const text = block && "text" in block ? block.text : "";

      const usage =
        response.usage &&
        "input_tokens" in response.usage
          ? { prompt: response.usage.input_tokens, completion: response.usage.output_tokens }
          : undefined;

      return { text, usage };
    },
  };
}
