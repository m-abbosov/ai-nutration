import Anthropic from '@anthropic-ai/sdk';
import {
  AiProviderClient,
  ProviderCallError,
  ProviderUsage,
} from './provider.types';

export class ClaudeProvider implements AiProviderClient {
  constructor(
    private readonly apiKey: string,
    public readonly model: string,
  ) {}

  async generateJson(
    prompt: string,
  ): Promise<{ text: string; usage: ProviderUsage | null }> {
    try {
      const client = new Anthropic({ apiKey: this.apiKey });
      const result = await client.messages.create({
        model: this.model,
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      });
      const block = result.content[0];
      const usage: ProviderUsage | null = result.usage
        ? {
            promptTokens: result.usage.input_tokens ?? null,
            completionTokens: result.usage.output_tokens ?? null,
            totalTokens:
              result.usage.input_tokens != null &&
              result.usage.output_tokens != null
                ? result.usage.input_tokens + result.usage.output_tokens
                : null,
          }
        : null;
      return { text: block?.type === 'text' ? block.text : '', usage };
    } catch (err) {
      throw classifyClaudeError(err);
    }
  }
}

function classifyClaudeError(err: unknown): ProviderCallError {
  if (err instanceof Anthropic.APIError) {
    if (err.status === 401 || err.status === 403) {
      return new ProviderCallError('INVALID_KEY', err.message);
    }
    // Anthropic reports "no funds on the account" as a 400 invalid_request_error
    // (not 429) — e.g. {"type":"invalid_request_error","message":"Your credit
    // balance is too low to access the Anthropic API. ..."}. Without this,
    // a zero-balance key falls through to the generic UNKNOWN message below.
    if (err.status === 429 || /credit balance is too low/i.test(err.message)) {
      return new ProviderCallError('EXHAUSTED', err.message);
    }
  }
  const message = err instanceof Error ? err.message : String(err);
  return new ProviderCallError('UNKNOWN', message);
}
