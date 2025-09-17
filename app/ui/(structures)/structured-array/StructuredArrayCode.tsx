import React from "react";
import { CodeBlock } from "../../../../components/ui/code-block";

const frontendCode = `"use client";

/** Imports */

function StructuredData() {
  const [type, setType] = useState("");
  const [pokemon, setPokemon] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!type.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setPokemon([]);

    try {
      const response = await fetch("/api/structured-array", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: type.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate Pokemon list");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let result = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          result += decoder.decode(value, { stream: true });
          
          // Parse streaming array data
          try {
            const lines = result.split('\\n').filter(line => line.trim());
            for (const line of lines) {
              if (line.startsWith('0:')) {
                const jsonStr = line.substring(2);
                const parsed = JSON.parse(jsonStr);
                if (Array.isArray(parsed)) {
                  setPokemon(parsed);
                }
              }
            }
          } catch (e) {
            // Continue if JSON incomplete
          }
        }
      }
    } catch (err) {
      console.error("Pokemon generation error:", err);
      setError("Failed to generate Pokemon list. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header, Pokemon array display, and input */}
    </div>
  );
}

export default StructuredData;`;

const backendCode = `/** Imports */

export async function POST(req: NextRequest) {
  try {
    const { type } = await req.json();

    const result = streamObject({
      model: openai("gpt-5-nano"),
      output: "array",
      schema: pokemonSchema,
      prompt: \`Generate a list of 5 \${type} type pokemon\`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate structured data response", details: error },
      { status: 500 }
    );
  }
}`;

const schemaCode = `import { z } from "zod";

export const pokemonSchema = z.object({
  name: z.string().min(1),
  abilities: z.array(z.string()),
});

export const pokemonUISchema = z.array(pokemonSchema);`;

export function StructuredArrayCode() {
  return (
    <div className="w-full mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Implementation Code
        </h2>
        <p className="text-gray-600">
          Here&apos;s how the Structured Arrays feature generates Pokemon lists
          using array output
        </p>
      </div>

      <div className="space-y-8">
        {/* Code Examples - Responsive Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Frontend Implementation */}
          <div className="min-w-0">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Frontend Implementation
            </h3>
            <div className="min-w-0 overflow-hidden">
              <CodeBlock
                language="tsx"
                filename="app/ui/structuredArray/page.tsx"
                code={frontendCode}
              />
            </div>
          </div>

          {/* Backend API Route */}
          <div className="min-w-0">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Backend API Route
            </h3>
            <div className="min-w-0 overflow-hidden">
              <CodeBlock
                language="typescript"
                filename="app/api/structured-array/route.ts"
                code={backendCode}
              />
            </div>
          </div>
        </div>

        {/* Schema Definition - Full Width */}
        <div className="min-w-0">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            Zod Schema Definition
          </h3>
          <div className="min-w-0 overflow-hidden">
            <CodeBlock
              language="typescript"
              filename="app/api/structured-array/schema.ts"
              code={schemaCode}
            />
          </div>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-indigo-800 mb-3">
            Key Features
          </h4>
          <ul className="space-y-2 text-indigo-700">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                Array output mode with streamObject for generating lists
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                Pokemon schema with name and abilities array structure
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>Real-time array population as items are generated</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>Type-safe array validation with Zod schemas</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
