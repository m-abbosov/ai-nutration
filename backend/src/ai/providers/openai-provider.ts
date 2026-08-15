import OpenAI from 'openai';
import { AiProviderClient, ProviderCallError } from './provider.types';

export class OpenAiProvider implements AiProviderClient {
  constructor(
    private readonly apiKey: string,
    private readonly model: string,
  ) {}

  async generateJson(prompt: string): Promise<string> {
    try {
      const client = new OpenAI({ apiKey: this.apiKey });
      const result = await client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });
      return result.choices[0]?.message?.content ?? '';
    } catch (err) {
      throw classifyOpenAiError(err);
    }
  }
}

function classifyOpenAiError(err: unknown): ProviderCallError {
  if (err instanceof OpenAI.APIError) {
    if (err.status === 401 || err.code === 'invalid_api_key') {
      return new ProviderCallError('INVALID_KEY', err.message);
    }
    if (err.status === 429 || err.code === 'insufficient_quota') {
      return new ProviderCallError('EXHAUSTED', err.message);
    }
  }
  const message = err instanceof Error ? err.message : String(err);
  return new ProviderCallError('UNKNOWN', message);
}
