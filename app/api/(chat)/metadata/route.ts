import { aj } from "@/arcject/config";
import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, streamText } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { UIMessageMetadata } from "./types";

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: UIMessageMetadata[] } = await req.json();

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

    const result = streamText({
      model: openai("gpt-4.1-nano"),
      messages: convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse({
      messageMetadata: ({ part }) => {
        if (part.type === "start") {
          return {
            createdAt: Date.now(),
          };
        }

        if (part.type === "finish") {
          return {
            totalTokens: part.totalUsage?.totalTokens,
          };
        }
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
