"use client";

import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./useTheme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="rounded-xl bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:bg-slate-300 dark:hover:bg-slate-800 transition-colors"
    >
      {theme === "dark" ? (
        <Moon className="h-5 w-5 text-indigo-400" />
      ) : (
        <Sun className="h-5 w-5 text-amber-500" />
      )}
      <span className="sr-only">Toggle Theme</span>
    </Button>
  );
}
