import { aj } from "@/arcject/config";
import { NextRequest, NextResponse } from "next/server";
import { streamText, UIMessage, convertToModelMessages } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

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
      messages: [
        {
          role: "system",
          content:
            "You are a friendly teacher who explains things using simple analogies, always relay concepts to everyday experiences, keep them short, even if the user asks for more details.",
        },
        ...convertToModelMessages(messages),
      ],
    });

    result.usage.then((usage) => {
      console.log({
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        totalTokens: usage.totalTokens,
      });
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate chat response", details: error },
      { status: 500 }
    );
  }
}
