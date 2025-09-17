import React from "react";
import { CodeBlock } from "../../../../components/ui/code-block";

const frontendCode = `"use client";

/** Imports */

function GenerateImagePage() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate image");
      }

      const base64Image = await response.json();
      setImageUrl(\`data:image/png;base64,\${base64Image}\`);
    } catch (err) {
      console.error("Image generation error:", err);
      setError("Failed to generate image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = \`ai-generated-\${Date.now()}.png\`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header, content with image display, and input areas */}
    </div>
  );
}

export default GenerateImagePage;`;

const backendCode = `/** Imports */

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

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

    return NextResponse.json(image.base64);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate image", details: error },
      { status: 500 }
    );
  }
}`;

export function GenerateImageCode() {
  return (
    <div className="w-full mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Implementation Code
        </h2>
        <p className="text-gray-600">
          Here&apos;s how the AI Image Generation feature is built using AI SDK
          and DALL-E 3
        </p>
      </div>

      <div className="space-y-8">
        {/* Code Examples - Side by Side */}
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
                filename="app/ui/generateImage/page.tsx"
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
                filename="app/api/generate-image/route.ts"
                code={backendCode}
              />
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-violet-50 border border-violet-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-violet-800 mb-3">
            Key Features
          </h4>
          <ul className="space-y-2 text-violet-700">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-violet-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>DALL-E 3 integration with HD quality and vivid style</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-violet-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                Base64 image handling and display with download functionality
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-violet-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>1024x1024 high-resolution image generation</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-violet-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>Responsive image preview with loading states</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
