import {
  Brain,
  ClipboardList,
  Cloud,
  ImageIcon,
  Layers,
  MessageCircle,
  Mic,
  Palette,
  PenTool,
  Search,
  Settings,
  Target,
  Volume2,
  Wrench,
  Zap,
} from "lucide-react";

export const features = [
  {
    title: "Text Completion",
    description:
      "Advanced text completion powered by AI for creative writing and content generation.",
    href: "/ui/completition",
    icon: PenTool,
    gradient: "from-emerald-500 to-teal-600",
    bgGradient: "from-emerald-50 to-teal-50",
  },

  {
    title: "Streaming Responses",
    description:
      "Real-time streaming AI responses for dynamic and engaging user experiences.",
    href: "/ui/stream",
    icon: Zap,
    gradient: "from-purple-500 to-pink-600",
    bgGradient: "from-purple-50 to-pink-50",
  },
  {
    title: "AI Chat",
    description:
      "Interactive conversational AI with real-time messaging and context awareness.",
    href: "/ui/chat",
    icon: MessageCircle,
    gradient: "from-blue-500 to-indigo-600",
    bgGradient: "from-blue-50 to-indigo-50",
  },
  {
    title: "AI Reasoning Chat",
    description:
      "Advanced AI chat with reasoning capabilities, showing the AI's thought process in collapsible accordions.",
    href: "/ui/reasoning-chat",
    icon: Brain,
    gradient: "from-indigo-500 to-purple-600",
    bgGradient: "from-indigo-50 to-purple-50",
  },
  {
    title: "Structured Data",
    description:
      "Generate structured content like recipes with AI-powered object generation.",
    href: "/ui/structured-data",
    icon: Settings,
    gradient: "from-orange-500 to-red-600",
    bgGradient: "from-orange-50 to-red-50",
  },
  {
    title: "Structured Arrays",
    description:
      "Generate structured arrays of data like Pokemon lists with AI-powered collection generation.",
    href: "/ui/structured-array",
    icon: ClipboardList,
    gradient: "from-indigo-500 to-blue-600",
    bgGradient: "from-indigo-50 to-blue-50",
  },
  {
    title: "Structured Enums",
    description:
      "Classify and analyze text sentiment using AI-powered enum generation with predefined categories.",
    href: "/ui/structured-enum",
    icon: Target,
    gradient: "from-teal-500 to-cyan-600",
    bgGradient: "from-teal-50 to-cyan-50",
  },
  {
    title: "Multi-Modal Chat",
    description:
      "Advanced AI chat with support for text, images, and multiple input types for rich conversations.",
    href: "/ui/multi-modal-chat",
    icon: ImageIcon,
    gradient: "from-rose-500 to-pink-600",
    bgGradient: "from-rose-50 to-pink-50",
  },

  {
    title: "AI Image Generation",
    description:
      "Create stunning, high-quality images from text descriptions using advanced AI models.",
    href: "/ui/generate-image",
    icon: Palette,
    gradient: "from-violet-500 to-purple-600",
    bgGradient: "from-violet-50 to-purple-50",
  },
  {
    title: "Audio Transcription",
    description:
      "Convert speech to text with high accuracy using advanced AI-powered transcription.",
    href: "/ui/transcribe-audio",
    icon: Mic,
    gradient: "from-green-500 to-emerald-600",
    bgGradient: "from-green-50 to-emerald-50",
  },
  {
    title: "Speech Generation",
    description:
      "Convert text to natural-sounding speech using advanced AI-powered text-to-speech technology.",
    href: "/ui/generate-speech",
    icon: Volume2,
    gradient: "from-amber-500 to-orange-600",
    bgGradient: "from-amber-50 to-orange-50",
  },

  {
    title: "AI Tools",
    description: "AI chat with powerful tools: weather",
    href: "/ui/tools",
    icon: Wrench,
    gradient: "from-slate-500 to-gray-600",
    bgGradient: "from-slate-50 to-gray-50",
  },
  {
    title: "Multiple Tools",
    description:
      "AI chat with multiple tools: location and weather services for enhanced interactions.",
    href: "/ui/multiple-tools",
    icon: Layers,
    gradient: "from-cyan-500 to-blue-600",
    bgGradient: "from-cyan-50 to-blue-50",
  },

  {
    title: "Weather API Tool",
    description:
      "AI chat with real-time weather data integration. Ask about weather in any city with beautiful UI.",
    href: "/ui/api-tool",
    icon: Cloud,
    gradient: "from-blue-500 to-indigo-600",
    bgGradient: "from-blue-50 to-indigo-50",
  },
  {
    title: "Web Search Tool",
    description:
      "AI chat with web search capabilities. Search the internet and get real-time information from the web.",
    href: "/ui/web-search-tool",
    icon: Search,
    gradient: "from-green-500 to-emerald-600",
    bgGradient: "from-green-50 to-emerald-50",
  },
];
