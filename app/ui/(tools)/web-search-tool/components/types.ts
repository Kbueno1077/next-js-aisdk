import { UIMessage, UIDataTypes } from "ai";

export interface WebSearchInput {
  query: string;
}

export interface WebSearchOutput {
  results: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
  query: string;
  totalResults?: number;
}

export type WebSearchToolPart = UIMessage<
  never,
  UIDataTypes,
  {
    web_search_preview: {
      input: WebSearchInput;
      output: WebSearchOutput;
    };
  }
>["parts"][0] & {
  type: "tool-web_search_preview";
};
