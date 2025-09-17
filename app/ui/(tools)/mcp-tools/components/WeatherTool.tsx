import { WeatherToolPart } from "./types";

interface WeatherToolProps {
  part: WeatherToolPart;
  messageId: string;
  index: number;
}

export function WeatherTool({ part, messageId, index }: WeatherToolProps) {
  switch (part.state) {
    case "input-streaming":
      return (
        <div className="mt-3 first:mt-0">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-amber-800">
                Processing Weather Request
              </span>
            </div>
            <p className="text-amber-700 text-sm mb-2">
              Receiving weather request for{" "}
              <span className="font-semibold">{part.input?.city}</span>
            </p>
            <div className="bg-amber-100 rounded p-2">
              <pre className="text-xs text-amber-800 overflow-x-auto">
                {JSON.stringify(part.input, null, 2)}
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
                Fetching Weather Data
              </span>
            </div>
            <p className="text-blue-700 text-sm">
              Getting weather for{" "}
              <span className="font-semibold">{part.input?.city}</span>...
            </p>
          </div>
        </div>
      );

    case "output-available":
      return (
        <div className="mt-3 first:mt-0">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-800">
                Weather Information
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-700 font-medium">
                  Location:
                </span>
                <span className="text-sm text-green-800">
                  {part.output?.location}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-700 font-medium">
                  Temperature:
                </span>
                <span className="text-sm text-green-800">
                  {part.output?.temperature}°
                  {part.output?.unit === "celsius" ? "C" : "F"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-700 font-medium">
                  Conditions:
                </span>
                <span className="text-sm text-green-800">
                  {part.output?.description}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-700 font-medium">
                  Humidity:
                </span>
                <span className="text-sm text-green-800">
                  {part.output?.humidity}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-700 font-medium">
                  Wind Speed:
                </span>
                <span className="text-sm text-green-800">
                  {part.output?.windSpeed} km/h
                </span>
              </div>
              {part.output?.note && (
                <div className="mt-3 p-2 bg-green-100 rounded border-l-2 border-green-300">
                  <p className="text-xs text-green-700 italic">
                    {part.output.note}
                  </p>
                </div>
              )}
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
                Weather Request Failed
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
