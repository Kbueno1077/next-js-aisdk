import React from "react";
import { CodeBlock } from "../../../../components/ui/code-block";

const frontendCode = `"use client";

/** Imports */

function StructuredEnum() {
  const [text, setText] = useState("");
  const [sentiment, setSentiment] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setSentiment(null);

    try {
      const response = await fetch("/api/structured-enum", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: text.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze sentiment");
      }

      const result = await response.json();
      setSentiment(result);
    } catch (err) {
      console.error("Sentiment analysis error:", err);
      setError("Failed to analyze sentiment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header, sentiment analysis display, and input */}
    </div>
  );
}

export default StructuredEnum;`;

const backendCode = `/** Imports */

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    const result = await generateObject({
      model: openai("gpt-5-mini"),
      output: "enum",
      enum: ["positive", "negative", "neutral"],
      prompt: \`Classify the sentiment of the following text: \${text}\`,
    });

    return NextResponse.json(result.object);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate structured data response", details: error },
      { status: 500 }
    );
  }
}`;

export function StructuredEnumCode() {
  return (
    <div className="w-full mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Implementation Code
        </h2>
        <p className="text-gray-600">
          Here&apos;s how the Structured Enum feature performs sentiment
          analysis with predefined categories
        </p>
      </div>

      <div className="space-y-8">
        {/* Code Examples - Responsive Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Frontend Implementation */}
          <div className="min-w-0">
            {/* min-w-0 allows flex items to shrink below content size */}
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Frontend Implementation
            </h3>
            <div className="min-w-0 overflow-hidden">
              {/* Contain the CodeBlock */}
              <CodeBlock
                language="tsx"
                filename="app/ui/structuredEnum/page.tsx"
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
                filename="app/api/structured-enum/route.ts"
                code={backendCode}
              />
            </div>
          </div>
        </div>

        <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-teal-800 mb-3">
            Key Features
          </h4>
          <ul className="space-y-2 text-teal-700">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                Enum output mode for classification tasks with predefined
                categories
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>GPT-4o-mini model optimized for enum classification</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                Three-category sentiment analysis: positive, negative, neutral
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                Dynamic UI styling based on sentiment classification results
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
