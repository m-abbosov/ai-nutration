import type { AiProvider } from "@nutriai/shared/api/types";

/** Where each provider issues its own API keys — linked next to the key input on onboarding/settings. */
export const AI_PROVIDER_KEY_URL: Record<AiProvider, string> = {
  GEMINI: "https://aistudio.google.com/apikey",
  OPENAI: "https://platform.openai.com/api-keys",
  CLAUDE: "https://console.anthropic.com/settings/keys",
};
