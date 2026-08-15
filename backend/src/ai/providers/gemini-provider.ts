import {
  GoogleGenerativeAI,
  GoogleGenerativeAIFetchError,
} from '@google/generative-ai';
import {
  AiProviderClient,
  ProviderCallError,
  ProviderUsage,
} from './provider.types';

export class GeminiProvider implements AiProviderClient {
  constructor(
    private readonly apiKey: string,
    public readonly model: string,
  ) {}

  async generateJson(
    prompt: string,
  ): Promise<{ text: string; usage: ProviderUsage | null }> {
    try {
      const client = new GoogleGenerativeAI(this.apiKey);
      const model = client.getGenerativeModel({
        model: this.model,
        generationConfig: { responseMimeType: 'application/json' },
      });
      const result = await model.generateContent(prompt);
      const usageMetadata = result.response.usageMetadata;
      const usage: ProviderUsage | null = usageMetadata
        ? {
            promptTokens: usageMetadata.promptTokenCount ?? null,
            completionTokens: usageMetadata.candidatesTokenCount ?? null,
            totalTokens: usageMetadata.totalTokenCount ?? null,
          }
        : null;
      return { text: result.response.text(), usage };
    } catch (err) {
      throw classifyGeminiError(err);
    }
  }
}

function classifyGeminiError(err: unknown): ProviderCallError {
  if (err instanceof GoogleGenerativeAIFetchError) {
    if (
      err.status === 401 ||
      err.status === 403 ||
      /API_KEY_INVALID/i.test(err.message)
    ) {
      return new ProviderCallError('INVALID_KEY', err.message);
    }
    if (err.status === 429 || /RESOURCE_EXHAUSTED|quota/i.test(err.message)) {
      return new ProviderCallError('EXHAUSTED', err.message);
    }
  }
  const message = err instanceof Error ? err.message : String(err);
  return new ProviderCallError('UNKNOWN', message);
}
