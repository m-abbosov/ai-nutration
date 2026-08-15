import Anthropic from '@anthropic-ai/sdk';
import { AiProviderClient, ProviderCallError } from './provider.types';

export class ClaudeProvider implements AiProviderClient {
  constructor(
    private readonly apiKey: string,
    private readonly model: string,
  ) {}

  async generateJson(prompt: string): Promise<string> {
    try {
      const client = new Anthropic({ apiKey: this.apiKey });
      const result = await client.messages.create({
        model: this.model,
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      });
      const block = result.content[0];
      return block?.type === 'text' ? block.text : '';
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
    if (err.status === 429) {
      return new ProviderCallError('EXHAUSTED', err.message);
    }
  }
  const message = err instanceof Error ? err.message : String(err);
  return new ProviderCallError('UNKNOWN', message);
}
