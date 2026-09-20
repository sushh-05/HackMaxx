import React from "react";
import { IconZap } from "../../components/Icons";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="min-h-screen flex flex-col justify-between items-center py-10 px-4">
      <header className="w-full max-w-md flex items-center justify-between mb-8">
        <a
          href="/"
          className="font-display flex items-center gap-2 text-xl font-extrabold tracking-tight text-foreground no-underline group"
        >
          <span className="logo-mark">
            <IconZap className="size-4 text-primary-foreground" />
          </span>
          <span className="flex items-baseline gap-0.5">
            <span className="font-display font-extrabold tracking-tight">Hack</span>
            <span className="font-serif italic font-normal text-2xl grad-text">Maxx</span>
          </span>
        </a>
        <a
          href="/"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors font-semibold"
        >
          &larr; Back to home
        </a>
      </header>

      <main className="w-full flex justify-center items-center flex-1">
        {children}
      </main>

      <footer className="mt-8 text-center text-xs text-muted-foreground">
        <span>Protected with Clerk Authentication</span>
      </footer>
    </div>
  );
}
