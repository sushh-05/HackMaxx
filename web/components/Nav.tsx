"use client";
import type React from "react";
import { usePathname } from "next/navigation";
import { IconDashboard, IconZap } from "./Icons";

export function Nav(): React.JSX.Element {
  const path = usePathname();

  const isDashboard = path === "/" || path === "";
  const isMaxx = path.startsWith("/maxx");

  return (
    <nav className="flex items-center gap-1 p-1 bg-base-200/80 rounded-2xl border border-base-content/10 shadow-inner" aria-label="Main navigation">
      <a
        href="/"
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 no-underline ${
          isDashboard
            ? "bg-primary text-primary-content shadow-sm shadow-primary/25 font-bold"
            : "text-base-content/70 hover:text-base-content hover:bg-base-300/60"
        }`}
      >
        <IconDashboard className="size-3.5" />
        <span>Dashboard</span>
      </a>

      <a
        href="/maxx"
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 no-underline ${
          isMaxx
            ? "bg-primary text-primary-content shadow-sm shadow-primary/25 font-bold"
            : "text-base-content/70 hover:text-base-content hover:bg-base-300/60"
        }`}
      >
        <IconZap className="size-3.5" />
        <span>Maxx My Project</span>
      </a>
    </nav>
  );
}
