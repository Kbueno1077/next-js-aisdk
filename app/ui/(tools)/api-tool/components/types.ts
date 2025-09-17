import { UIMessage, UIDataTypes } from "ai";

export interface WeatherInput {
  city: string;
}

export interface WeatherOutput {
  location: {
    name: string;
    country: string;
    localtime: string;
  };
  current: {
    temp_c: number;
    condition: {
      text: string;
      code: number;
    };
  };
}

export type WeatherToolPart = UIMessage<
  never,
  UIDataTypes,
  {
    getWeather: {
      input: WeatherInput;
      output: WeatherOutput;
    };
  }
>["parts"][0] & {
  type: "tool-getWeather";
};

export interface ToolRendererProps {
  part: WeatherToolPart;
  messageId: string;
  index: number;
}
