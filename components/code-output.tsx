"use client";

import { useState, useEffect, memo } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, Check, Minus, Plus, Braces } from "lucide-react";
import { CodeLanguage } from "@/shared/schema";

const SyntaxHighlighter = dynamic(
  () => import("react-syntax-highlighter").then((mod) => mod.Prism),
  { 
    ssr: false,
    loading: () => <Skeleton className="h-96 w-full" />
  }
) as any;

interface CodeOutputProps {
  code: string;
  language: CodeLanguage;
  isGenerating: boolean;
  theme: "light" | "dark";
  onCopy: () => void;
  copied: boolean;
}

export const CodeOutput = memo(function CodeOutput({
  code,
  language,
  isGenerating,
  theme,
  onCopy,
  copied,
}: CodeOutputProps) {
  const [fontSize, setFontSize] = useState(14);
  const [syntaxTheme, setSyntaxTheme] = useState<any>(null);

  useEffect(() => {
    const loadTheme = async () => {
      if (theme === "dark") {
        const mod = await import("react-syntax-highlighter/dist/esm/styles/prism/one-dark");
        setSyntaxTheme(mod.default);
      } else {
        const mod = await import("react-syntax-highlighter/dist/esm/styles/prism/one-light");
        setSyntaxTheme(mod.default);
      }
    };
    loadTheme();
  }, [theme]);

  const increaseFontSize = () => setFontSize((prev) => Math.min(prev + 2, 24));
  const decreaseFontSize = () => setFontSize((prev) => Math.max(prev - 2, 10));

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="h-14 border-b flex items-center justify-between px-6 sticky top-0 bg-background z-40">
        <h2 className="text-lg font-medium" data-testid="text-output-title">
          Generated Code
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border rounded-md" role="group" aria-label="Font size controls">
            <Button
              size="icon"
              variant="ghost"
              onClick={decreaseFontSize}
              disabled={fontSize <= 10}
              className="h-8 w-8 cursor-pointer"
              data-testid="button-decrease-font"
              aria-label="Decrease font size"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="text-xs px-2 text-muted-foreground min-w-10 text-center" data-testid="text-font-size">
              {fontSize}px
            </span>
            <Button
              size="icon"
              variant="ghost"
              onClick={increaseFontSize}
              disabled={fontSize >= 24}
              className="h-8 w-8 cursor-pointer"
              data-testid="button-increase-font"
              aria-label="Increase font size"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <Button
            size="sm"
            onClick={onCopy}
            disabled={!code}
            data-testid="button-copy-code"
            aria-label="Copy code to clipboard"
            className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6" aria-live="polite" aria-busy={isGenerating}>
        {isGenerating && (
          <div className="space-y-4" data-testid="loading-skeleton">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-5/6" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-4/5" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-5/6" />
            <Skeleton className="h-6 w-2/3" />
          </div>
        )}
        {!isGenerating && !code && (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground" data-testid="empty-state">
            <Braces className="w-16 h-16 mb-4 opacity-50" data-testid="icon-empty-brackets" />
            <p className="text-center" data-testid="text-empty-message">
              Generate code to see results here
            </p>
          </div>
        )}
        {!isGenerating && code && syntaxTheme && (
          <div className="rounded-md overflow-hidden border" data-testid="code-output">
            <SyntaxHighlighter
              language={language === "cpp" ? "cpp" : language}
              style={syntaxTheme}
              showLineNumbers
              wrapLongLines
              customStyle={{
                margin: 0,
                fontSize: `${fontSize}px`,
                lineHeight: "1.6",
              }}
              codeTagProps={{
                style: {
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                },
              }}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        )}
      </div>
    </div>
  );
});