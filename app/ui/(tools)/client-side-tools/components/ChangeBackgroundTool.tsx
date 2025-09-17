import { Image as ImageKit } from "@imagekit/next";
import React from "react";

interface ChangeBackgroundToolProps {
  part: {
    state: string;
    input?: {
      backgroundPrompt?: string;
    };
    output?: string;
    errorText?: string;
  };
  messageId: string;
  index: number;
}

export function ChangeBackgroundTool({
  part,
  messageId,
  index,
}: ChangeBackgroundToolProps) {
  switch (part.state) {
    case "input-streaming":
      return (
        <div className="whitespace-pre-wrap leading-relaxed">
          Changing background: {part.input?.backgroundPrompt}
        </div>
      );

    case "input-available":
      return (
        <div
          key={`${messageId}-${index}-change-bg`}
          className="whitespace-pre-wrap leading-relaxed"
        >
          <div className="flex items-center justify-center w-[500px] h-[500px] bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
              <p className="text-gray-500 text-sm">Changing background...</p>
              {part.input?.backgroundPrompt && (
                <p className="text-gray-400 text-xs mt-1 max-w-xs truncate">
                  &quot;{part.input.backgroundPrompt}&quot;
                </p>
              )}
            </div>
          </div>
        </div>
      );

    case "output-available":
      return (
        <div
          key={`${messageId}-${index}-change-bg`}
          className="whitespace-pre-wrap leading-relaxed"
        >
          <ImageKit
            urlEndpoint={"https://ik.imagekit.io/codevolutionbus/"}
            src={part.output || ""}
            alt="Generated image"
            width={500}
            height={500}
          />
        </div>
      );

    case "output-error":
      return (
        <div
          key={`${messageId}-${index}-change-bg`}
          className="whitespace-pre-wrap leading-relaxed text-red-500"
        >
          Error: {part.errorText}
        </div>
      );

    default:
      return null;
  }
}
