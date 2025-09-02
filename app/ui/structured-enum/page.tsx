"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SuggestionButtons } from "@/components/ui/suggestion-buttons";
import { AlertCircle, ArrowLeft, Code, Send, Target } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { StructuredEnumCode } from "./StructuredEnumCode";

function StructuredEnum() {
  const [text, setText] = useState("");
  const [analyzedText, setAnalyzedText] = useState("");
  const [sentiment, setSentiment] = useState<
    "positive" | "negative" | "neutral" | ""
  >("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [showCode, setShowCode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const suggestions = [
    "I love this amazing product!",
    "This is terrible and disappointing",
    "The weather is cloudy today",
  ];

  const handleSuggestionClick = (suggestion: string) => {
    setText(suggestion);
    textareaRef.current?.focus();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!text.trim()) return;

    setIsLoading(true);
    setError(null);
    setAnalyzedText(text);

    try {
      const response = await fetch("/api/structured-enum", {
        method: "POST",
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      setSentiment(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong";
      toast.error("Structured enum error occurred: " + errorMessage);
      setError(error as Error);
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
  }, [text]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "from-green-400 to-emerald-500";
      case "negative":
        return "from-red-400 to-rose-500";
      case "neutral":
        return "from-gray-400 to-slate-500";
      default:
        return "from-gray-400 to-slate-500";
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return (
          <svg
            className="w-8 h-8 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "negative":
        return (
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "neutral":
        return (
          <svg
            className="w-8 h-8 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 10h.01M15 10h.01"
            />
          </svg>
        );
      default:
        return null;
    }
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
              AI Sentiment Analyzer
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
          </div>
        </div>
      </div>

      {/* Content Container - Add padding top and bottom to prevent overlap */}
      <div className="flex-1 overflow-y-auto pt-20 pb-40 overscroll-y-contain">
        {showCode ? (
          <StructuredEnumCode />
        ) : (
          <div className="max-w-3xl mx-auto">
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg mx-4 mt-4 p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-red-800">
                      Error occurred
                    </h3>
                    <p className="text-sm text-red-700 mt-1">{error.message}</p>
                  </div>
                </div>
              </div>
            )}

            {!sentiment && !isLoading ? (
              <div className="flex items-center justify-center h-full px-4 py-10">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-gray-400" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                    Analyze Your Text
                  </h2>
                  <p className="text-gray-500">
                    Enter any text and I&apos;ll analyze its sentiment using
                    structured enums!
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
                          Analyzing sentiment...
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {sentiment && !isLoading && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6 my-8 shadow-sm">
                    <div
                      className={`bg-gradient-to-r ${getSentimentColor(
                        sentiment
                      )} px-8 py-6 rounded-lg`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                          {getSentimentIcon(sentiment)}
                        </div>
                        <div>
                          <h1 className="text-3xl font-bold text-white mb-1 capitalize">
                            {sentiment} Sentiment
                          </h1>
                          <div className="flex items-center text-white/90">
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-sm">
                              AI Analysis Complete
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Result Content */}
                    <div className="p-8">
                      <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">
                          Analyzed Text:
                        </h3>
                        <p className="text-gray-700 leading-relaxed text-lg">
                          &quot;{analyzedText}&quot;
                        </p>
                      </div>

                      <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-3 mb-4">
                          <div
                            className={`w-8 h-8 bg-gradient-to-r ${getSentimentColor(
                              sentiment
                            )} rounded-lg flex items-center justify-center`}
                          >
                            <svg
                              className="w-5 h-5 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                              />
                            </svg>
                          </div>
                          <h3 className="text-xl font-bold text-gray-800">
                            Sentiment Analysis Result
                          </h3>
                        </div>
                        <div className="flex items-center gap-3">
                          {getSentimentIcon(sentiment)}
                          <div>
                            <p className="text-lg font-semibold text-gray-800 capitalize">
                              {sentiment}
                            </p>
                            <p className="text-sm text-gray-600">
                              {sentiment === "positive" &&
                                "This text expresses positive emotions or opinions"}
                              {sentiment === "negative" &&
                                "This text expresses negative emotions or opinions"}
                              {sentiment === "neutral" &&
                                "This text is neutral and does not express any emotions or opinions"}
                            </p>
                          </div>
                        </div>
                      </div>
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
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter text to analyze..."
                  className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder-gray-500 max-h-48 resize-none text-[16px] leading-6"
                  rows={1}
                  disabled={isLoading}
                  ref={textareaRef}
                  style={{
                    WebkitAppearance: "none",
                    WebkitBorderRadius: "0px",
                  }}
                />
                <Button
                  type="submit"
                  disabled={!text.trim() || isLoading}
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

export default StructuredEnum;
