/** Token usage as reported by a provider SDK response. Every field is only
 * ever the real number the SDK returned — never estimated/computed — so any
 * field the provider didn't include stays `null` (see docs/ADMIN_PANEL.md,
 * "AI request logging & privacy"). */
export interface ProviderUsage {
  promptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
}

/** Common shape every AI provider client implements — a single-turn prompt
 * in, raw text (+ usage, if the SDK response included it) out. Callers
 * (AiService) are responsible for JSON parsing and Zod validation, so this
 * stays provider-agnostic. */
export interface AiProviderClient {
  /** The exact model string this client was constructed with — surfaced so
   * callers can log it without reaching into provider internals. */
  readonly model: string;
  generateJson(
    prompt: string,
  ): Promise<{ text: string; usage: ProviderUsage | null }>;
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
