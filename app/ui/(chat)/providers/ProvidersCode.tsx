import React from "react";
import { CodeBlock } from "../../../../components/ui/code-block";

const frontendCode = `"use client";

/** Imports */

export default function ProvidersChat() {
  const [api, setApi] = useState("/api/providers/openai/fast");

  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({ api }),
  });

  return (
   /* UI CODE */
  );
}`;

const modelsCode = `import { openai as originalOpenAI } from "@ai-sdk/openai";
import { customProvider, defaultSettingsMiddleware, wrapLanguageModel, createProviderRegistry } from "ai";

const customOpenai = customProvider({
  languageModels: {
    fast: originalOpenAI("gpt-5-nano"),
    smart: originalOpenAI("gpt-5-mini"),
    reasoning: wrapLanguageModel({
      model: originalOpenAI("gpt-5-nano"),
      middleware: defaultSettingsMiddleware({
        settings: { providerOptions: { openai: { reasoningEffort: "low", reasoningSummary: "auto" } } },
      }),
    }),
  },
  fallbackProvider: originalOpenAI,
});

export const registry = createProviderRegistry({
  openai: customOpenai,
});`;

const backendCode = `/** Imports */

export type ChatMessages = UIMessage<never, UIDataTypes>;

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: ChatMessages[] } = await req.json();

  
    const result = streamText({
      model: registry.languageModel("openai:fast"), // smart or reasoning in their routes
      messages: convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}`;

export function ProvidersCode() {
  return (
    <div className="w-full mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Implementation Code
        </h2>
        <p className="text-gray-600">
          Frontend transport selector, shared models, and provider routes
        </p>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="min-w-0">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Frontend Implementation
            </h3>
            <div className="min-w-0 overflow-hidden">
              <CodeBlock
                language="tsx"
                filename="app/ui/(chat)/providers/page.tsx"
                code={frontendCode}
              />
            </div>
          </div>

          <div className="min-w-0">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              Models Registry
            </h3>
            <div className="min-w-0 overflow-hidden">
              <CodeBlock
                language="ts"
                filename="app/api/(chat)/providers/models.ts"
                code={modelsCode}
              />
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Backend API Route (example)
          </h3>
          <div className="min-w-0 overflow-hidden">
            <CodeBlock
              language="typescript"
              filename="app/api/(chat)/providers/openai/fast/route.ts"
              code={backendCode}
            />
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Create similar routes for Smart and Reasoning using
            registry.languageModel(&quot;openai:smart&quot;) and
            registry.languageModel(&quot;openai:reasoning&quot;).
          </p>
        </div>
      </div>
    </div>
  );
}
