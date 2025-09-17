import { LocationTool } from "./LocationTool";
import { ToolPart } from "./types";
import { WeatherTool } from "./WeatherTool";

export interface ToolRendererProps {
  part: ToolPart;
  messageId: string;
  index: number;
}

export function ToolRenderer({ part, messageId, index }: ToolRendererProps) {
  switch (part.type) {
    case "tool-getLocation":
      return (
        <div className="my-1">
          <LocationTool part={part} messageId={messageId} index={index} />
        </div>
      );

    case "tool-getWeather":
      return (
        <div className="my-1">
          <WeatherTool part={part} messageId={messageId} index={index} />
        </div>
      );

    default:
      return null;
  }
}
