import { ServiceUnavailableException } from '@nestjs/common';

/** Thrown whenever a Gemini-backed endpoint is invoked but GEMINI_API_KEY
 * is not set. Controllers let this propagate — Nest turns it into a 503
 * with a friendly message; the process itself never crashes on missing
 * AI config, only individual AI-dependent requests fail. */
export class AiNotConfiguredException extends ServiceUnavailableException {
  constructor() {
    super('AI is not configured');
  }
}
