"use client";

import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  ArrowLeft,
  Code,
  File,
  Mic,
  Pause,
  Play,
  RotateCcw,
  Upload,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { TranscribeAudioCode } from "./TranscribeAudioCode";

interface TranscriptionResponse {
  text: string;
  segments?: {
    start: number;
    end: number;
    text: string;
  }[];
  language?: string;
  durationInSeconds?: number;
}

function TranscribeAudioPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcription, setTranscription] =
    useState<TranscriptionResponse | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showCode, setShowCode] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!audioFile) {
      const errorMessage = "Please select an audio file";
      toast.error("Transcription error occurred: " + errorMessage);
      setError(errorMessage);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("audio", audioFile);

      const response = await fetch("/api/transcribe-audio", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to transcribe audio");
      }

      const data = await response.json();
      setTranscription(data);

      // Reset playback state but keep audio file and URL
      setIsPlaying(false);
      setCurrentTime(0);
      // Don't reset duration as we want to keep it for the transcription result
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to transcribe audio";
      toast.error("Transcription error occurred: " + errorMessage);
      setError(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Clean up previous audio URL
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      setAudioFile(file);
      setTranscription(null);
      setError(null);

      // Create new URL for audio playback
      const newAudioUrl = URL.createObjectURL(file);
      setAudioUrl(newAudioUrl);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    }
  };

  const handleNewTranscription = () => {
    // Stop audio if playing
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }

    // Clean up audio URL
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    // Reset all states
    setAudioFile(null);
    setTranscription(null);
    setError(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((error) => {
          console.error("Error playing audio:", error);
          setError(
            "Unable to play audio. The file may be corrupted or in an unsupported format."
          );
        });
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const clearSelectedFile = () => {
    // Stop audio if playing
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }

    // Clean up audio URL
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    // Reset file-related states
    setAudioFile(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return (
    <div className="flex flex-col h-dvh bg-gray-50 relative overflow-hidden">
      {/* Audio element - always present when we have an audioUrl */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={handleEnded}
          className="hidden"
          preload="metadata"
        />
      )}

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
              AI Audio Transcription
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowCode(!showCode)}
              variant="ghost"
              className="flex items-center gap-2"
            >
              <Code className="w-4 h-4" />
              <span className="inline">
                {showCode ? "Hide Code" : "View Code"}
              </span>
            </Button>

            {transcription && !showCode && (
              <Button
                onClick={handleNewTranscription}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <RotateCcw className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">New Transcription</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content Container - Add padding top and bottom to prevent overlap */}
      <div className="flex-1 overflow-y-auto pt-20 pb-40 overscroll-y-contain">
        {showCode ? (
          <TranscribeAudioCode />
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
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {!transcription && !isLoading ? (
              <div className="flex items-center justify-center h-full px-4 py-10">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mic className="w-8 h-8 text-gray-400" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                    Transcribe your audio with AI
                  </h2>
                  <p className="text-gray-500">
                    Upload an audio file and get accurate transcription powered
                    by Whisper!
                  </p>
                  <div className="mt-6 space-y-3">
                    <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                      Supported formats
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                        Voice recordings (WAV, MP3)
                      </div>
                      <div className="text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                        Podcast episodes
                      </div>
                      <div className="text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                        Meeting recordings
                      </div>
                    </div>
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
                          Transcribing your audio...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {transcription && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Transcription Result
                      </h3>
                      {(transcription.language ||
                        transcription.durationInSeconds) && (
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          {transcription.language && (
                            <span>Language: {transcription.language}</span>
                          )}
                          {transcription.durationInSeconds && (
                            <span>
                              Duration:{" "}
                              {formatDuration(transcription.durationInSeconds)}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Audio Player in Results */}
                      {audioUrl && audioFile && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <File className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {audioFile.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(audioFile.size)}
                                {duration > 0 &&
                                  ` • ${formatDuration(duration)}`}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <Button
                              type="button"
                              onClick={togglePlayPause}
                              size="icon"
                              className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600"
                            >
                              {isPlaying ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4 ml-0.5" />
                              )}
                            </Button>

                            <div className="flex-1 space-y-1">
                              <input
                                type="range"
                                min="0"
                                max={duration || 0}
                                value={currentTime}
                                onChange={handleSeek}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                style={{
                                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                                    duration
                                      ? (currentTime / duration) * 100
                                      : 0
                                  }%, #e5e7eb ${
                                    duration
                                      ? (currentTime / duration) * 100
                                      : 0
                                  }%, #e5e7eb 100%)`,
                                }}
                              />
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>{formatDuration(currentTime)}</span>
                                <span>{formatDuration(duration)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {transcription.text}
                      </p>
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
            {/* File display and audio player if selected but not yet transcribed */}
            {audioFile && !transcription && (
              <div className="mb-3">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <File className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {audioFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(audioFile.size)}
                          {duration > 0 && ` • ${formatDuration(duration)}`}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={clearSelectedFile}
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

                  {/* Audio Player */}
                  {audioUrl && (
                    <div className="flex items-center space-x-3">
                      <Button
                        type="button"
                        onClick={togglePlayPause}
                        size="icon"
                        className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600"
                      >
                        {isPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4 ml-0.5" />
                        )}
                      </Button>

                      <div className="flex-1 space-y-1">
                        <input
                          type="range"
                          min="0"
                          max={duration || 0}
                          value={currentTime}
                          onChange={handleSeek}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                              duration ? (currentTime / duration) * 100 : 0
                            }%, #e5e7eb ${
                              duration ? (currentTime / duration) * 100 : 0
                            }%, #e5e7eb 100%)`,
                          }}
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{formatDuration(currentTime)}</span>
                          <span>{formatDuration(duration)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!transcription ? (
              <form onSubmit={handleSubmit} className="relative">
                <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-200">
                  <label
                    htmlFor="audio-input"
                    className="cursor-pointer p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <Upload className="w-5 h-5" />
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    id="audio-input"
                    onChange={handleFileChange}
                    disabled={isLoading}
                  />

                  <div className="flex-1 text-gray-800 placeholder-gray-500">
                    {audioFile ? (
                      <span className="text-sm">
                        Ready to transcribe: {audioFile.name}
                      </span>
                    ) : (
                      <span className="text-gray-500">
                        Click upload icon to select an audio file
                      </span>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={!audioFile || isLoading}
                    className="px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:hover:scale-100"
                  >
                    {isLoading ? "Transcribing..." : "Transcribe"}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="text-center">
                <p className="text-gray-600 text-sm">
                  Transcription completed! Use the audio player above to listen
                  to your audio.
                </p>
              </div>
            )}
            <p className="text-xs text-gray-500 text-center mt-3">
              Supports MP3, WAV, M4A, and other audio formats
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default TranscribeAudioPage;
