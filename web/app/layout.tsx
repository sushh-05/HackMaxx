import type { Metadata } from "next";
import { Inter_Tight, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "../components/Nav";
import { ThemeToggle } from "../components/ThemeToggle";
import { IconGithub, IconZap } from "../components/Icons";

const bodyFont = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const serifFont = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HackMaxx — Maxx your hackathon portfolio ROI",
  description:
    "Paste your project idea or repo → find the best upcoming hackathons to reuse it in, ranked by AI Worth Score, with an expected-value maxxing submission plan.",
};

export default function RootLayout({ children }: { children: React.ReactNode }): React.ReactNode {
  return (
    <html lang="en" data-theme="hackmaxx" suppressHydrationWarning>
      <body className={`${bodyFont.variable} ${serifFont.variable} ${monoFont.variable} font-sans min-h-screen flex flex-col`}>
        {/* Sticky frosted glass header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-base-100/80 border-b border-base-content/8">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <a href="/" className="font-display flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-base-content no-underline group">
                <span className="logo-mark">
                  <IconZap className="w-4 h-4 text-white" />
                </span>
                <span className="flex items-baseline gap-0.5">
                  <span className="font-display font-extrabold tracking-tight">Hack</span>
                  <span className="font-serif italic font-normal text-2xl grad-text">Maxx</span>
                </span>
              </a>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                <span className="pulse-dot" />
                AWS First Commit
              </span>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3">
              <Nav />
              <div className="h-5 w-px bg-base-content/15 hidden sm:block" />
              <ThemeToggle />
              <a
                href="https://github.com/sushh-05/HackMaxx"
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost btn-sm h-9 w-9 p-0 rounded-xl border border-base-content/15 hover:border-primary/40 text-base-content/70 hover:text-base-content transition-colors"
                aria-label="GitHub Repository"
                title="View on GitHub"
              >
                <IconGithub className="w-4 h-4" />
              </a>
            </div>
          </div>
        </header>

        {/* Main content container */}
        <div className="mx-auto max-w-6xl w-full px-4 sm:px-6 pb-20 flex-1">
          <main>{children}</main>
        </div>

        {/* Modern Footer */}
        <footer className="border-t border-base-content/8 bg-base-200/40 mt-auto py-8">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-base-content/60">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-base-content/90">HackMaxx</span>
              <span>·</span>
              <span>Maxx your hackathon portfolio with AWS Bedrock AI</span>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Titan Embeddings
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                DynamoDB Vector
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                Lambda & Bun
              </span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
