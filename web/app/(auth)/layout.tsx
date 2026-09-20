import React from "react";
import { IconZap } from "../../components/Icons";

/* Deterministic ASCII wave field — same pattern as the landing hero,
 * subtler opacity keeps the Clerk card the focal point. */
function AsciiField(): React.JSX.Element {
  const GLYPHS = "$W%#*+=-:~^.";
  const W = 96;
  const H = 30;
  const rows: string[] = [];
  for (let y = 0; y < H; y++) {
    let row = "";
    for (let x = 0; x < W; x++) {
      const v =
        Math.sin(x * 0.11 + y * 0.35) * 0.5 +
        Math.sin(x * 0.05 - y * 0.21) * 0.35 +
        Math.cos((x + y) * 0.08) * 0.25;
      const i = Math.floor(((v + 1.1) / 2.2) * (GLYPHS.length - 1));
      row += GLYPHS[Math.max(0, Math.min(GLYPHS.length - 1, i))];
    }
    rows.push(row);
  }
  return (
    <div className="ascii-field opacity-[0.08]" aria-hidden="true">
      {rows.join("\n")}
    </div>
  );
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden px-4 py-10">
      <AsciiField />

      <header className="relative z-10 mb-8 flex w-full max-w-md items-center justify-between">
        <a
          href="/"
          className="font-display group flex items-center gap-2 text-xl font-extrabold tracking-tight text-foreground no-underline"
        >
          <span className="logo-mark">
            <IconZap className="size-4 text-primary-foreground" />
          </span>
          <span className="flex items-baseline gap-0.5">
            <span className="font-display font-extrabold tracking-tight">Hack</span>
            <span className="grad-text font-serif text-2xl font-normal italic">Maxx</span>
          </span>
        </a>
        <a
          href="/"
          className="text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          &larr; Back to home
        </a>
      </header>

      <main className="relative z-10 flex w-full flex-1 items-center justify-center">
        {children}
      </main>

      <footer className="relative z-10 mt-8 text-center font-mono text-[11px] text-muted-foreground">
        <span>hackmaxx / auth — protected with Clerk</span>
      </footer>
    </div>
  );
}
