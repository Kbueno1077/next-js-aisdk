import { aj } from "@/arcject/config";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

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

    const stream = streamText({
      model: openai("gpt-4.1-nano"),
      prompt,
    });

    stream.usage.then((usage) => {
      console.log({
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        totalTokens: usage.totalTokens,
      });
    });

    return stream.toUIMessageStreamResponse();
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate stream", details: error },
      { status: 500 }
    );
  }
}
