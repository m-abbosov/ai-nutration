import { Injectable, Logger } from '@nestjs/common';
import { AiEndpoint, AiProvider, MealType } from '@prisma/client';
import { AiRequestLogService } from './ai-request-log.service';
import { ProviderFactory } from './providers/provider.factory';
import {
  AiProviderClient,
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

  constructor(
    private readonly providerFactory: ProviderFactory,
    private readonly aiRequestLogService: AiRequestLogService,
  ) {}

  /** Cheap live check used when a user saves a new API key in Settings —
   * confirms the key actually works before it's persisted. Not logged to
   * AiRequestLog — it's a key-validation probe, not a chat/recommendation
   * generation attempt. */
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
      if (err instanceof ProviderCallError) {
        if (err.reason === 'UNKNOWN') {
          this.logger.warn(
            `testKey(${provider}) unclassified failure: ${err.message}`,
          );
        }
        return { ok: false, reason: err.reason };
      }
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `testKey(${provider}) threw a non-provider error: ${message}`,
      );
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
    userId: string,
  ): Promise<ChatGenerationResult> {
    const client = this.providerFactory.create(provider, apiKey);
    const prompt = buildChatPrompt(context, userMessage, isFirstMessage);
    const logCtx = { userId, endpoint: 'CHAT' as AiEndpoint, provider };

    const first = await this.tryGenerate(
      client,
      prompt,
      GeminiChatResponseSchema,
      logCtx,
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
      logCtx,
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
    userId: string,
    mealTypeHint?: MealType,
  ): Promise<RecommendationsGenerationResult> {
    const client = this.providerFactory.create(provider, apiKey);
    const prompt = buildRecommendationsPrompt(context, mealTypeHint);
    const logCtx = {
      userId,
      endpoint: 'RECOMMENDATION' as AiEndpoint,
      provider,
    };

    const first = await this.tryGenerate(
      client,
      prompt,
      GeminiRecommendationsResponseSchema,
      logCtx,
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
      logCtx,
    );
    if (second.ok) return { ok: true, data: second.data };

    this.logger.error(
      'AI recommendations response failed schema validation twice',
    );
    return { ok: false, reason: second.reason };
  }

  /**
   * Runs one provider call attempt (an initial try or a schema-validation
   * retry are each a separate call to this method) and writes exactly one
   * `AiRequestLog` row for it, timed end-to-end including JSON parse/schema
   * validation. Logging never throws — a failure to write the log row must
   * not turn a successful (or already-failed) generation into a 500.
   */
  private async tryGenerate<T>(
    client: AiProviderClient,
    prompt: string,
    schema: { safeParse: (v: unknown) => { success: boolean; data?: T } },
    logCtx: { userId: string; endpoint: AiEndpoint; provider: AiProvider },
  ): Promise<
    | { ok: true; data: T }
    | { ok: false; reason: ProviderErrorReason | 'GENERATION_FAILED' }
  > {
    const startedAt = Date.now();
    try {
      const { text, usage } = await client.generateJson(prompt);
      const responseTimeMs = Date.now() - startedAt;
      const parsed = JSON.parse(extractJsonText(text));
      const result = schema.safeParse(parsed);
      if (result.success && result.data !== undefined) {
        await this.aiRequestLogService.record({
          ...logCtx,
          model: client.model,
          status: 'SUCCESS',
          errorReason: null,
          responseTimeMs,
          usage,
        });
        return { ok: true, data: result.data };
      }
      await this.aiRequestLogService.record({
        ...logCtx,
        model: client.model,
        status: 'ERROR',
        errorReason: 'GENERATION_FAILED',
        responseTimeMs,
        usage,
      });
      return { ok: false, reason: 'GENERATION_FAILED' };
    } catch (err) {
      const responseTimeMs = Date.now() - startedAt;
      const reason =
        err instanceof ProviderCallError ? err.reason : 'GENERATION_FAILED';
      await this.aiRequestLogService.record({
        ...logCtx,
        model: client.model,
        status: 'ERROR',
        errorReason: reason,
        responseTimeMs,
        usage: null,
      });
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
