"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SuggestionButtons } from "@/components/ui/suggestion-buttons";
import { ArrowLeft, Code, PenTool, Send, Plus } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { CompletitionCode } from "./CompletitionCode";

const suggestions = [
  "Complete this sentence: The future of AI is...",
  "Write a paragraph about space exploration",
  "Continue this story: Once upon a time...",
];

function Completition() {
  const [inputValue, setInputValue] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    textareaRef.current?.focus();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    setResponse("");
    setIsLoading(true);

    try {
      const apiResponse = await fetch("/api/completition", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ prompt: inputValue.trim() }),
      });
      const data = await apiResponse.json();

      if (data.error) {
        throw new Error(data.error || "Something went wrong");
      }

      setResponse(data.steps[0].content[0].text);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong";
      toast.error("Completition error occurred: " + errorMessage);
      setResponse(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  const handleNewTask = () => {
    setInputValue("");
    setResponse("");
  };

  return (
    <div className="flex flex-col h-dvh bg-gray-50 relative overflow-hidden">
      {/* Header - Fixed at top with mobile safe area */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-3 z-20 safe-area-inset-top">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-xl font-semibold text-gray-800">
              AI Assistant
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowCode(!showCode)}
              variant="ghost"
              className="flex items-center gap-2"
            >
              <Code className="w-4 h-4" />
              {showCode ? "Hide Code" : "View Code"}
            </Button>
            {response && !showCode && (
              <Button
                onClick={handleNewTask}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Plus className="w-4 h-4 sm:hidden" />
                <span className="hidden sm:inline">New Task</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content Container - Add padding top and bottom to prevent overlap */}
      <div className="flex-1 overflow-y-auto pt-20 pb-40 overscroll-y-contain">
        {showCode ? (
          <CompletitionCode />
        ) : (
          <div className="max-w-3xl mx-auto">
            {!response && !isLoading ? (
              <div className="flex items-center justify-center h-full px-4 py-10">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PenTool className="w-8 h-8 text-gray-400" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                    What task can I help you with?
                  </h2>
                  <p className="text-gray-500">
                    Describe your task and I&apos;ll provide assistance with
                    text completion!
                  </p>
                  <div className="mt-6">
                    <SuggestionButtons
                      suggestions={suggestions}
                      onSuggestionClick={handleSuggestionClick}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-4 py-6">
                {isLoading && (
                  <div className="flex justify-start mb-4">
                    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-lg">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 font-medium">
                          AI is typing...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {response && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-lg">
                    <div className="whitespace-pre-wrap leading-relaxed text-gray-800">
                      {response}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Area - Fixed at bottom with mobile safe area */}
      {!showCode && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 z-10 safe-area-inset-bottom">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="relative">
              <div className="flex items-end gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-200">
                <Textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe your task..."
                  className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder-gray-500 max-h-48 resize-none text-[16px] leading-6"
                  rows={1}
                  disabled={isLoading}
                  style={{
                    WebkitAppearance: "none",
                    WebkitBorderRadius: "0px",
                  }}
                />
                <Button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  size="icon"
                  className="w-10 h-10 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:hover:scale-100 flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
            <p className="text-xs text-gray-500 text-center mt-3">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Completition;
