"use client";

import { useState, memo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles } from "lucide-react";
import { CodeLanguage } from "@/shared/schema";

interface PromptInputProps {
  onGenerate: (prompt: string, language: CodeLanguage) => void;
  isGenerating: boolean;
}

export const PromptInput = memo(function PromptInput({ onGenerate, isGenerating }: PromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState<CodeLanguage>("python");

  const handleGenerate = () => {
    if (prompt.trim()) {
      onGenerate(prompt, language);
    }
  };

  const handleClear = () => {
    setPrompt("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Shift+Enter to generate
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-lg font-medium" data-testid="label-prompt">
          Enter Prompt
        </label>
        <Select
          value={language}
          onValueChange={(value) => setLanguage(value as CodeLanguage)}
        >
          <SelectTrigger className="w-48 cursor-pointer" data-testid="select-language" aria-label="Select programming language">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="python" data-testid="option-python" className="cursor-pointer">
              Python
            </SelectItem>
            <SelectItem value="javascript" data-testid="option-javascript" className="cursor-pointer">
              JavaScript
            </SelectItem>
            <SelectItem value="typescript" data-testid="option-typescript" className="cursor-pointer">
              TypeScript
            </SelectItem>
            <SelectItem value="java" data-testid="option-java" className="cursor-pointer">
              Java
            </SelectItem>
            <SelectItem value="cpp" data-testid="option-cpp" className="cursor-pointer">
              C++
            </SelectItem>
            <SelectItem value="go" data-testid="option-go" className="cursor-pointer">
              Go
            </SelectItem>
            <SelectItem value="csharp" data-testid="option-csharp" className="cursor-pointer">
              C#
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Textarea
        placeholder="e.g., Write a function to reverse a string"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        className="min-h-[200px] resize-y font-mono text-sm leading-relaxed focus:border-none"
        data-testid="input-prompt"
        disabled={isGenerating}
        aria-label="Code prompt input"
      />

      <div className="flex gap-4">
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          data-testid="button-generate"
        >
          <Sparkles className="w-4 h-4 mr-2" aria-hidden="true" />
          {isGenerating ? "Generating..." : "Generate"}
        </Button>
        <Button
          variant="ghost"
          onClick={handleClear}
          disabled={isGenerating}
          data-testid="button-clear-prompt"
          className="cursor-pointer"
          aria-label="Clear prompt"
        >
          Clear
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Tip: Press <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted rounded border">Shift+Enter</kbd> to generate
      </p>
    </div>
  );
});