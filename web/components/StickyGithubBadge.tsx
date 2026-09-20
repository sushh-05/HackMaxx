"use client";
import React from "react";
import { IconGithub, IconExternal } from "./Icons";

/**
 * Minimal sticky GitHub repository badge floating in the bottom-left corner
 * across all pages.
 */
export function StickyGithubBadge(): React.JSX.Element {
  return (
    <aside
      className="fixed bottom-4 left-4 z-50 flex items-center print:hidden select-none"
      aria-label="GitHub Repository"
    >
      <a
        href="https://github.com/sushh-05/HackMaxx"
        target="_blank"
        rel="noreferrer"
        className="group flex items-center gap-1.5 rounded-full border border-border/70 bg-card/85 p-2 sm:px-2.5 sm:py-1 text-xs text-muted-foreground shadow-md backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-card hover:text-foreground hover:shadow-lg hover:shadow-primary/10"
        title="View repository on GitHub (sushh-05/HackMaxx)"
      >
        <IconGithub className="size-3.5 text-foreground transition-transform duration-200 group-hover:scale-110" />
        <span className="hidden sm:inline font-mono text-[11px] font-medium tracking-tight">sushh-05/HackMaxx</span>
        <IconExternal className="hidden sm:inline size-3 opacity-50 transition-opacity group-hover:opacity-100" />
      </a>
    </aside>
  );
}
