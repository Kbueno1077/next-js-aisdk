import { WeatherTool } from "./WeatherTool";
import { DynamicTool } from "./DynamicTool";
import { WeatherToolPart, DynamicToolPart } from "./types";

export interface ToolRendererProps {
  part: WeatherToolPart | DynamicToolPart;
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

    case "dynamic-tool":
      return (
        <div className="my-1">
          <DynamicTool part={part} messageId={messageId} index={index} />
        </div>
      );

    default:
      return null;
  }
}
