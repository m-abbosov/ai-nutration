import OpenAI from 'openai';
import {
  AiProviderClient,
  ProviderCallError,
  ProviderUsage,
} from './provider.types';

export class OpenAiProvider implements AiProviderClient {
  constructor(
    private readonly apiKey: string,
    public readonly model: string,
    /** Overridden for OpenAI-compatible providers (e.g. Groq) that reuse this
     * same request/response/error shape via a different endpoint. */
    private readonly baseURL?: string,
  ) {}

  async generateJson(
    prompt: string,
  ): Promise<{ text: string; usage: ProviderUsage | null }> {
    try {
      const client = new OpenAI({ apiKey: this.apiKey, baseURL: this.baseURL });
      const result = await client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });
      const usage: ProviderUsage | null = result.usage
        ? {
            promptTokens: result.usage.prompt_tokens ?? null,
            completionTokens: result.usage.completion_tokens ?? null,
            totalTokens: result.usage.total_tokens ?? null,
          }
        : null;
      return { text: result.choices[0]?.message?.content ?? '', usage };
    } catch (err) {
      throw classifyOpenAiError(err);
    }
  }
}

function classifyOpenAiError(err: unknown): ProviderCallError {
  if (err instanceof OpenAI.APIError) {
    if (
      err.status === 401 ||
      err.status === 403 ||
      err.code === 'invalid_api_key'
    ) {
      return new ProviderCallError('INVALID_KEY', err.message);
    }
    // Billing/quota failures aren't always a 429 — e.g. a project with no
    // payment method attached returns 400 `billing_hard_limit_reached`, so
    // fall back to matching the code/message rather than status alone.
    if (
      err.status === 429 ||
      err.code === 'insufficient_quota' ||
      err.code === 'billing_hard_limit_reached' ||
      /quota|billing|credit balance/i.test(err.message)
    ) {
      return new ProviderCallError('EXHAUSTED', err.message);
    }
  }
  const message = err instanceof Error ? err.message : String(err);
  return new ProviderCallError('UNKNOWN', message);
}
