"use client";

import { recipeSchema } from "@/app/api/sctructured-data/schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SuggestionButtons } from "@/components/ui/suggestion-buttons";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { AlertCircle, ArrowLeft, Code, Send, Settings } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { StructuredDataCode } from "./StructuredDataCode";

function StructuredData() {
  const [dishName, setDishName] = useState("");
  const [showCode, setShowCode] = useState(false);
  const { submit, object, isLoading, error, stop } = useObject({
    api: "/api/sctructured-data",
    schema: recipeSchema,
    onError: async (error) => {
      toast.error("Structured data error occurred: " + error.message);
    },
  });
  const recipeRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const suggestions = [
    "Chocolate chip cookies",
    "Spaghetti carbonara",
    "Chicken curry",
  ];

  const handleSuggestionClick = (suggestion: string) => {
    setDishName(suggestion);
    textareaRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!dishName.trim()) return;
    submit({
      dish: dishName,
    });
    setDishName("");
  };

  const handleStop = () => {
    stop();
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
  }, [dishName]);

  useEffect(() => {
    if (object?.recipe && recipeRef.current) {
      recipeRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [object?.recipe]);

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
              AI Recipe Generator
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
          <StructuredDataCode />
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

            {!object?.recipe && !isLoading ? (
              <div className="flex items-center justify-center h-full px-4 py-10">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Settings className="w-8 h-8 text-gray-400" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                    What would you like to cook?
                  </h2>
                  <p className="text-gray-500">
                    Enter any dish name and I&apos;ll generate a complete recipe
                    for you with structured data!
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
              <div className="space-y-6 px-4 py-6">
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
                          Generating recipe...
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {object?.recipe && (
                  <div
                    ref={recipeRef}
                    className="bg-white rounded-2xl shadow-xl border border-orange-100 my-8 overflow-hidden"
                  >
                    {/* Recipe Header */}
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-6">
                      <h1 className="text-3xl font-bold text-white mb-2">
                        {object.recipe.name}
                      </h1>
                      <div className="flex items-center text-orange-100">
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
                        <span className="text-sm">AI Generated Recipe</span>
                      </div>
                    </div>

                    {/* Recipe Content */}
                    <div className="p-8">
                      <div className="grid md:grid-cols-2 gap-8">
                        {/* Ingredients Section */}
                        <div>
                          <div className="flex items-center mb-6">
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                              <svg
                                className="w-5 h-5 text-orange-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                              </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">
                              Ingredients
                            </h2>
                          </div>
                          <div className="space-y-3">
                            {object.recipe.ingredients?.map(
                              (ingredient, index) => (
                                <div
                                  key={index}
                                  className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100"
                                >
                                  <div className="w-2 h-2 bg-orange-400 rounded-full mr-3"></div>
                                  <div className="flex-1">
                                    <span className="font-medium text-gray-800">
                                      {ingredient?.amount}
                                    </span>
                                    <span className="text-gray-600 ml-2">
                                      {ingredient?.name}
                                    </span>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>

                        {/* Instructions Section */}
                        <div>
                          <div className="flex items-center mb-6">
                            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                              <svg
                                className="w-5 h-5 text-red-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                              </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">
                              Instructions
                            </h2>
                          </div>
                          <div className="space-y-4">
                            {object.recipe.steps?.map((step, index) => (
                              <div
                                key={index}
                                className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100"
                              >
                                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-red-400 to-orange-500 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-bold text-white">
                                    {index + 1}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <p className="text-gray-700 leading-relaxed">
                                    {Array.isArray(step)
                                      ? step.join(" ")
                                      : step}
                                  </p>
                                </div>
                              </div>
                            ))}
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
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter a dish name..."
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
                  disabled={!dishName.trim() || isLoading}
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

export default StructuredData;
