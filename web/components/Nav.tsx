"use client";
import type React from "react";
import { usePathname } from "next/navigation";
import {
  IconDashboard,
  IconZap,
  IconTimeline,
  IconPortfolio,
  IconScale,
  IconSearch,
} from "./Icons";
import { Kbd } from "./ui/kbd";

export function Nav(): React.JSX.Element {
  const path = usePathname();

  const isDashboard = path === "/" || path === "";
  const isMaxx = path.startsWith("/maxx");
  const isTimeline = path.startsWith("/timeline");
  const isPortfolio = path.startsWith("/portfolio");
  const isCompare = path.startsWith("/compare");

  const linkClass = (active: boolean) =>
    `flex items-center gap-1.5 px-1.5 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 no-underline ${
      active
        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25 font-bold"
        : "text-muted-foreground hover:text-foreground hover:bg-muted"
    }`;

  return (
    <nav className="flex items-center gap-0.5 sm:gap-1 p-1 bg-muted/70 rounded-2xl border border-border shadow-inner" aria-label="Main navigation">
      <a href="/" className={linkClass(isDashboard)} title="Dashboard">
        <IconDashboard className="size-3.5" />
        <span className="hidden sm:inline">Dashboard</span>
      </a>

      <a href="/maxx" className={linkClass(isMaxx)} title="Maxx My Project">
        <IconZap className="size-3.5" />
        <span className="hidden lg:inline">Maxx My Project</span>
        <span className="hidden sm:inline lg:hidden">Maxx</span>
      </a>

      <a href="/timeline" className={linkClass(isTimeline)} title="Timeline">
        <IconTimeline className="size-3.5" />
        <span className="hidden md:inline">Timeline</span>
      </a>

      <a href="/portfolio" className={linkClass(isPortfolio)} title="Portfolio">
        <IconPortfolio className="size-3.5" />
        <span className="hidden md:inline">Portfolio</span>
      </a>

      <a href="/compare" className={linkClass(isCompare)} title="Compare">
        <IconScale className="size-3.5" />
        <span className="hidden lg:inline">Compare</span>
      </a>

      <button
        type="button"
        onClick={() => {
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("hackmaxx:open-palette"));
          }
        }}
        className="flex items-center gap-1 px-1.5 sm:px-2 py-1.5 text-xs sm:text-sm font-semibold rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
        aria-label="Open command palette"
        title="Command palette (⌘K)"
      >
        <IconSearch className="size-3.5" />
        <Kbd className="hidden md:inline-flex">⌘K</Kbd>
      </button>
    </nav>
  );
}
