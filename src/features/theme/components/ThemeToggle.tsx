"use client";
import { Button } from "@/components/ui/button";
import { setCookie } from "@/utils/helpers";
import { Sun, Moon } from "lucide-react";
import { useState } from "react";

export default function ThemeToggle({
  initialTheme,
}: {
  initialTheme?: string;
}) {
  const [theme, setTheme] = useState(initialTheme);
  const isDark = theme === "dark";

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    setCookie("theme", newTheme, 365);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

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
