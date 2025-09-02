import { cn } from "@/lib/utils";

interface SuggestionButtonProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  className?: string;
}

export function SuggestionButtons({
  suggestions,
  onSuggestionClick,
  className,
}: SuggestionButtonProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">
        Try these examples
      </div>
      <div className="space-y-2">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            className="text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100 cursor-pointer hover:bg-gray-100 hover:border-gray-200 transition-all duration-200"
          >
            &ldquo;{suggestion}&rdquo;
          </div>
        ))}
      </div>
    </div>
  );
}
