"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import type { HistoryResponse, CodeLanguage } from "@/shared/schema";
import { useState } from "react";

const LANGUAGE_LABELS: Record<CodeLanguage, string> = {
  python: "Python",
  javascript: "JavaScript",
  cpp: "C++",
  java: "Java",
  typescript: "TypeScript",
  go: "Go",
  csharp: "C#",
};

interface DatabaseHistoryProps {
  history: HistoryResponse | undefined;
  isLoading: boolean;
  currentPage: number;
  languageFilter: CodeLanguage | "all";
  onHistoryClick: (code: string, language: string) => void;
  onPageChange: (page: number) => void;
  onLanguageFilterChange: (language: CodeLanguage | "all") => void;
}

export const DatabaseHistory = memo(function DatabaseHistory({
  history,
  isLoading,
  currentPage,
  languageFilter,
  onHistoryClick,
  onPageChange,
  onLanguageFilterChange,
}: DatabaseHistoryProps) {
  const [historyExpanded, setHistoryExpanded] = useState(true);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setHistoryExpanded(!historyExpanded)}
          className="flex items-center gap-2 text-lg font-medium hover-elevate active-elevate-2 px-2 py-1 rounded-md -ml-2 cursor-pointer"
          data-testid="button-toggle-history"
          aria-label={historyExpanded ? "Collapse database history" : "Expand database history"}
          aria-expanded={historyExpanded}
        >
          <span data-testid="text-history-title">Database History</span>
          {historyExpanded ? (
            <ChevronUp className="w-4 h-4" data-testid="icon-chevron-up" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-4 h-4" data-testid="icon-chevron-down" aria-hidden="true" />
          )}
        </button>
        
        {/* Language Filter */}
        <Select
          value={languageFilter}
          onValueChange={(value) => onLanguageFilterChange(value as CodeLanguage | "all")}
        >
          <SelectTrigger className="w-32 h-8 text-xs" aria-label="Filter by language">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="javascript">JavaScript</SelectItem>
            <SelectItem value="cpp">C++</SelectItem>
            <SelectItem value="java">Java</SelectItem>
            <SelectItem value="typescript">TypeScript</SelectItem>
            <SelectItem value="go">Go</SelectItem>
            <SelectItem value="csharp">C#</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {historyExpanded && (
        <div className="space-y-4">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Empty State */}
          {!isLoading && (!history || history.data.length === 0) && (
            <div className="text-center py-12 text-muted-foreground text-sm" data-testid="text-empty-history">
              <p>No history found.</p>
              <p className="text-xs mt-2">Generate some code to see it here!</p>
            </div>
          )}

          {/* History Items */}
          {!isLoading && history && history.data.length > 0 && (
            <>
              <div className="space-y-2 max-h-96 overflow-y-auto" role="list" aria-label="Database history items">
                {history.data.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onHistoryClick(item.code, item.language.code)}
                    className="p-4 border rounded-md hover-elevate active-elevate-2 cursor-pointer space-y-2"
                    data-testid={`history-item-${item.id}`}
                    role="button"
                    tabIndex={0}
                    aria-label={`Load prompt: ${item.prompt}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onHistoryClick(item.code, item.language.code);
                      }
                    }}
                  >
                    <p className="text-sm line-clamp-2" data-testid={`text-prompt-${item.id}`}>
                      {item.prompt}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs" data-testid={`badge-language-${item.id}`}>
                        {item.language.name}
                      </Badge>
                      <span className="text-xs text-muted-foreground" data-testid={`text-timestamp-${item.id}`}>
                        {new Date(item.timestamp).toLocaleDateString()} at{" "}
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {history.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="cursor-pointer"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" aria-hidden="true" />
                    Previous
                  </Button>
                  
                  <span className="text-sm text-muted-foreground">
                    Page {history.pagination.page} of {history.pagination.totalPages}
                    <span className="text-xs ml-2">
                      ({history.pagination.total} total)
                    </span>
                  </span>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onPageChange(Math.min(history.pagination.totalPages, currentPage + 1))}
                    disabled={currentPage === history.pagination.totalPages}
                    className="cursor-pointer"
                    aria-label="Next page"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
});