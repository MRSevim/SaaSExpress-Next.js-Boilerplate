"use client";
import { Button } from "@/components/ui/button";
import { useThemeContext } from "@/features/theme/utils/contexts/ThemeContext";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, toggleTheme] = useThemeContext();
  const isDark = theme === "dark";

  return (
    <Button
      variant="outline"
      onClick={toggleTheme}
      aria-pressed={isDark}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="hidden md:inline">{isDark ? "Light" : "Dark"}</span>
    </Button>
  );
}
