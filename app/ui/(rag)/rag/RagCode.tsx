import React from "react";
import { CodeBlock } from "../../../../components/ui/code-block";

const frontendCode = `"use client";

/** Imports */
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

export default function RAGChatBot() {
  const { messages, sendMessage, status, error, stop } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/rag",
    }),
  });

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Chat UI markup omitted for brevity */}
    </div>
  );
}`;

const backendRoute = `import {
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
          .map((r, i) => "[" + (i + 1) + "] " + r.content)
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
    const decision = await aj.protect(req, { requested: 1 });
    if (decision.reason.isRateLimit()) {
      return NextResponse.json(
        { error: "Too Many Requests", message: "You have reached the rate limit for today. Please try again tomorrow." },
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
      system: "You are a helpful assistant with access to a knowledge base. When users ask questions, search the knowledge base for relevant information. Always search before answering if the question might relate to uploaded documents. Base your answers on the search results when available. Give concise, accurate answers.",
      stopWhen: stepCountIs(2),
    });
    return response.toUIMessageStreamResponse();
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal Server Error", details: (error as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}`;

const dbConfig = `import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const sql = neon(process.env.NEON_DATABASE_URL!);
export const db = drizzle(sql);`;

const dbSchema = `import { pgTable, serial, text, vector, index } from "drizzle-orm/pg-core";

export const documents = pgTable(
  "documents",
  {
    id: serial("id").primaryKey(),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }), // text-embedding-3-small
  },
  (table) => [
    index("embeddingIndex").using("hnsw", table.embedding.op("vector_cosine_ops")),
  ]
);

export type InsertDocument = typeof documents.$inferInsert;
export type SelectDocument = typeof documents.$inferSelect;`;

const chunking = `import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 150,
  chunkOverlap: 20,
  separators: [" "],
});

export async function chunkContent(content: string) {
  return textSplitter.splitText(content.trim());
}`;

const embeddings = `import { embed, embedMany } from "ai";
import { openai } from "@ai-sdk/openai";

export async function generateEmbedding(text: string) {
  const input = text.replace(/\n/g, " ");
  const { embedding } = await embed({
    model: openai.textEmbeddingModel("text-embedding-3-small"),
    value: input,
  });
  return embedding;
}

export async function generateEmbeddings(texts: string[]) {
  const inputs = texts.map((text) => text.replace(/\n/g, " "));
  const { embeddings } = await embedMany({
    model: openai.textEmbeddingModel("text-embedding-3-small"),
    values: inputs,
  });
  return embeddings;
}`;

const searchUtil = `import { cosineDistance, desc, gt, sql } from "drizzle-orm";
import { generateEmbedding } from "./embeddings";
import { documents } from "./db-schema";
import { db } from "./db-config";

export async function searchDocuments(query: string, limit: number = 5, threshold: number = 0.5) {
  const embedding = await generateEmbedding(query);
  const similarity = sql<number>\`1-(\${cosineDistance(documents.embedding, embedding)})\`;
  const similarDocuments = await db
    .select({ id: documents.id, content: documents.content, similarity })
    .from(documents)
    .where(gt(similarity, threshold))
    .orderBy(desc(similarity))
    .limit(limit);
  return similarDocuments;
}`;

const uploadAction = `"use server";

import { PDFParse } from "pdf-parse";
import { chunkContent } from "@/lib/rag-utils/chunking";
import { documents } from "@/lib/rag-utils/db-schema";
import { generateEmbeddings } from "@/lib/rag-utils/embeddings";
import { db } from "@/lib/rag-utils/db-config";

export async function processPdfFile(formData: FormData) {
  try {
    const file = formData.get("pdf") as File;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const parser = new PDFParse({ data: buffer });
    const data = await parser.getText();
    if (!data.text || data.text.trim().length === 0) {
      return { success: false, error: "No text found in PDF" };
    }
    const chunks = await chunkContent(data.text);
    const embeddings = await generateEmbeddings(chunks);
    const records = chunks.map((chunk, index) => ({ content: chunk, embedding: embeddings[index] }));
    await db.insert(documents).values(records);
    return { success: true, message: \`Created \${records.length} searchable chunks\` };
  } catch (error) {
    return { success: false, error: "Failed to process PDF" };
  }
}`;

const migration0 = `-- Enable pgvector (Neon)
CREATE EXTENSION IF NOT EXISTS vector;`;

const migration1 = `-- Ensure pgvector exists (idempotent)
CREATE EXTENSION IF NOT EXISTS vector;`;

const migration2 = `CREATE TABLE "documents" (
  "id" serial PRIMARY KEY NOT NULL,
  "content" text NOT NULL,
  "embedding" vector(1536)
);
-->
CREATE INDEX "embeddingIndex" ON "documents" USING hnsw ("embedding" vector_cosine_ops);`;

export function RagCode() {
  return (
    <div className="w-full mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Implementation Code
        </h2>
        <p className="text-gray-600">
          RAG with Neon + pgvector, Drizzle ORM, and AI SDK
        </p>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="min-w-0">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Frontend Implementation
            </h3>
            <div className="min-w-0 overflow-hidden">
              <CodeBlock
                language="tsx"
                filename="app/ui/(rag)/rag/page.tsx"
                code={frontendCode}
              />
              <p className="text-sm text-gray-600 mt-2">
                Uses <code>useChat</code> with a custom transport to call the
                RAG API. The UI is a standard chat shell; messages stream from
                the backend.
              </p>
            </div>
          </div>

          <div className="min-w-0">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Backend API Route
            </h3>
            <div className="min-w-0 overflow-hidden">
              <CodeBlock
                language="typescript"
                filename="app/api/(rag)/rag/route.ts"
                code={backendRoute}
              />
              <p className="text-sm text-gray-600 mt-2">
                Server route streams responses and exposes a{" "}
                <code>searchKnoledgeBase</code> tool. The model calls this tool
                to retrieve grounded context before answering.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="min-w-0">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Database Config (Neon + Drizzle)
            </h3>
            <div className="min-w-0 overflow-hidden">
              <CodeBlock
                language="typescript"
                filename="lib/rag-utils/db-config.ts"
                code={dbConfig}
              />
              <p className="text-sm text-gray-600 mt-2">
                Initializes Drizzle ORM on Neon using the serverless driver and
                an env URL from <code>.env.local</code>.
              </p>
            </div>
          </div>

          <div className="min-w-0">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Schema with pgvector index
            </h3>
            <div className="min-w-0 overflow-hidden">
              <CodeBlock
                language="typescript"
                filename="lib/rag-utils/db-schema.ts"
                code={dbSchema}
              />
              <p className="text-sm text-gray-600 mt-2">
                Defines a <code>documents</code> table with a{" "}
                <code>vector(1536)</code> column and HNSW cosine index for
                efficient semantic similarity search.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="min-w-0">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              Chunking utility
            </h3>
            <div className="min-w-0 overflow-hidden">
              <CodeBlock
                language="typescript"
                filename="lib/rag-utils/chunking.ts"
                code={chunking}
              />
              <p className="text-sm text-gray-600 mt-2">
                Splits long text into small overlapping chunks to embed and
                store, improving recall and context density.
              </p>
            </div>
          </div>

          <div className="min-w-0">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              Embeddings utility
            </h3>
            <div className="min-w-0 overflow-hidden">
              <CodeBlock
                language="typescript"
                filename="lib/rag-utils/embeddings.ts"
                code={embeddings}
              />
              <p className="text-sm text-gray-600 mt-2">
                Creates embeddings using <code>text-embedding-3-small</code> for
                both single text and batches; normalizes newlines.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="min-w-0">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
              Semantic search utility
            </h3>
            <div className="min-w-0 overflow-hidden">
              <CodeBlock
                language="typescript"
                filename="lib/rag-utils/search.ts"
                code={searchUtil}
              />
              <p className="text-sm text-gray-600 mt-2">
                Computes similarity as <code>1 - cosineDistance</code> and
                fetches top matching chunks above a threshold, ordered by
                similarity.
              </p>
            </div>
          </div>

          <div className="min-w-0">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
              PDF upload action
            </h3>
            <div className="min-w-0 overflow-hidden">
              <CodeBlock
                language="typescript"
                filename="app/upload/actions.ts"
                code={uploadAction}
              />
              <p className="text-sm text-gray-600 mt-2">
                Server action that parses a PDF, chunks its text, generates
                embeddings, and inserts vectorized chunks into the database.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-violet-50 border border-violet-200 rounded-lg p-6 space-y-4">
          <h4 className="text-lg font-semibold text-violet-800">
            Migrations (Neon + pgvector)
          </h4>
          <CodeBlock
            language="sql"
            filename="migrations/0000_*.sql"
            code={migration0}
          />
          <CodeBlock
            language="sql"
            filename="migrations/0001_*.sql"
            code={migration1}
          />
          <CodeBlock
            language="sql"
            filename="migrations/0002_*.sql"
            code={migration2}
          />
          <p className="text-sm text-violet-800/90 mt-2">
            Enables pgvector and creates the <code>documents</code> table plus
            the HNSW index required for fast vector search on Neon.
          </p>
        </div>
      </div>
    </div>
  );
}
