import React from "react";
import { CodeBlock } from "../../../../components/ui/code-block";

const frontendCode = `"use client";

/** Imports */

function McpTools() {
  const { messages, sendMessage, status, error, stop } = useChat<ChatMessages>({
    transport: new DefaultChatTransport({
      api: "/api/mcp-tool",
    }),
    onError: async (error) => {
      toast.error("MCP tools error occurred: " + error.message);
    },
  });

  return (
    <div className="flex flex-col h-dvh bg-gray-50">
      {/* ... */}
    </div>
  );
}

export default McpTools;`;

const backendCode = `

/** Imports */

// Custom tools (optional - can be combined with MCP tools)
const tools = {
 /** Tools */
};

export type ChatTools = InferUITools<typeof tools>;
export type ChatMessages = UIMessage<never, UIDataTypes, ChatTools>;

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: ChatMessages[] } = await req.json();

    // Create MCP client connection
    const httpTransport = new StreamableHTTPClientTransport(
      new URL("https://app.mockmcp.com/servers/ZtEdZcGUlR6O/mcp"),
      {
        requestInit: {
          headers: {
            Authorization: \`Bearer \${process.env.MCP_API_KEY}\`,
          },
        },
      }
    );

    const mcpClient = createMCPClient({
      transport: httpTransport,
    });

    // Get MCP tools dynamically
    const mcpTools = await (await mcpClient).tools();

    const result = streamText({
      model: openai("gpt-4o-mini"),
      messages: convertToModelMessages(messages),
      tools: { ...mcpTools, ...tools }, // Combine MCP and custom tools
      stopWhen: stepCountIs(2),
      
      onFinish: async () => {
        await (await mcpClient).close();
      },
      onError: async (error) => {
        await (await mcpClient).close();
        console.error(error);
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate chat response", details: error },
      { status: 500 }
    );
  }
}`;

export function McpToolsCode() {
  return (
    <div className="w-full mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Implementation Code
        </h2>
        <p className="text-gray-600">
          Here&apos;s how the MCP Tools feature is built using AI SDK, Next.js,
          and Model Context Protocol
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
                filename="app/ui/mcp-tools/page.tsx"
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
                filename="app/api/mcp-tool/route.ts"
                code={backendCode}
              />
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-blue-800 mb-3">
            Key Features
          </h4>
          <ul className="space-y-2 text-blue-700">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                AI-powered chat with Model Context Protocol (MCP) integration
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                Dynamic MCP tools loaded from external servers (MockMCP demo)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                Combines MCP tools with custom tools for enhanced functionality
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>HTTP transport for MCP client-server communication</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>Dynamic tool rendering with proper data extraction</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>Rate limiting and error handling for production use</span>
            </li>
          </ul>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-green-800 mb-3">
            MCP Integration
          </h4>
          <p className="text-green-700 mb-3">
            This implementation demonstrates how to integrate Model Context
            Protocol (MCP) with AI SDK:
          </p>
          <ul className="space-y-2 text-green-700">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                Uses StreamableHTTPClientTransport for MCP server communication
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>Dynamically loads tools from MCP servers at runtime</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                Combines MCP tools with custom tools for maximum flexibility
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                Proper connection management with onFinish and onError handlers
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                Dynamic tool rendering that extracts data from MCP response
                structure
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
