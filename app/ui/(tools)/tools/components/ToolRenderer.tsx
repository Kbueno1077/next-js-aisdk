import { WeatherTool } from "./WeatherTool";
import { WeatherToolPart } from "./types";

export interface ToolRendererProps {
  part: WeatherToolPart;
  messageId: string;
  index: number;
}

export function ToolRenderer({ part, messageId, index }: ToolRendererProps) {
  switch (part.type) {
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
