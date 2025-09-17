import { UIMessage, UIDataTypes } from "ai";

export interface WeatherInput {
  city: string;
}

export interface WeatherOutput {
  location: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  unit: string;
  note?: string;
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
