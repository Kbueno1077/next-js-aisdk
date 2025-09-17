import { SourceUrlUIPart } from "ai";
import { WebSearchToolPart } from "./types";

interface WebSearchToolProps {
  part: WebSearchToolPart;
  messageId: string;
  index: number;
  sources: SourceUrlUIPart[];
}

export function WebSearchTool({
  part,
  messageId,
  index,
  sources,
}: WebSearchToolProps) {
  switch (part.state) {
    case "input-streaming":
      return (
        <div className="mt-3 first:mt-0">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-amber-800">
                Processing Web Search Request
              </span>
            </div>
          </div>
        </div>
      );

    case "input-available":
      return (
        <div className="mt-3 first:mt-0">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-800">
                Searching the Web
              </span>
            </div>
            <p className="text-blue-700 text-sm">
              Searching for{" "}
              <span className="font-semibold">{part.input?.query}</span>...
            </p>
          </div>
        </div>
      );

    case "output-available":
      return (
        <div className="mt-3 first:mt-0">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-800">
                Web Search Complete
              </span>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-green-800 mb-2">
                Sources:
              </h4>

              {sources.map((source, index) => (
                <div
                  key={index}
                  className="bg-white rounded-md border border-green-200 p-3 hover:bg-green-50 transition-all duration-200 shadow-sm hover:shadow-md hover:border-green-300"
                >
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline text-sm break-all font-medium"
                  >
                    {source.url}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case "output-error":
      return (
        <div className="mt-3 first:mt-0">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium text-red-800">
                Web Search Failed
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
