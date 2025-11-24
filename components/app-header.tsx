"use client";

import { Button } from "@/components/ui/button";
import { Code2, Sun, Moon, Github } from "lucide-react";

interface AppHeaderProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export function AppHeader({ theme, onToggleTheme }: AppHeaderProps) {
  return (
    <header className="h-16 border-b flex items-center justify-between px-6 sticky top-0 bg-background z-50">
      <div className="flex items-center gap-2">
        <Code2 className="w-6 h-6 text-blue-600" />
        <h1 className="text-xl font-semibold" data-testid="text-app-title">
          Code Copilot
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={onToggleTheme}
          data-testid="button-theme-toggle"
          aria-label="Toggle theme"
          className="cursor-pointer"
        >
          {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </Button>
        <Button
          size="icon"
          variant="ghost"
          asChild
          data-testid="link-github"
          aria-label="GitHub repository"
          className="cursor-pointer"
        >
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">
            <Github className="w-5 h-5" />
          </a>
        </Button>
      </div>
    </header>
  );
}