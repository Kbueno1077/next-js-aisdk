import React from "react";
import { CodeBlock } from "../../../components/ui/code-block";

const frontendCode = `"use client";

/** Imports */

function GenImageTool() {
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error, stop } = useChat<ChatMessages>({
    transport: new DefaultChatTransport({
      api: "/api/gen-image-tool",
    }),
    onError: async (error) => {
      toast.error("Gen image tool error occurred: " + error.message);
    },
  });

  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    sendMessage({
      text: prompt,
      files,
    });
    setPrompt("");
    setFiles(undefined);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col h-dvh bg-gray-50 relative overflow-hidden">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-3 z-20">
        {/*...*/}
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto pt-20 pb-40">
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 ? (
            {/*...*/}
          ) : (
            <div className="px-4 py-6 space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={\`flex \${
                    message.role === "user" ? "justify-end" : "justify-start"
                  } mb-4\`}
                >
                  <div
                    className={\`w-fit px-4 py-3 rounded-2xl shadow-lg \${
                      message.role === "user"
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                        : "bg-white border border-gray-200 text-gray-800"
                    }\`}
                  >
                    {message.parts.map((part, index) => {
                      switch (part.type) {
                        case "text":
                          return (
                            <div
                              key={\`\${message.id}-\${index}\`}
                              className="whitespace-pre-wrap leading-relaxed"
                            >
                              {part.text}
                            </div>
                          );
                        case "file":
                          if (part.mediaType?.startsWith("image/")) {
                            return (
                              <Image
                                key={\`\${message.id}-\${index}-image\`}
                                src={part.url}
                                alt={part.filename || \`attachment-\${index}\`}
                                width={500}
                                height={500}
                              />
                            );
                          }
                          return null;
                        case "tool-generateImage":
                          switch (part.state) {
                            case "input-streaming":
                              return (
                                <div className="whitespace-pre-wrap leading-relaxed">
                                  Generating image: {part.input?.prompt}
                                </div>
                              );
                            case "input-available":
                            case "output-available":
                              return (
                                <Image
                                  src={\`data:image/png;base64,\${part.output}\`}
                                  alt="Generated image"
                                  width={500}
                                  height={500}
                                />
                              );
                            case "output-error":
                              return (
                                <div className="text-red-500">
                                  Error: {part.errorText}
                                </div>
                              );
                          }
                          return null;
                        default:
                          return null;
                      }
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 z-10">
        {/*...*/}
      </div>
    </div>
  );
}

export default GenImageTool;`;

const backendCode = `import { aj } from "@/arcject/config";
import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  experimental_generateImage as generateImage,
  stepCountIs,
  streamText,
  tool,
  UIMessage,
  UIDataTypes,
  InferUITools,
} from "ai";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const tools = {
  generateImage: tool({
    description: "Generate an image from a prompt",
    inputSchema: z.object({
      prompt: z.string().describe("The prompt to generate an image for"),
    }),
    execute: async ({ prompt }) => {
      const { image } = await generateImage({
        model: openai.imageModel("dall-e-3"),
        prompt,
        size: "1024x1024",
        providerOptions: {
          openai: {
            style: "vivid",
            quality: "hd",
          },
        },
      });

      return image.base64;
    },
    toModelOutput: (image: string) => {
      return {
        type: "content",
        value: [{ type: "text", text: "generated image in base64" }],
      };
    },
  }),
};

export type ChatTools = InferUITools<typeof tools>;
export type ChatMessages = UIMessage<never, UIDataTypes, ChatTools>;

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: ChatMessages[] } = await req.json();

    const result = streamText({
      model: openai("gpt-4.1-nano"),
      messages: [
        {
          role: "system",
          content:
            "You are a friendly teacher who explains things using simple analogies, always relay concepts to everyday experiences, keep them short, even if the user asks for more details.",
        },
        ...convertToModelMessages(messages),
      ],
      tools,
      stopWhen: stepCountIs(2),
    });

  
    return result.toUIMessageStreamResponse();
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate chat response", details: error },
      { status: 500 },
    );
  }
}`;

export function GenImageToolCode() {
  return (
    <div className="w-full mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Implementation Code
        </h2>
        <p className="text-gray-600">
          Here&apos;s how the Gen Image Tool handles AI-powered image generation
          and multi-modal chat
        </p>
      </div>

      <div className="space-y-8">
        {/* Code Examples - Side by Side */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Frontend Implementation */}
          <div className="min-w-0">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Frontend Implementation
            </h3>
            <div className="min-w-0 overflow-hidden">
              <CodeBlock
                language="tsx"
                filename="app/ui/gen-image-tool/page.tsx"
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
                filename="app/api/gen-image-tool/route.ts"
                code={backendCode}
              />
            </div>
          </div>
        </div>

        <div className="bg-rose-50 border border-rose-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-rose-800 mb-3">
            Key Features
          </h4>
          <ul className="space-y-2 text-rose-700">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                AI-powered image generation using DALL-E 3 with high-quality
                settings
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                Multi-modal chat supporting text and image file uploads
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                Real-time image generation with streaming progress indicators
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>Rate limiting protection with Arcjet integration</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>Base64 image handling for seamless display in chat</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
