import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '../config/env.validation';
import { AiNotConfiguredException } from './errors/ai-not-configured.exception';

/**
 * Thin wrapper around @google/generative-ai. This is the ONLY place in the
 * codebase that talks to Gemini directly — controllers/services elsewhere
 * go through AiService instead.
 */
@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly client: GoogleGenerativeAI | null;
  private readonly modelName: string;

  constructor(private readonly configService: ConfigService<EnvConfig, true>) {
    const apiKey = this.configService.get('GEMINI_API_KEY', { infer: true });
    this.modelName = this.configService.get('GEMINI_MODEL', { infer: true });
    // Constructing the client with an empty key is harmless (no network
    // call happens until generateContent is invoked) — we simply refuse to
    // use it in isConfigured()/assertConfigured() below. This keeps app
    // boot independent of whether GEMINI_API_KEY is set.
    this.client = apiKey ? new GoogleGenerativeAI(apiKey) : null;
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  private assertConfigured(): GoogleGenerativeAI {
    if (!this.client) throw new AiNotConfiguredException();
    return this.client;
  }

  /** Sends a single-turn prompt and asks Gemini to respond with strict
   * JSON (responseMimeType: application/json). Returns the raw text —
   * callers are responsible for parsing + Zod validation. */
  async generateJson(prompt: string): Promise<string> {
    const client = this.assertConfigured();
    const model = client.getGenerativeModel({
      model: this.modelName,
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  /** Lightweight connectivity probe used by GET /health/gemini — does not
   * make a network call, just reports whether a key is configured. */
  async ping(): Promise<boolean> {
    return this.isConfigured();
  }
}
