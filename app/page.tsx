"use client";

import { useState, useCallback, useTransition } from "react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { CodeLanguage, GenerateResponse, HistoryResponse } from "@/shared/schema";
import { useTheme } from "@/components/theme-proovider";
import { AppHeader } from "@/components/app-header";
import { PromptInput } from "@/components/prompt-input";
import { DatabaseHistory } from "@/components/database-history";
import { CodeOutput } from "@/components/code-output";

export default function Home() {
  const [generatedCode, setGeneratedCode] = useState("");
  const [currentLanguage, setCurrentLanguage] = useState<CodeLanguage>("python");
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [historyPage, setHistoryPage] = useState(1);
  const [languageFilter, setLanguageFilter] = useState<CodeLanguage | "all">("all");
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();

  // Fetch history from database
  const { data: dbHistory, refetch: refetchHistory, isLoading } = useQuery({
    queryKey: ["history", historyPage, languageFilter],
    queryFn: async () => {
      const languageParam = languageFilter !== "all" ? `&language=${languageFilter}` : "";
      const res = await apiRequest("GET", `/api/history?page=${historyPage}&limit=10${languageParam}`);
      return await res.json() as HistoryResponse;
    },
    staleTime: 30000, // 30 seconds
  });

  const generateMutation = useMutation({
    mutationFn: async (data: { prompt: string; language: CodeLanguage }) => {
      const res = await apiRequest("POST", "/api/generate", data);
      return await res.json() as GenerateResponse;
    },
    onSuccess: (data, variables) => {
      startTransition(() => {
        setGeneratedCode(data.code);
        setCurrentLanguage(variables.language);
      });
      
      // Refetch database history
      refetchHistory();
      
      toast({
        title: "Code generated successfully!",
        description: "Your code is ready to use.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Generation failed",
        description: error.message || "There was an error generating code. Please try again.",
      });
    },
  });

  const handleGenerate = useCallback((prompt: string, language: CodeLanguage) => {
    if (!prompt.trim()) {
      toast({
        variant: "destructive",
        title: "Empty prompt",
        description: "Please enter a prompt to generate code.",
      });
      return;
    }
    generateMutation.mutate({ prompt, language });
  }, [generateMutation, toast]);

  const handleCopy = useCallback(async () => {
    if (!generatedCode) return;
    
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied to clipboard!",
        description: "Code has been copied successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Copy failed",
        description: "Failed to copy code to clipboard.",
      });
    }
  }, [generatedCode, toast]);

  const handleHistoryClick = useCallback((code: string, language: string) => {
    startTransition(() => {
      setGeneratedCode(code);
      setCurrentLanguage(language as CodeLanguage);
    });
  }, []);

  return (
    <div className="flex flex-col h-screen bg-background">
      <AppHeader theme={theme} onToggleTheme={toggleTheme} />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Input & History */}
        <div className="w-full lg:w-2/5 flex flex-col border-r overflow-hidden">
          <div className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto">
            <PromptInput
              onGenerate={handleGenerate}
              isGenerating={generateMutation.isPending}
            />

            <Separator />

            {/* Database History */}
            <DatabaseHistory
              history={dbHistory}
              isLoading={isLoading}
              currentPage={historyPage}
              languageFilter={languageFilter}
              onHistoryClick={handleHistoryClick}
              onPageChange={setHistoryPage}
              onLanguageFilterChange={setLanguageFilter}
            />
          </div>
        </div>

        {/* Right Panel - Code Output (Desktop) */}
        <div className="hidden lg:flex flex-1 flex-col overflow-hidden">
          <CodeOutput
            code={generatedCode}
            language={currentLanguage}
            isGenerating={generateMutation.isPending}
            theme={theme}
            onCopy={handleCopy}
            copied={copied}
          />
        </div>
      </div>

      {/* Mobile Code Output */}
      <div className="lg:hidden p-6 border-t bg-background">
        <CodeOutput
          code={generatedCode}
          language={currentLanguage}
          isGenerating={generateMutation.isPending}
          theme={theme}
          onCopy={handleCopy}
          copied={copied}
        />
      </div>
    </div>
  );
}
