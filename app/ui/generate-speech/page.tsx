"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SuggestionButtons } from "@/components/ui/suggestion-buttons";
import {
  AlertCircle,
  ArrowLeft,
  Code,
  Play,
  Plus,
  Send,
  Volume2,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { GenerateSpeechCode } from "./GenerateSpeechCode";

function GenerateSpeech() {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAudio, setHasAudio] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const audioURlRef = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const suggestions = [
    "Hello, welcome to our AI assistant!",
    "The quick brown fox jumps over the lazy dog",
    "Today is a beautiful day for learning",
  ];

  const handleSuggestionClick = (suggestion: string) => {
    setText(suggestion);
    textareaRef.current?.focus();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;

    setError(null);
    setIsLoading(true);

    if (audioURlRef.current) {
      URL.revokeObjectURL(audioURlRef.current);
      audioURlRef.current = null;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }

    try {
      const response = await fetch("/api/generate-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate speech");
      }

      const audioBlob = await response.blob();
      audioURlRef.current = URL.createObjectURL(audioBlob);
      audioRef.current = new Audio(audioURlRef.current);

      setHasAudio(true);
      audioRef.current.play();
    } catch (err) {
      console.error("Speech generation error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to generate speech. Please try again.";
      toast.error("Speech generation error occurred: " + errorMessage);
      setError(errorMessage);
      setHasAudio(false);
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

  const replayAudio = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  const handleNewGeneration = () => {
    setText("");
    setHasAudio(false);
    setError(null);
    if (audioURlRef.current) {
      URL.revokeObjectURL(audioURlRef.current);
      audioURlRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (audioURlRef.current) {
        URL.revokeObjectURL(audioURlRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, []);

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
              AI Speech Generation
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
            {hasAudio && !showCode && (
              <Button
                onClick={handleNewGeneration}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Plus className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">New Generation</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content Container - Add padding top and bottom to prevent overlap */}
      <div className="flex-1 overflow-y-auto pt-20 pb-40 overscroll-y-contain">
        {/* Error Display - Moved inside content container */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg mx-4 mt-4 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  Error occurred
                </h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {showCode ? (
          <GenerateSpeechCode />
        ) : (
          <div className="max-w-3xl mx-auto">
            {!hasAudio && !isLoading ? (
              <div className="flex items-center justify-center h-full px-4 py-10">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Volume2 className="w-8 h-8 text-gray-400" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                    Convert Text to Speech
                  </h2>
                  <p className="text-gray-500">
                    Enter some text and I&apos;ll generate natural-sounding
                    speech for you!
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
                      <div className="flex items-center gap-3">
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
                          Generating speech...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {hasAudio && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          Speech Generated Successfully
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Your text has been converted to speech and played
                          automatically.
                        </p>
                      </div>
                      <Button
                        onClick={replayAudio}
                        className="flex items-center gap-2 bg-green-500 hover:bg-green-600"
                      >
                        <Play className="w-4 h-4" />
                        Replay
                      </Button>
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
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter text to convert to speech..."
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
                  disabled={!text.trim() || isLoading}
                  size="icon"
                  className="w-10 h-10 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:hover:scale-100 flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
            <p className="text-xs text-gray-500 text-center mt-3">
              Press Enter to generate, Shift+Enter for new line
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default GenerateSpeech;
