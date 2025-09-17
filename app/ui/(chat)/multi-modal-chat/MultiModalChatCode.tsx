import React from "react";
import { CodeBlock } from "../../../../components/ui/code-block";

const frontendCode = `"use client";

/** Imports */

function MultiModalChat() {
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error, stop } = useChat({
    api: "/api/multi-modal-chat",
  });

  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if ((!prompt.trim() && !files?.length) || status === "streaming") return;

    const messageContent: (typeof UIMessage.prototype.parts)[0][] = [];

    if (prompt.trim()) {
      messageContent.push({ type: "text", text: prompt });
    }

    if (files?.length) {
      for (const file of files) {
        const url = URL.createObjectURL(file);
        messageContent.push({
          type: "file",
          file: { url, name: file.name, type: file.type },
        });
      }
    }

    sendMessage({
      parts: messageContent,
    });

    setPrompt("");
    setFiles(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles?.length) {
      setFiles(selectedFiles);
    }
  };

  const removeFile = (index: number) => {
    if (files) {
      const newFiles = Array.from(files);
      newFiles.splice(index, 1);
      const dt = new DataTransfer();
      newFiles.forEach(file => dt.items.add(file));
      setFiles(dt.files.length > 0 ? dt.files : undefined);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      {/* Messages with text and image support */}
      {/* Input area with file attachment support */}
    </div>
  );
}

export default MultiModalChat;`;

const backendCode = `/** Imports */

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const result = streamText({
      model: openai("gpt-5-nano"),
      messages: [
        {
          role: "system",
          content:
            "You are a friendly teacher who explains things using simple analogies, always relay concepts to everyday experiences, keep them short, even if the user asks for more details.",
        },
        ...convertToModelMessages(messages),
      ],
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
      { status: 500 }
    );
  }
}`;

export function MultiModalChatCode() {
  return (
    <div className="w-full mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Implementation Code
        </h2>
        <p className="text-gray-600">
          Here&apos;s how the Multi-Modal Chat feature handles both text and
          file inputs
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
                filename="app/ui/multi-modal-chat/page.tsx"
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
                filename="app/api/multi-modal-chat/route.ts"
                code={backendCode}
              />
            </div>
          </div>
        </div>

        <div className="bg-rose-50 border border-rose-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-rose-800 mb-3">
            Key Features
          </h4>
          <ul className="space-y-2 text-rose-700">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                Multi-modal input support with text and file attachments
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>File preview and removal functionality before sending</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                System prompt for educational, analogy-based responses
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>URL.createObjectURL for client-side file handling</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
