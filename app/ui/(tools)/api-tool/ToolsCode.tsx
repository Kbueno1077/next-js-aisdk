import React from "react";
import { CodeBlock } from "../../../../components/ui/code-block";

const frontendCode = `"use client";

import { ChatMessages } from "@/app/api/api-tool/route";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ToolRenderer } from "./components";

function ApiTool() {
  const { messages, sendMessage, status, error, stop } = useChat<ChatMessages>({
    transport: new DefaultChatTransport({
      api: "/api/api-tool",
    }),
  });

  const [prompt, setPrompt] = useState("");

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
      {/* Messages Container */}
      <div className="px-4 py-6 space-y-6">
        {messages.map((message) => (
          <div key={message.id}>
            {message.parts.map((part, index) => {
              switch (part.type) {
                case "text":
                  return (
                    <div key={message.id + "-" + index}>
                      {part.text}
                    </div>
                  );

                case "tool-getWeather":
                  return (
                    <ToolRenderer
                      key={message.id + "-" + index}
                      part={part}
                      messageId={message.id}
                      index={index}
                    />
                  );

                default:
                  return null;
              }
            })}
          </div>
        ))}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit}>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask about weather in any city..."
        />
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
}

export default ApiTool;`;

const backendCode = `import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  streamText,
  UIMessage,
  tool,
  InferUITools,
  UIDataTypes,
  stepCountIs,
} from "ai";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const tools = {
  getWeather: tool({
    description: "Get the current weather for a given location",
    inputSchema: z.object({
      city: z.string().describe("The city to get the weather for"),
    }),
    execute: async ({ city }) => {
      const response = await fetch(
        \`http://api.weatherapi.com/v1/current.json?key=\${process.env.WEATHER_API_KEY}&q=\${city}\`
      );

      const data = await response.json();

      const weatherData = {
        location: {
          name: data.location.name,
          country: data.location.country,
          localtime: data.location.localtime,
        },
        current: {
          temp_c: data.current.temp_c,
          condition: {
            text: data.current.condition.text,
            code: data.current.condition.code,
          },
        },
      };

      return weatherData;
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
      stopWhen: stepCountIs(2),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate chat response", details: error },
      { status: 500 }
    );
  }
}`;

const weatherToolCode = `import { WeatherToolPart } from "./types";

interface WeatherToolProps {
  part: WeatherToolPart;
  messageId: string;
  index: number;
}

const getWeatherIcon = (conditionCode: number) => {
  const iconMap: Record<number, string> = {
    1000: "☀️", // Clear
    1003: "⛅", // Partly cloudy
    1006: "☁️", // Cloudy
    // ... more weather conditions
  };
  return iconMap[conditionCode] || "🌤️";
};

export function WeatherTool({ part, messageId, index }: WeatherToolProps) {
  switch (part.state) {
    case "input-streaming":
      return (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
            <span className="text-base font-semibold text-amber-800">
              🌤️ Processing Weather Request
            </span>
          </div>
          <p className="text-amber-700 text-sm">
            Receiving weather request for {part.input?.city}
          </p>
        </div>
      );

    case "output-available":
      const weatherIcon = getWeatherIcon(part.output?.current.condition.code || 1000);
      return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">{weatherIcon}</span>
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                {part.output?.location.name}
              </h3>
              <p className="text-sm text-gray-600">
                {part.output?.location.country}
              </p>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {part.output?.current.temp_c}°C
          </div>
          <div className="text-sm text-gray-600">
            {part.output?.current.condition.text}
          </div>
        </div>
      );

    case "output-error":
      return (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-base font-semibold text-red-800">
              ❌ Weather Request Failed
            </span>
          </div>
          <p className="text-red-700 text-sm">{part.errorText}</p>
        </div>
      );

    default:
      return null;
  }
}`;

export function ToolsCode() {
  return (
    <div className="w-full mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Weather API Tool Implementation
        </h2>
        <p className="text-gray-600">
          Here&apos;s how the Weather API Tool feature is built using AI SDK and
          Next.js
        </p>
      </div>

      <div className="space-y-8">
        {/* Code Examples - Responsive Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Frontend Implementation */}
          <div className="min-w-0">
            {" "}
            {/* min-w-0 allows flex items to shrink below content size */}
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Frontend Implementation
            </h3>
            <div className="min-w-0 overflow-hidden">
              {" "}
              {/* Contain the CodeBlock */}
              <CodeBlock
                language="tsx"
                filename="app/ui/api-tool/page.tsx"
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
                filename="app/api/api-tool/route.ts"
                code={backendCode}
              />
            </div>
          </div>
        </div>

        {/* Weather Tool Component - Full Width */}
        <div className="min-w-0">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            Weather Tool Component
          </h3>
          <div className="min-w-0 overflow-hidden">
            <CodeBlock
              language="tsx"
              filename="app/ui/api-tool/components/WeatherTool.tsx"
              code={weatherToolCode}
            />
          </div>
        </div>

        {/* Features Section - Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-blue-800 mb-3">
              Key Features
            </h4>
            <ul className="space-y-2 text-blue-700">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>
                  Real-time weather data integration with WeatherAPI.com
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>
                  Beautiful weather UI with dynamic icons and gradient
                  backgrounds
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>
                  Streaming states for input processing and output display
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Error handling with user-friendly error messages</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>
                  Type-safe tool integration with Zod schema validation
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-green-800 mb-3">
              Weather Tool Features
            </h4>
            <p className="text-green-700 mb-3">
              The weather tool provides rich weather information with beautiful
              UI:
            </p>
            <ul className="space-y-2 text-green-700">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Dynamic weather icons based on condition codes</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Temperature-based color gradients and backgrounds</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Local time formatting and location display</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Real-time weather data from WeatherAPI.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
