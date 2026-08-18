import type { AiProvider } from "@nutriai/shared/api/types";

/** Where each provider issues its own API keys — linked next to the key input on onboarding/settings. */
export const AI_PROVIDER_KEY_URL: Record<AiProvider, string> = {
  GEMINI: "https://aistudio.google.com/apikey",
  OPENAI: "https://platform.openai.com/api-keys",
  CLAUDE: "https://console.anthropic.com/settings/keys",
  GROQ: "https://console.groq.com/keys",
};

/** Whether the provider has a genuine ongoing free tier (no card needed) vs
 * requiring billing to be set up before the key works at all. Drives the
 * free/paid badge and the billing-explainer dialog on onboarding/settings. */
export const AI_PROVIDER_IS_FREE: Record<AiProvider, boolean> = {
  GEMINI: true,
  GROQ: true,
  OPENAI: false,
  CLAUDE: false,
};
