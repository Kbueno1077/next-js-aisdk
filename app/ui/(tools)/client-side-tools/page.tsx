"use client";

import type { ChatMessage } from "@/app/api/(tools)/client-side-tools/route";
import { Button } from "@/components/ui/button";
import { SuggestionButtons } from "@/components/ui/suggestion-buttons";
import { Textarea } from "@/components/ui/textarea";
import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import {
  AlertCircle,
  ArrowLeft,
  Code,
  File,
  ImageIcon,
  Send,
  Square,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ClientSideToolsCode } from "./ClientSideToolsCode";
import { ToolRenderer } from "./components";

function buildTransformationUrl(
  baseUrl: string,
  transformation: string
): string {
  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}tr=${transformation}`;
}

function ClientSideTools() {
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const [showCode, setShowCode] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { messages, sendMessage, status, error, stop, addToolResult } =
    useChat<ChatMessage>({
      transport: new DefaultChatTransport({
        api: "/api/client-side-tools",
      }),

      onError: async (error) => {
        toast.error("Gen image tool error occurred: " + error.message);
      },
      sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
      async onToolCall({ toolCall }) {
        if (toolCall.dynamic) {
          return;
        }
        switch (toolCall.toolName) {
          case "changeBackground":
            {
              const { imageUrl, backgroundPrompt } = toolCall.input;

              const transformation = `e-changebg-prompt-${backgroundPrompt}`;
              const transformedUrl = buildTransformationUrl(
                imageUrl,
                transformation
              );

              addToolResult({
                tool: "changeBackground",
                toolCallId: toolCall.toolCallId,
                output: transformedUrl,
              });
            }
            break;
          case "removeBackground":
            {
              const { imageUrl } = toolCall.input;

              const transformation = `e-bgremove`;
              const transformedUrl = buildTransformationUrl(
                imageUrl,
                transformation
              );

              addToolResult({
                tool: "removeBackground",
                toolCallId: toolCall.toolCallId,
                output: transformedUrl,
              });
            }
            break;
        }
      },
    });

  const [prompt, setPrompt] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "Generate an image of a cat",
    "What's in this picture?",
    "Generate an image of a dog",
  ];

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
    textareaRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    sendMessage({
      text: prompt,
      files,
    });
    setPrompt("");
    setFiles(undefined);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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

  const removeFile = (indexToRemove: number) => {
    if (!files) return;

    const dt = new DataTransfer();
    Array.from(files).forEach((file, index) => {
      if (index !== indexToRemove) {
        dt.items.add(file);
      }
    });

    setFiles(dt.files.length > 0 ? dt.files : undefined);
    if (fileInputRef.current) {
      fileInputRef.current.files = dt.files.length > 0 ? dt.files : null;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [prompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
              AI Assistant + Client-Side Tools
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

      {/* Messages Container - Add padding top and bottom to prevent overlap */}
      <div className="flex-1 overflow-y-auto pt-20 pb-40 overscroll-y-contain">
        {showCode ? (
          <ClientSideToolsCode />
        ) : (
          <div className="max-w-3xl mx-auto">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full px-4 py-10">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                    Start a conversation
                  </h2>
                  <p className="text-gray-500">
                    Send a message to begin chatting with the AI assistant. You
                    can include text and images!
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
              <div className="px-4 py-6 space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    } mb-4`}
                  >
                    <div
                      className={`w-fit  px-4 py-3 rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl ${
                        message.role === "user"
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                          : "bg-white border border-gray-200 text-gray-800 shadow-sm hover:border-gray-300"
                      }`}
                    >
                      {message.parts.map((part, index) => {
                        switch (part.type) {
                          case "text":
                            return (
                              <div
                                key={`${message.id}-${index}`}
                                className="whitespace-pre-wrap leading-relaxed"
                              >
                                {part.text}
                              </div>
                            );
                          case "file":
                            if (part.mediaType?.startsWith("image/")) {
                              return (
                                <div
                                  key={`${message.id}-${index}`}
                                  className="whitespace-pre-wrap leading-relaxed"
                                >
                                  <Image
                                    key={`${message.id}-${index}-image`}
                                    src={part.url}
                                    alt={part.filename || `attachment-${index}`}
                                    width={500}
                                    height={500}
                                  />
                                </div>
                              );
                            }

                            if (part.mediaType?.startsWith("application/pdf")) {
                              return (
                                <iframe
                                  key={`${message.id}-${index}-pdf`}
                                  src={part.url}
                                  width={500}
                                  height={600}
                                  title={part.filename || `attachment-${index}`}
                                />
                              );
                            }

                            return null;

                          case "tool-generateImage":
                          case "tool-changeBackground":
                          case "tool-removeBackground":
                            return (
                              <ToolRenderer
                                key={`${message.id}-${index}-tool`}
                                part={part}
                                messageId={message.id}
                                index={index}
                              />
                            );

                          default:
                            return null;
                        }
                      })}
                    </div>
                  </div>
                ))}

                {/* Error Display */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-red-800">
                          Error occurred
                        </h3>
                        <p className="text-sm text-red-700 mt-1">
                          {error.message}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {(status === "submitted" || status === "streaming") && (
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
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Area - Fixed at bottom with mobile safe area */}
      {!showCode && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 z-10 safe-area-inset-bottom">
          <div className="max-w-3xl mx-auto">
            {/* File attachments display */}
            {files && files.length > 0 && (
              <div className="mb-3 space-y-2">
                {Array.from(files).map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={() => removeFile(index)}
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6 bg-gray-200 hover:bg-red-100 rounded-full"
                    >
                      <svg
                        className="w-3 h-3 text-gray-600 group-hover:text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="relative">
              <div className="flex items-end gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-200">
                <label
                  htmlFor="file-input"
                  className="cursor-pointer p-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <File className="w-5 h-5" />
                </label>

                <input
                  type="file"
                  id="file-input"
                  ref={fileInputRef}
                  onChange={(e) => setFiles(e.target.files || undefined)}
                  className="hidden"
                  multiple
                />
                <Textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder-gray-500 max-h-48 resize-none text-[16px] leading-6"
                  rows={1}
                  disabled={status === "submitted" || status === "streaming"}
                  style={{
                    WebkitAppearance: "none",
                    WebkitBorderRadius: "0px",
                  }}
                />

                {status === "streaming" ? (
                  <Button
                    type="button"
                    onClick={stop}
                    variant="destructive"
                    size="icon"
                    className="w-10 h-10 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 flex-shrink-0"
                  >
                    <Square className="w-4 h-4 text-white" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={!prompt.trim() || status !== "ready"}
                    size="icon"
                    className="w-10 h-10 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:hover:scale-100 flex-shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                )}
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

export default ClientSideTools;
