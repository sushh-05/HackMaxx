"use client";
import { usePathname } from "next/navigation";

export function Nav() {
  const path = usePathname();
  return (
    <nav className="flex gap-1">
      <a href="/" className={`btn btn-sm rounded-full no-underline ${path === "/" ? "btn-primary" : "btn-ghost"}`}>
        Explore
      </a>
      <a href="/maxx" className={`btn btn-sm rounded-full no-underline ${path === "/maxx" ? "btn-primary" : "btn-ghost"}`}>
        Maxx My Project
      </a>
    </nav>
  );
}
