import React from "react";
import { GenerateImageTool } from "./GenerateImageTool";
import { ChangeBackgroundTool } from "./ChangeBackgroundTool";
import { RemoveBackgroundTool } from "./RemoveBackgroundTool";

interface ToolRendererProps {
  part: {
    type: string;
    state: string;
    input?: {
      prompt?: string;
      backgroundPrompt?: string;
      imageUrl?: string;
    };
    output?: string;
    errorText?: string;
  };
  messageId: string;
  index: number;
}

export function ToolRenderer({ part, messageId, index }: ToolRendererProps) {
  switch (part.type) {
    case "tool-generateImage":
      return (
        <GenerateImageTool part={part} messageId={messageId} index={index} />
      );

    case "tool-changeBackground":
      return (
        <ChangeBackgroundTool part={part} messageId={messageId} index={index} />
      );

    case "tool-removeBackground":
      return (
        <RemoveBackgroundTool part={part} messageId={messageId} index={index} />
      );

    default:
      return null;
  }
}
