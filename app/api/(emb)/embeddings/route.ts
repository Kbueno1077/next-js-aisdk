import { aj } from "@/arcject/config";
import { openai } from "@ai-sdk/openai";
import { embed, embedMany } from "ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

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

  if (Array.isArray(body)) {
    const { values, embeddings, usage } = await embedMany({
      model: openai.textEmbeddingModel("text-embedding-3-small"),
      values: body,
      maxParallelCalls: 5,
    });

    return NextResponse.json({
      values,
      embeddings,
      usage,
      count: embeddings.length,
      dimensions: embeddings[0].length,
    });
  }

  const { value, embedding, usage } = await embed({
    model: openai.textEmbeddingModel("text-embedding-3-small"),
    value: body.text,
  });

  return NextResponse.json({
    embedding,
    usage,
    value,
    dimensions: embedding.length,
  });
}
