import { Injectable, Logger } from '@nestjs/common';
import { AiProvider, MealType } from '@prisma/client';
import { ProviderFactory } from './providers/provider.factory';
import {
  ProviderCallError,
  ProviderErrorReason,
} from './providers/provider.types';
import {
  buildChatPrompt,
  buildCorrectivePrompt,
  buildRecommendationsPrompt,
} from './prompts';
import {
  GeminiChatResponse,
  GeminiChatResponseSchema,
  GeminiRecommendationsResponse,
  GeminiRecommendationsResponseSchema,
} from './schemas';
import { AiContext } from './types';

export type ChatGenerationResult =
  | { ok: true; data: GeminiChatResponse }
  | { ok: false; reason: ProviderErrorReason | 'GENERATION_FAILED' };

export type RecommendationsGenerationResult =
  | { ok: true; data: GeminiRecommendationsResponse }
  | { ok: false; reason: ProviderErrorReason | 'GENERATION_FAILED' };

function extractJsonText(raw: string): string {
  // Providers' JSON modes should already return bare JSON, but strip markdown
  // code fences defensively in case a model still wraps it.
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1] : trimmed;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly providerFactory: ProviderFactory) {}

  /** Cheap live check used when a user saves a new API key in Settings —
   * confirms the key actually works before it's persisted. */
  async testKey(
    provider: AiProvider,
    apiKey: string,
  ): Promise<{ ok: true } | { ok: false; reason: ProviderErrorReason }> {
    try {
      const client = this.providerFactory.create(provider, apiKey);
      await client.generateJson(
        'Respond with only this exact JSON: {"ok":true}',
      );
      return { ok: true };
    } catch (err) {
      if (err instanceof ProviderCallError)
        return { ok: false, reason: err.reason };
      return { ok: false, reason: 'UNKNOWN' };
    }
  }

  /**
   * Single provider call per user chat message, using that user's own
   * key. Validates the JSON response with Zod; on failure, retries once
   * with a corrective follow-up prompt. If it still fails, returns
   * `{ ok: false }` so the caller can persist a plain apologetic assistant
   * message instead of throwing a hard 500 — chat must stay usable even
   * when the model misbehaves.
   */
  async generateChatReply(
    context: AiContext,
    userMessage: string,
    isFirstMessage: boolean,
    provider: AiProvider,
    apiKey: string,
  ): Promise<ChatGenerationResult> {
    const client = this.providerFactory.create(provider, apiKey);
    const prompt = buildChatPrompt(context, userMessage, isFirstMessage);

    const first = await this.tryGenerate(
      client,
      prompt,
      GeminiChatResponseSchema,
    );
    if (first.ok) return { ok: true, data: first.data };
    if (first.reason !== 'GENERATION_FAILED')
      return { ok: false, reason: first.reason };

    this.logger.warn(
      'AI chat response failed schema validation, retrying once',
    );
    const retryPrompt = buildCorrectivePrompt(prompt);
    const second = await this.tryGenerate(
      client,
      retryPrompt,
      GeminiChatResponseSchema,
    );
    if (second.ok) return { ok: true, data: second.data };

    this.logger.error(
      'AI chat response failed schema validation twice, falling back',
    );
    return { ok: false, reason: second.reason };
  }

  /**
   * Used by POST /recommendations (and internally by the chat flow when a
   * message is recommendation-shaped). Unlike chat, this endpoint's
   * contract requires >= 3 recommendations always, so there is no
   * graceful plain-text fallback — the caller surfaces a typed error.
   */
  async generateRecommendations(
    context: AiContext,
    provider: AiProvider,
    apiKey: string,
    mealTypeHint?: MealType,
  ): Promise<RecommendationsGenerationResult> {
    const client = this.providerFactory.create(provider, apiKey);
    const prompt = buildRecommendationsPrompt(context, mealTypeHint);

    const first = await this.tryGenerate(
      client,
      prompt,
      GeminiRecommendationsResponseSchema,
    );
    if (first.ok) return { ok: true, data: first.data };
    if (first.reason !== 'GENERATION_FAILED')
      return { ok: false, reason: first.reason };

    this.logger.warn(
      'AI recommendations response failed schema validation, retrying once',
    );
    const retryPrompt = buildCorrectivePrompt(prompt);
    const second = await this.tryGenerate(
      client,
      retryPrompt,
      GeminiRecommendationsResponseSchema,
    );
    if (second.ok) return { ok: true, data: second.data };

    this.logger.error(
      'AI recommendations response failed schema validation twice',
    );
    return { ok: false, reason: second.reason };
  }

  private async tryGenerate<T>(
    client: ReturnType<ProviderFactory['create']>,
    prompt: string,
    schema: { safeParse: (v: unknown) => { success: boolean; data?: T } },
  ): Promise<
    | { ok: true; data: T }
    | { ok: false; reason: ProviderErrorReason | 'GENERATION_FAILED' }
  > {
    try {
      const raw = await client.generateJson(prompt);
      const parsed = JSON.parse(extractJsonText(raw));
      const result = schema.safeParse(parsed);
      if (result.success && result.data !== undefined)
        return { ok: true, data: result.data };
      return { ok: false, reason: 'GENERATION_FAILED' };
    } catch (err) {
      if (err instanceof ProviderCallError) {
        this.logger.warn(
          `AI generation attempt failed (${err.reason}): ${err.message}`,
        );
        return { ok: false, reason: err.reason };
      }
      this.logger.warn(
        `AI generation attempt failed: ${(err as Error).message}`,
      );
      return { ok: false, reason: 'GENERATION_FAILED' };
    }
  }
}
