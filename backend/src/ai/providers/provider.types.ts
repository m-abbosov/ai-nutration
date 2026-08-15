/** Common shape every AI provider client implements — a single-turn prompt
 * in, raw text out. Callers (AiService) are responsible for JSON parsing
 * and Zod validation, so this stays provider-agnostic. */
export interface AiProviderClient {
  generateJson(prompt: string): Promise<string>;
}

/** How a provider call failure should be treated. Distinguishing these lets
 * the caller show the user a specific, actionable message instead of a
 * generic "something went wrong". */
export type ProviderErrorReason = 'INVALID_KEY' | 'EXHAUSTED' | 'UNKNOWN';

export class ProviderCallError extends Error {
  constructor(
    public readonly reason: ProviderErrorReason,
    message: string,
  ) {
    super(message);
    this.name = 'ProviderCallError';
  }
}
