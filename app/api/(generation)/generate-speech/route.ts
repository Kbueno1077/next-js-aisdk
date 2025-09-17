import { aj } from "@/arcject/config";
import { openai } from "@ai-sdk/openai";
import { experimental_generateSpeech as generateSpeech } from "ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!process.env.IS_DEV_MODE) {
      const decision = await aj.protect(request, {
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

    const { audio } = await generateSpeech({
      model: openai.speech("tts-1"),
      text,
    });

    const buffer = Buffer.from(audio.uint8Array);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": audio.mediaType || "audio/mpeg",
      },
    });
  } catch (error) {
    console.error("Error generating speech:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
