"use client";
import { usePathname } from "next/navigation";

export function Nav() {
  const path = usePathname();
  return (
    <nav className="site-nav">
      <a href="/" className={path === "/" ? "active" : ""}>Explore</a>
      <a href="/maxx" className={path === "/maxx" ? "active" : ""}>Maxx My Project</a>
    </nav>
  );
}
