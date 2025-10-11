import {
  streamText,
  UIMessage,
  convertToModelMessages,
  tool,
  InferUITools,
  UIDataTypes,
  stepCountIs,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { NextRequest, NextResponse } from "next/server";
import { aj } from "@/arcject/config";
import z from "zod";
import { searchDocuments } from "@/lib/rag-utils/search";

const tools = {
  searchKnoledgeBase: tool({
    description: "Search the knowledge base for the most relevant information",
    inputSchema: z.object({
      query: z.string().describe("The query to search for"),
    }),
    execute: async ({ query }) => {
      try {
        const results = await searchDocuments(query, 3, 0.5);

        if (results.length === 0) {
          return "No relevant information found";
        }

        const formattedResults = results
          .map((r, i) => `[${i + 1}] ${r.content}`)
          .join("\n");

        return formattedResults;
      } catch (error) {
        return {
          error: "Failed to search the knowledge base",
          details: (error as Error).message,
        };
      }
    },
  }),
};

export type ChatTools = InferUITools<typeof tools>;
export type ChatMessages = UIMessage<never, UIDataTypes, ChatTools>;

export async function POST(req: NextRequest) {
  if (!process.env.IS_DEV_MODE) {
    const decision = await aj.protect(req, {
      requested: 1,
    });

    if (decision.reason.isRateLimit()) {
      return NextResponse.json(
        {
          error: "Too Many Requests",
          message:
            "You have reached the rate limit for today. Please try again tomorrow.",
        },
        { status: 429 }
      );
    }
  }

  try {
    const { messages }: { messages: ChatMessages[] } = await req.json();

    const response = await streamText({
      model: openai("gpt-4.1-mini"),
      messages: convertToModelMessages(messages),
      tools,
      system: `You are a helpful assistant with access to a knowledge base. 
      When users ask questions, search the knowledge base for relevant information.
      Always search before answering if the question might relate to uploaded documents.
      Base your answers on the search results when available. Give concise answers that correctly answer what the user is asking for. Do not flood them with all the information from the search results.`,
      stopWhen: stepCountIs(2),
    });

    return response.toUIMessageStreamResponse();
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        details: (error as Error).message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
