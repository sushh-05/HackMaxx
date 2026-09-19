"use client";
import { usePathname } from "next/navigation";
import { IconGlobe, IconZap } from "./Icons";

export function Nav() {
  const path = usePathname();

  const isExplore = path === "/" || path === "";
  const isMaxx = path.startsWith("/maxx");

  return (
    <nav className="flex items-center gap-1 p-1 bg-base-200/80 rounded-2xl border border-base-content/10 shadow-inner" aria-label="Main navigation">
      <a
        href="/"
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 no-underline ${
          isExplore
            ? "bg-primary text-primary-content shadow-sm shadow-primary/25 font-bold"
            : "text-base-content/70 hover:text-base-content hover:bg-base-300/60"
        }`}
      >
        <IconGlobe className="w-3.5 h-3.5" />
        <span>Explore</span>
      </a>

      <a
        href="/maxx"
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 no-underline ${
          isMaxx
            ? "bg-primary text-primary-content shadow-sm shadow-primary/25 font-bold"
            : "text-base-content/70 hover:text-base-content hover:bg-base-300/60"
        }`}
      >
        <IconZap className="w-3.5 h-3.5" />
        <span>Maxx My Project</span>
      </a>
    </nav>
  );
}
