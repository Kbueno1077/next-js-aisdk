import { aj } from "@/arcject/config";
import { NextRequest, NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { experimental_transcribe as transcribe } from "ai";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

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

    const audioBuffer = await audioFile.arrayBuffer();
    const uint8Array = new Uint8Array(audioBuffer);

    const transcription = await transcribe({
      model: openai.transcription("whisper-1"),
      audio: uint8Array,
    });

    return NextResponse.json(transcription);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to transcribe audio", details: error },
      { status: 500 }
    );
  }
}
