import { UIMessage, UIDataTypes } from "ai";

export interface LocationInput {
  name: string;
}

export interface LocationOutput {
  location: string;
}

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

export type LocationToolPart = UIMessage<
  never,
  UIDataTypes,
  {
    getLocation: {
      input: LocationInput;
      output: LocationOutput;
    };
    getWeather: {
      input: WeatherInput;
      output: WeatherOutput;
    };
  }
>["parts"][0] & {
  type: "tool-getLocation";
};

export type WeatherToolPart = UIMessage<
  never,
  UIDataTypes,
  {
    getLocation: {
      input: LocationInput;
      output: LocationOutput;
    };
    getWeather: {
      input: WeatherInput;
      output: WeatherOutput;
    };
  }
>["parts"][0] & {
  type: "tool-getWeather";
};

export type ToolPart = LocationToolPart | WeatherToolPart;
