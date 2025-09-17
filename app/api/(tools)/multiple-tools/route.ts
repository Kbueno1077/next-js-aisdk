import { aj } from "@/arcject/config";
import { openai } from "@ai-sdk/openai";
import {
  InferUITools,
  UIDataTypes,
  UIMessage,
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
} from "ai";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const tools = {
  getLocation: tool({
    description: "Get the location of the user",
    inputSchema: z.object({
      name: z.string().describe("The name of the user"),
    }),
    execute: async ({ name }) => {
      if (name === "John") {
        return {
          location: "New York, USA",
        };
      }
      if (name === "Jane") {
        return {
          location: "London, UK",
        };
      }

      return {
        location: "Unknown",
      };
    },
  }),

  getWeather: tool({
    description: "Get the current weather for a given location",
    inputSchema: z.object({
      city: z.string().describe("The city to get the weather for"),
    }),
    execute: async ({ city }) => {
      // Simulate API delay for more realistic experience
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Mock weather data for demonstration
      const weatherData = {
        "New York": {
          temperature: 22,
          description: "Sunny",
          humidity: 65,
          windSpeed: 12,
        },
        London: {
          temperature: 15,
          description: "Cloudy",
          humidity: 75,
          windSpeed: 8,
        },
        Tokyo: {
          temperature: 28,
          description: "Clear",
          humidity: 70,
          windSpeed: 5,
        },
        Paris: {
          temperature: 18,
          description: "Partly cloudy",
          humidity: 60,
          windSpeed: 10,
        },
        Sydney: {
          temperature: 24,
          description: "Sunny",
          humidity: 55,
          windSpeed: 15,
        },
        Berlin: {
          temperature: 12,
          description: "Rainy",
          humidity: 80,
          windSpeed: 20,
        },
        "Gotham City": {
          temperature: 20,
          description: "Stormy",
          humidity: 90,
          windSpeed: 25,
        },
        Metropolis: {
          temperature: 10,
          description: "Overcast",
          humidity: 85,
          windSpeed: 30,
        },
      };

      const weather = weatherData[city as keyof typeof weatherData];

      if (weather) {
        return {
          location: city,
          temperature: weather.temperature,
          description: weather.description,
          humidity: weather.humidity,
          windSpeed: weather.windSpeed,
          unit: "celsius",
        };
      }

      // For unknown cities, return a generic response
      return {
        location: city,
        temperature: Math.floor(Math.random() * 30) + 5,
        description: "Variable conditions",
        humidity: Math.floor(Math.random() * 40) + 40,
        windSpeed: Math.floor(Math.random() * 20) + 5,
        unit: "celsius",
        note: "Weather data may not be accurate for this location",
      };
    },
  }),
};

export type ChatTools = InferUITools<typeof tools>;
export type ChatMessages = UIMessage<never, UIDataTypes, ChatTools>;

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: ChatMessages[] } = await req.json();

    if (!process.env.IS_DEV_MODE) {
      const decision = await aj.protect(req, {
        requested: 1,
      });

      if (decision.reason.isRateLimit()) {
        return NextResponse.json(
          {
            error: "Too Many Requests",
            message:
              "You have reached the rate limit for today. Please try again tomorrow.",
          },
          { status: 429 }
        );
      }
    }

    const result = streamText({
      model: openai("gpt-4.1-nano"),
      messages: convertToModelMessages(messages),
      tools,
      stopWhen: stepCountIs(4),
    });

    result.usage.then((usage) => {
      console.log({
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        totalTokens: usage.totalTokens,
      });
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate chat response", details: error },
      { status: 500 }
    );
  }
}
