import { LocationToolPart } from "./types";

export interface LocationToolProps {
  part: LocationToolPart;
  messageId: string;
  index: number;
}

export function LocationTool({ part, messageId, index }: LocationToolProps) {
  switch (part.state) {
    case "input-streaming":
      return (
        <div className="mt-3 first:mt-0">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-purple-800">
                Processing Location Request
              </span>
            </div>
            <p className="text-purple-700 text-sm mb-2">
              Receiving location request for{" "}
              <span className="font-semibold">{part.input?.name}</span>
            </p>
            <div className="bg-purple-100 rounded p-2">
              <pre className="text-xs text-purple-800 overflow-x-auto">
                {JSON.stringify(part.input, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      );

    case "input-available":
      return (
        <div className="mt-3 first:mt-0">
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-indigo-800">
                Fetching Location Data
              </span>
            </div>
            <p className="text-indigo-700 text-sm">
              Getting location for{" "}
              <span className="font-semibold">{part.input?.name}</span>...
            </p>
          </div>
        </div>
      );

    case "output-available":
      return (
        <div className="mt-3 first:mt-0">
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
              <span className="text-sm font-medium text-teal-800">
                Location Information
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-teal-700 font-medium">
                  Location:
                </span>
                <span className="text-sm text-teal-800">
                  {part.output?.location}
                </span>
              </div>
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
                Location Request Failed
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
