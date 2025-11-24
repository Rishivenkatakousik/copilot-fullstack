"use client";

import { useState, memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import type { PromptHistory as PromptHistoryType, CodeLanguage } from "@/shared/schema";

const LANGUAGE_LABELS: Record<CodeLanguage, string> = {
  python: "Python",
  javascript: "JavaScript",
  cpp: "C++",
  java: "Java",
  typescript: "TypeScript",
  go: "Go",
  csharp: "C#",
};

interface PromptHistoryProps {
  history: PromptHistoryType[];
  onHistoryClick: (item: PromptHistoryType) => void;
  onDeleteHistory: (id: string) => void;
  onClearHistory: () => void;
}

export const PromptHistory = memo(function PromptHistory({
  history,
  onHistoryClick,
  onDeleteHistory,
  onClearHistory,
}: PromptHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [historyExpanded, setHistoryExpanded] = useState(true);

  const filteredHistory = searchQuery
    ? history.filter((item) =>
        item.prompt.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : history;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setHistoryExpanded(!historyExpanded)}
          className="flex items-center gap-2 text-lg font-medium hover-elevate active-elevate-2 px-2 py-1 rounded-md -ml-2 cursor-pointer"
          data-testid="button-toggle-history"
          aria-label={historyExpanded ? "Collapse prompt history" : "Expand prompt history"}
          aria-expanded={historyExpanded}
        >
          <span data-testid="text-history-title">Prompt History</span>
          {historyExpanded ? (
            <ChevronUp className="w-4 h-4" data-testid="icon-chevron-up" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-4 h-4" data-testid="icon-chevron-down" aria-hidden="true" />
          )}
        </button>
        {history.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearHistory}
            data-testid="button-clear-all-history"
            aria-label="Clear all prompt history"
            className="cursor-pointer"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            <span className="sr-only">Clear all history</span>
          </Button>
        )}
      </div>

      {historyExpanded && (
        <div className="space-y-4">
          {history.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-history"
                aria-label="Search prompt history"
              />
            </div>
          )}

          <div className="space-y-2 max-h-96 overflow-y-auto" role="list" aria-label="Prompt history items">
            {filteredHistory.length === 0 && history.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm" data-testid="text-empty-history">
                No prompts yet. Generate your first code snippet!
              </div>
            )}
            {filteredHistory.length === 0 && history.length > 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm" data-testid="text-no-results">
                No matching prompts found.
              </div>
            )}
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                onClick={() => onHistoryClick(item)}
                className="p-4 border rounded-md hover-elevate active-elevate-2 cursor-pointer space-y-2"
                data-testid={`history-item-${item.id}`}
                role="button"
                tabIndex={0}
                aria-label={`Load prompt: ${item.prompt}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onHistoryClick(item);
                  }
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm line-clamp-2 flex-1" data-testid={`text-prompt-${item.id}`}>
                    {item.prompt}
                  </p>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 shrink-0 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteHistory(item.id);
                    }}
                    data-testid={`button-delete-${item.id}`}
                    aria-label={`Delete prompt: ${item.prompt.substring(0, 50)}${item.prompt.length > 50 ? '...' : ''}`}
                  >
                    <Trash2 className="w-3 h-3" aria-hidden="true" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs" data-testid={`badge-language-${item.id}`}>
                    {LANGUAGE_LABELS[item.language]}
                  </Badge>
                  <span className="text-xs text-muted-foreground" data-testid={`text-timestamp-${item.id}`}>
                    {new Date(item.timestamp).toLocaleDateString()} at{" "}
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});