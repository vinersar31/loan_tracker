"use client";
import { Moon, Sun } from "lucide-react";
import { useUserPreferences } from "@/hooks/useUserPreferences";

export default function ThemeToggle() {
  const { prefs, toggleTheme, mounted } = useUserPreferences();

  // Prevent hydration mismatch
  if (!mounted) return <div className="h-10 w-10" />;

  const isDark = prefs.theme === "dark";
  return (
    <button
      onClick={toggleTheme}
      className="icon-btn"
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
