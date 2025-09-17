import { WeatherTool } from "./WeatherTool";
import { ToolRendererProps } from "./types";

export function ToolRenderer({ part, messageId, index }: ToolRendererProps) {
  switch (part.type) {
    case "tool-getWeather":
      return <WeatherTool part={part} messageId={messageId} index={index} />;

    default:
      return null;
  }
}
