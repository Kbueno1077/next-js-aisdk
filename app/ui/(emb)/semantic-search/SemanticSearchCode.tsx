import React from "react";
import { CodeBlock } from "@/components/ui/code-block";

const frontendCode = `"use client";

/** Imports */

export default function SemanticSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MovieResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/semantic-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      if (!res.ok) throw new Error("Search failed");
      const data: { results: MovieResult[] } = await res.json();
      setResults(data.results || []);
      setQuery("");
    } catch (err: any) {
      const message = err?.message || "Failed to perform semantic search";
      setError(message);
      toast.error("Semantic search error: " + message);
    } finally {
      setIsLoading(false);
    }
  };

  return <div className="flex flex-col h-screen bg-gray-50">
      {/* Header, content, and input areas */}
    </div>;
}`;

const backendCode = `import { embed, embedMany, cosineSimilarity } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    const { embeddings: movieEmbeddings } = await embedMany({
      model: openai.textEmbeddingModel("text-embedding-3-small"),
      values: movies.map((movie) => movie.description),
    });

    const { embedding: queryEmbedding } = await embed({
      model: openai.textEmbeddingModel("text-embedding-3-small"),
      value: query,
    });

    const moviesWithScores = movies.map((movie, index) => {
      const similarity = cosineSimilarity(
        queryEmbedding,
        movieEmbeddings[index]
      );

      return {
        ...movie,
        similarity,
      };
    });

    moviesWithScores.sort((a, b) => b.similarity - a.similarity);

    const threshold = 0.5;
    const relevantResults = moviesWithScores.filter(
      (movie) => movie.similarity >= threshold
    );

    const topResults = relevantResults.slice(0, 3);

    return Response.json({
      query,
      results: topResults,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to perform semantic search", details: error },
      { status: 500 }
    );
  }
}`;

export function SemanticSearchCode() {
  return (
    <div className="w-full mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Implementation Code
        </h2>
        <p className="text-gray-600">
          Frontend and backend implementation for the Semantic Search feature.
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
                filename="app/ui/semantic-search/page.tsx"
                code={frontendCode}
              />
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
                filename="app/api/(emb)/semantic-search/route.ts"
                code={backendCode}
              />
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-purple-800 mb-3">
            Key Features
          </h4>
          <ul className="space-y-2 text-purple-700">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>Embeddings with OpenAI&apos;s text-embedding-3-small</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>Cosine similarity to rank results</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>Clean UI with suggestions and loading states</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
