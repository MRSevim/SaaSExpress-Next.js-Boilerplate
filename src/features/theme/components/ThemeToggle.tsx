"use client";
import { Button } from "@/components/ui/button";
import { useThemeContext } from "@/features/theme/contexts/ThemeContext";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, toggleTheme] = useThemeContext();
  const isDark = theme === "dark";

  return (
    <Button
      suppressHydrationWarning
      onClick={toggleTheme}
      aria-pressed={isDark}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      <span className="sr-only">Toggle theme</span>
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="hidden md:inline">{isDark ? "Light" : "Dark"}</span>
    </Button>
  );
}
