import { aj } from "@/arcject/config";
import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

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

    const result = await generateObject({
      model: openai("gpt-4o-mini"), // gpt-4o-mini supports enum better than gpt-4.1-mini
      output: "enum",
      enum: ["positive", "negative", "neutral"],
      prompt: `Classify the sentiment of the following text: ${text}`,
    });

    if (result.usage) {
      console.log({
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
        totalTokens: result.usage.totalTokens,
      });
    }

    return NextResponse.json(result.object);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate structured data response", details: error },
      { status: 500 }
    );
  }
}
