import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { MealType } from '@prisma/client';
import { AiNotConfiguredException } from './errors/ai-not-configured.exception';
import { GeminiService } from './gemini.service';
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
  { ok: true; data: GeminiChatResponse } | { ok: false };

function extractJsonText(raw: string): string {
  // Gemini's JSON mode should already return bare JSON, but strip markdown
  // code fences defensively in case the model still wraps it.
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1] : trimmed;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly gemini: GeminiService) {}

  isConfigured(): boolean {
    return this.gemini.isConfigured();
  }

  /**
   * Single Gemini call per user chat message. Validates the JSON response
   * with Zod; on failure, retries once with a corrective follow-up prompt.
   * If it still fails, returns `{ ok: false }` so the caller can persist a
   * plain apologetic assistant message instead of throwing a hard 500 —
   * chat must stay usable even when the model misbehaves.
   */
  async generateChatReply(
    context: AiContext,
    userMessage: string,
  ): Promise<ChatGenerationResult> {
    if (!this.gemini.isConfigured()) throw new AiNotConfiguredException();

    const prompt = buildChatPrompt(context, userMessage);

    const first = await this.tryGenerateChat(prompt);
    if (first) return { ok: true, data: first };

    this.logger.warn(
      'Gemini chat response failed schema validation, retrying once',
    );
    const retryPrompt = buildCorrectivePrompt(prompt);
    const second = await this.tryGenerateChat(retryPrompt);
    if (second) return { ok: true, data: second };

    this.logger.error(
      'Gemini chat response failed schema validation twice, falling back',
    );
    return { ok: false };
  }

  private async tryGenerateChat(
    prompt: string,
  ): Promise<GeminiChatResponse | null> {
    try {
      const raw = await this.gemini.generateJson(prompt);
      const parsed = JSON.parse(extractJsonText(raw));
      const result = GeminiChatResponseSchema.safeParse(parsed);
      return result.success ? result.data : null;
    } catch (err) {
      this.logger.warn(
        `Gemini chat generation attempt failed: ${(err as Error).message}`,
      );
      return null;
    }
  }

  /**
   * Used by POST /recommendations (and internally by the chat flow when a
   * message is recommendation-shaped). Unlike chat, this endpoint's
   * contract requires >= 3 recommendations always, so there is no
   * graceful plain-text fallback — after one retry it surfaces a 502
   * rather than silently returning an empty/invalid list.
   */
  async generateRecommendations(
    context: AiContext,
    mealTypeHint?: MealType,
  ): Promise<GeminiRecommendationsResponse> {
    if (!this.gemini.isConfigured()) throw new AiNotConfiguredException();

    const prompt = buildRecommendationsPrompt(context, mealTypeHint);

    const first = await this.tryGenerateRecommendations(prompt);
    if (first) return first;

    this.logger.warn(
      'Gemini recommendations response failed schema validation, retrying once',
    );
    const retryPrompt = buildCorrectivePrompt(prompt);
    const second = await this.tryGenerateRecommendations(retryPrompt);
    if (second) return second;

    this.logger.error(
      'Gemini recommendations response failed schema validation twice',
    );
    throw new BadGatewayException(
      'AI recommendation generation failed, please try again',
    );
  }

  private async tryGenerateRecommendations(
    prompt: string,
  ): Promise<GeminiRecommendationsResponse | null> {
    try {
      const raw = await this.gemini.generateJson(prompt);
      const parsed = JSON.parse(extractJsonText(raw));
      const result = GeminiRecommendationsResponseSchema.safeParse(parsed);
      return result.success ? result.data : null;
    } catch (err) {
      this.logger.warn(
        `Gemini recommendations generation attempt failed: ${(err as Error).message}`,
      );
      return null;
    }
  }
}
