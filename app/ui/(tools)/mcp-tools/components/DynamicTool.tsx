import { DynamicToolPart } from "./types";

interface DynamicToolProps {
  part: DynamicToolPart;
  messageId: string;
  index: number;
}

export function DynamicTool({ part }: DynamicToolProps) {
  const toolName = part.toolName || "Unknown Tool";

  const extractData = (output: unknown) => {
    if (!output || typeof output !== "object") return output;

    const outputObj = output as Record<string, unknown>;

    if (outputObj.content && Array.isArray(outputObj.content)) {
      const textContent = outputObj.content.find(
        (item: Record<string, unknown>) => item.type === "text"
      );
      if (textContent && textContent.text) {
        try {
          return JSON.parse(textContent.text as string);
        } catch {
          return textContent.text;
        }
      }
    }

    return output;
  };

  switch (part.state) {
    case "input-streaming":
      const extractedInput = extractData(part.input);

      return (
        <div className="mt-3 first:mt-0">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-amber-800">
                Processing {toolName} Request
              </span>
            </div>
            <p className="text-amber-700 text-sm mb-2">
              Receiving request for{" "}
              <span className="font-semibold">{toolName}</span>
            </p>
            <div className="bg-amber-100 rounded p-2">
              <pre className="text-xs text-amber-800 overflow-x-auto">
                {JSON.stringify(extractedInput, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      );

    case "input-available":
      return (
        <div className="mt-3 first:mt-0">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-800">
                Executing {toolName}
              </span>
            </div>
            <p className="text-blue-700 text-sm">
              Running {toolName} with the provided parameters...
            </p>
          </div>
        </div>
      );

    case "output-available":
      const extractedData = extractData(part.output);
      return (
        <div className="mt-3 first:mt-0">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-800">
                {toolName} Result
              </span>
            </div>
            <div className="bg-green-100 rounded p-2">
              <pre className="text-xs text-green-800 overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(extractedData, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      );

    case "output-error":
      return (
        <div className="mt-3 first:mt-0">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium text-red-800">
                {toolName} Failed
              </span>
            </div>
            <p className="text-red-700 text-sm">{part.errorText}</p>
          </div>
        </div>
      );

    default:
      return null;
  }
}
