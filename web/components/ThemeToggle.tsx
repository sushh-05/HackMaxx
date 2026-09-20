"use client";
import { useEffect, useState } from "react";
import { IconSun, IconMoon } from "./Icons";
import { Button } from "./ui/button";

type Theme = "dark" | "light";

const STORAGE_KEY = "hackmaxx-theme";

function readStoredTheme(): Theme | null {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "dark" || saved === "light") return saved;
  // legacy daisyUI values, so an existing preference isn't flipped
  if (saved === "hackmaxx") return "dark";
  if (saved === "hackmaxx-light") return "light";
  return null;
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initial = readStoredTheme() ?? "dark";
    setTheme(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  if (!mounted) {
    return (
      <div className="size-9 rounded-xl border border-base-content/15 bg-base-200/50" aria-hidden="true" />
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className="h-9 w-9 rounded-xl border border-base-content/15 hover:border-primary/40 hover:bg-base-300 transition-all duration-200"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <IconSun className="size-4 text-warning transition-transform duration-300 hover:rotate-45" />
      ) : (
        <IconMoon className="size-4 text-primary transition-transform duration-300 hover:-rotate-12" />
      )}
    </Button>
  );
}
