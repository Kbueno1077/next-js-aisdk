import { openai as originalOpenAI } from "@ai-sdk/openai";
import {
  customProvider,
  defaultSettingsMiddleware,
  wrapLanguageModel,
  createProviderRegistry,
} from "ai";

// import {anthropic} from "@ai-sdk/anthropic"

const customOpenai = customProvider({
  languageModels: {
    fast: originalOpenAI("gpt-5-nano"),
    smart: originalOpenAI("gpt-5-mini"),

    reasoning: wrapLanguageModel({
      model: originalOpenAI("gpt-5-nano"),
      middleware: defaultSettingsMiddleware({
        settings: {
          providerOptions: {
            openai: {
              reasoningEffort: "low",
              reasoningSummary: "auto",
            },
          },
        },
      }),
    }),
  },
  fallbackProvider: originalOpenAI,
});

const customAnthropic = customProvider({
  languageModels: {
    // fast: anthropic("claude-3-5-haiku-20250305"),
    // smart: anthropic("claude-sonnet-4-20250305"),
  },
  //   fallbackProvider: anthropic,
});

export const registry = createProviderRegistry({
  openai: customOpenai,
  anthropic: customAnthropic,
});
