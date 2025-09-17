import React from "react";
import { CodeBlock } from "../../../../components/ui/code-block";

const frontendCode = `"use client";

/** Imports */

function StructuredData() {
  const [dish, setDish] = useState("");
  const [recipe, setRecipe] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!dish.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setRecipe(null);

    try {
      const response = await fetch("/api/structured-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dish: dish.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate recipe");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let result = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          result += decoder.decode(value, { stream: true });
          
          // Try to parse the accumulated result
          try {
            const lines = result.split('\\n').filter(line => line.trim());
            for (const line of lines) {
              if (line.startsWith('0:')) {
                const jsonStr = line.substring(2);
                const parsed = JSON.parse(jsonStr);
                if (parsed.recipe) {
                  setRecipe(parsed);
                }
              }
            }
          } catch (e) {
            // Continue accumulating if JSON is incomplete
          }
        }
      }
    } catch (err) {
      console.error("Recipe generation error:", err);
      setError("Failed to generate recipe. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header, structured recipe display, and input */}
    </div>
  );
}

export default StructuredData;`;

const backendCode = `/** Imports */

export async function POST(req: NextRequest) {
  try {
    const { dish } = await req.json();

    const result = streamObject({
      model: openai("gpt-5-nano"),
      schema: recipeSchema,
      prompt: \`Generate a recipe for \${dish}\`,
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

export const recipeSchema = z.object({
  recipe: z.object({
    name: z.string(),
    ingredients: z.array(
      z.object({
        name: z.string(),
        amount: z.string(),
      })
    ),
    steps: z.array(z.array(z.string())),
  }),
});`;

export function StructuredDataCode() {
  return (
    <div className="w-full mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Implementation Code
        </h2>
        <p className="text-gray-600">
          Here&apos;s how the Structured Data feature generates recipes using
          Zod schemas and streamObject
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
                filename="app/ui/structuredData/page.tsx"
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
                filename="app/api/structured-data/route.ts"
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
              filename="app/api/structured-data/schema.ts"
              code={schemaCode}
            />
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-orange-800 mb-3">
            Key Features
          </h4>
          <ul className="space-y-2 text-orange-700">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>Zod schema validation for type-safe structured output</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                streamObject() for real-time structured data generation
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                Complex nested objects (recipe with ingredients and steps)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                Stream parsing with JSON accumulation and error handling
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
