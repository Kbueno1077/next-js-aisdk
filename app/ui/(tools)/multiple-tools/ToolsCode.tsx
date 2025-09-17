import React from "react";
import { CodeBlock } from "../../../../components/ui/code-block";

const frontendCode = `"use client";

/** Imports */

function MultipleTools() {
  const { messages, sendMessage, status, error, stop } = useChat<ChatMessages>({
    transport: new DefaultChatTransport({
      api: "/api/multiple-tools",
    }),
  });

  const [prompt, setPrompt] = useState("");
  const [showCode, setShowCode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    sendMessage({
      text: prompt,
    });
    setPrompt("");
  };


  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header, sentiment analysis display, and input */}
         {message.parts.map((part, index) => {
            switch (part.type) {
             case "text":
                /** ... */
             case "tool-getWeather":
                   switch (part.state) {
                     case "input-streaming":   /** ... */
                     case "input-available":  /** ... */
                     case "output-available":  /** ... */
                     case "output-error":  /** ... */
             }

             case "tool-getLocation":
                   switch (part.state) {
                     case "input-streaming":   /** ... */
                     case "input-available":  /** ... */
                     case "output-available":  /** ... */
                     case "output-error":  /** ... */
             }
          })}
        </div>
    }
  );
  );
}

export default MultipleTools;`;

const backendCode = `/** Imports */

const tools = {
  getLocation: tool({
    description: "Get the location of the user",
    inputSchema: z.object({
      name: z.string().describe("The name of the user"),
    }),
    execute: async ({ name }) => {
       // Api call, db lookup, etc.
    },
  }),

  getWeather: tool({
    description: "Get the current weather for a given location",
    inputSchema: z.object({
      city: z.string().describe("The city to get the weather for"),
    }),
    execute: async ({ city }) => {
       // Api call, db lookup, etc.
    },
  }),
};

export type ChatTools = InferUITools<typeof tools>;
export type ChatMessages = UIMessage<never, UIDataTypes, ChatTools>;

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: ChatMessages[] } = await req.json();

    const result = streamText({
      model: openai("gpt-5-nano"),
      messages: convertToModelMessages(messages),
      tools,
      stopWhen: stepCountIs(4),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate chat response", details: error },
      { status: 500 }
    );
  }
}`;

export function ToolsCode() {
  return (
    <div className="w-full mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Implementation Code
        </h2>
        <p className="text-gray-600">
          Here&apos;s how the Multiple Tools feature is built using AI SDK and
          Next.js
        </p>
      </div>

      <div className="space-y-8">
        {/* Code Examples - Responsive Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Frontend Implementation */}
          <div className="min-w-0">
            {/* min-w-0 allows flex items to shrink below content size */}
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Frontend Implementation
            </h3>
            <div className="min-w-0 overflow-hidden">
              {/* Contain the CodeBlock */}
              <CodeBlock
                language="tsx"
                filename="app/ui/multiple-tools/page.tsx"
                code={frontendCode}
              />
            </div>
          </div>

          {/* Backend API Route */}
          <div className="min-w-0">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Backend API Route
            </h3>
            <div className="min-w-0 overflow-hidden">
              <CodeBlock
                language="typescript"
                filename="app/api/multiple-tools/route.ts"
                code={backendCode}
              />
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-blue-800 mb-3">
            Key Features
          </h4>
          <ul className="space-y-2 text-blue-700">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>AI-powered chat with multiple custom tool integration</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                Location tool that can retrieve user location based on name
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                Weather tool with comprehensive weather data for multiple cities
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                Structured tool definitions with Zod schemas for type safety
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                Custom transport configuration for specific API endpoints
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                Enhanced step limiting (4 steps) for more complex tool
                interactions
              </span>
            </li>
          </ul>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-green-800 mb-3">
            Multiple Tool Definitions
          </h4>
          <p className="text-green-700 mb-3">
            The multiple tools demonstrate how to create and combine different
            tools that the AI can invoke:
          </p>
          <ul className="space-y-2 text-green-700">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                <strong>Location Tool:</strong> Retrieves user location based on
                name with predefined mappings
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                <strong>Weather Tool:</strong> Provides comprehensive weather
                data including temperature, humidity, and wind speed
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                Both tools use Zod schemas for input validation and type safety
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                Weather tool includes realistic API delay simulation and
                fallback data for unknown cities
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                Tools can be used together in a single conversation for enhanced
                user experience
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
