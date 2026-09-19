"use client";
import { useEffect, useState } from "react";
import { IconSun, IconMoon } from "./Icons";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"hackmaxx" | "hackmaxx-light">("hackmaxx");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("hackmaxx-theme") as "hackmaxx" | "hackmaxx-light" | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    } else {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initial = isDark ? "hackmaxx" : "hackmaxx";
      setTheme(initial);
      document.documentElement.setAttribute("data-theme", initial);
    }
  }, []);

  function toggle() {
    const next = theme === "hackmaxx" ? "hackmaxx-light" : "hackmaxx";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("hackmaxx-theme", next);
  }

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl border border-base-content/15 bg-base-200/50" aria-hidden="true" />
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="btn btn-ghost btn-sm h-9 w-9 p-0 rounded-xl border border-base-content/15 hover:border-primary/40 hover:bg-base-300 transition-all duration-200"
      aria-label={`Switch to ${theme === "hackmaxx" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "hackmaxx" ? "light" : "dark"} mode`}
    >
      {theme === "hackmaxx" ? (
        <IconSun className="w-4 h-4 text-warning transition-transform duration-300 hover:rotate-45" />
      ) : (
        <IconMoon className="w-4 h-4 text-primary transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  );
}
