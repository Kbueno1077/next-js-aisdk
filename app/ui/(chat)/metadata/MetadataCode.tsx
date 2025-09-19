import React from "react";
import { CodeBlock } from "../../../../components/ui/code-block";

const frontendCode = `"use client";

/** Imports */
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessageMetadata } from "@/app/api/(chat)/metadata/types";
import { useRef, useState, useEffect } from "react";

function ChatMetadata() {
  const { messages, sendMessage, status, error, stop } =
    useChat<UIMessageMetadata>({
      transport: new DefaultChatTransport({
        api: "/api/metadata",
      }),
    });



  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <div key={message.id} className="mb-4">
            {message.parts.map((part, index) =>
              part.type === "text" ? (
                <div key={message.id + "-" + index}>{part.text}</div>
              ) : null
            )}

            {message.metadata && (
              <div className="text-xs text-gray-500 mt-2">
                {message.metadata.createdAt && (
                  <span>
                    {new Date(message.metadata.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>
                )}
                {message.metadata.totalTokens !== undefined && (
                  <span className="ml-2">{message.metadata.totalTokens} tokens</span>
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

    </div>
  );
}

export default ChatMetadata;`;

const backendCode = `/** Imports */
import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, streamText } from "ai";
import { NextRequest, NextResponse } from "next/server";
import type { UIMessageMetadata } from "./types";

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: UIMessageMetadata[] } = await req.json();

    const result = streamText({
      model: openai("gpt-4.1-nano"),
      messages: convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse({
      messageMetadata: ({ part }) => {
        if (part.type === "start") {
          return { createdAt: Date.now() };
        }

        if (part.type === "finish") {
          return { totalTokens: part.totalUsage?.totalTokens };
        }
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate chat response", details: error },
      { status: 500 }
    );
  }
}`;

const typesCode = `import { UIMessage } from "ai";
import { z } from "zod";

export const MessageMetadata = z.object({
  createdAt: z.number().optional(),
  totalTokens: z.number().optional(),
});

export type MessageMetadata = z.infer<typeof MessageMetadata>;
export type UIMessageMetadata = UIMessage<MessageMetadata>;`;

export function MetadataCode() {
  return (
    <div className="w-full mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Implementation Code
        </h2>
        <p className="text-gray-600">
          Here&apos;s how the AI Chat feature is built using AI SDK and Next.js
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
                filename="app/ui/(chat)/metadata/page.tsx"
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
                filename="app/api/(chat)/metadata/route.ts"
                code={backendCode}
              />
            </div>
          </div>
        </div>

        {/* Types used for metadata */}
        <div className="min-w-0">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            Types for Message Metadata
          </h3>
          <div className="min-w-0 overflow-hidden">
            <CodeBlock
              language="typescript"
              filename="app/api/(chat)/metadata/types.ts"
              code={typesCode}
            />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-blue-800 mb-3">
            Key Details
          </h4>
          <ul className="space-y-2 text-blue-700">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                Frontend uses <code>useChat&lt;UIMessageMetadata&gt;</code> to
                type messages with metadata.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                Backend attaches <code>createdAt</code> on <code>start</code>{" "}
                and <code>totalTokens</code> on
                <code>finish</code> using <code>toUIMessageStreamResponse</code>
                .
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                Shared Zod schema and types live in
                <code> app/api/(chat)/metadata/types.ts</code>.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
