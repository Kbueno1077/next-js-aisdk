import { aj } from "@/arcject/config";
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
          { status: 429 },
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
      tools,
      stopWhen: stepCountIs(2),
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
      { status: 500 },
    );
  }
}
