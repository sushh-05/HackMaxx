"use client";

import React from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  IconZap,
  IconTimeline,
  IconScale,
  IconArrowRight,
} from "../components/Icons";

/* Terminal transcript shown in the hero mock — mirrors a real /maxx run. */
const TERMINAL_LINES: { text: string; tone: "cmd" | "dim" | "ok" | "money" }[] = [
  { text: '❯ maxx "UPI ledger for kirana stores"', tone: "cmd" },
  { text: "[engine] embedding project vector… titan-v2", tone: "dim" },
  { text: "[engine] scoring 47 open events against vector space", tone: "dim" },
  { text: "[ok] W91  AWS GenAI Hackathon      EV ₹41,200  · 6d", tone: "ok" },
  { text: "[ok] W86  Devfolio QuantumBuild     EV ₹28,500  · 11d", tone: "ok" },
  { text: "[ok] W79  Unstop CodeSprint S12     EV ₹12,900  · 18d", tone: "ok" },
  { text: "[plan] 3 submissions · total expected value ₹82,600", tone: "money" },
];

function TerminalMock(): React.JSX.Element {
  return (
    <div
      aria-hidden="true"
      className="w-full max-w-2xl mx-auto overflow-hidden rounded-2xl border border-action/25 bg-[#04060a] shadow-2xl shadow-action/10 text-left"
    >
      <div className="flex items-center gap-1.5 border-b border-white/10 px-3.5 py-2.5">
        <span className="size-2.5 rounded-full bg-deadline/70" />
        <span className="size-2.5 rounded-full bg-money/70" />
        <span className="size-2.5 rounded-full bg-win/70" />
        <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
          hackmaxx / optimization-run
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 font-mono text-[10px] text-win">
          <span className="size-1.5 rounded-full bg-win shadow-[0_0_7px_var(--color-win)]" />
          complete
        </span>
      </div>
      <div className="space-y-1.5 px-4 py-4 font-mono text-[11px] sm:text-xs leading-relaxed">
        {TERMINAL_LINES.map((l, i) => (
          <p
            key={i}
            className={
              l.tone === "cmd"
                ? "text-white/90"
                : l.tone === "dim"
                  ? "text-white/35"
                  : l.tone === "money"
                    ? "text-money font-semibold"
                    : "text-white/70"
            }
          >
            {l.text}
          </p>
        ))}
        <p className="text-action">
          ❯ <span className="inline-block w-[7px] h-[13px] translate-y-[2px] bg-action/80 animate-pulse motion-reduce:animate-none" />
        </p>
      </div>
    </div>
  );
}

function Proof({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}): React.JSX.Element {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-card/70 px-4 py-3.5 backdrop-blur-sm">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div>
        <h3 className="font-display text-sm font-bold text-foreground">{title}</h3>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}

export default function LandingPage(): React.JSX.Element {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (isLoaded && isSignedIn) router.replace("/dashboard");
  }, [isLoaded, isSignedIn, router]);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* ASCII field backdrop */}
      <AsciiField />

      {/* Nav */}
      <header className="relative z-10 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a
            href="/"
            className="font-display flex shrink-0 items-center gap-2 text-lg font-extrabold tracking-tight text-foreground no-underline sm:gap-2.5 sm:text-xl"
          >
            <span className="logo-mark">
              <IconZap className="size-4 text-primary-foreground" />
            </span>
            <span className="flex items-baseline gap-0.5">
              <span className="font-display font-extrabold tracking-tight">Hack</span>
              <span className="grad-text font-serif text-xl font-normal italic sm:text-2xl">Maxx</span>
            </span>
          </a>
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="/sign-in"
              className="rounded-xl px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign in
            </a>
            <a
              href="/sign-up"
              className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-sm shadow-primary/25 transition-opacity hover:opacity-90"
            >
              Start maxxing
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-14 text-center sm:px-6 sm:py-20">
        <div className="mx-auto w-full max-w-3xl space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
            <span className="pulse-dot motion-reduce:animate-none" />
            Built for AWS First Commit
          </div>

          <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Your hackathon portfolio,{" "}
            <span className="grad-text-gold">maxxed.</span>
          </h1>

          <p className="mx-auto max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            One project in. Ranked hackathons, an EV-maximizing submission plan, and the
            deadline calendar out.
          </p>

          <div className="flex flex-col items-center justify-center gap-3 pt-1 sm:flex-row">
            <a
              href="/sign-up"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:opacity-90 hover:shadow-xl sm:w-auto"
            >
              Start maxxing
              <IconArrowRight className="size-4" />
            </a>
            <a
              href="/sign-in"
              className="w-full rounded-2xl border border-border bg-card/60 px-8 py-3.5 text-center text-base font-semibold text-foreground backdrop-blur-sm transition-colors hover:bg-muted sm:w-auto"
            >
              Sign in
            </a>
          </div>

          <p className="text-xs text-muted-foreground">For builders who farm hackathons.</p>

          <TerminalMock />
        </div>
      </section>

      {/* Proof row */}
      <section className="relative z-10 border-t border-border/60 bg-background/70 px-4 py-10 backdrop-blur-xl sm:px-6 sm:py-12">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <Proof
            icon={<IconZap className="size-4 text-primary" />}
            title="Worth-ranked, not searched"
            body="Bedrock Titan embeddings score every open event against your stack. No keyword bingo."
          />
          <Proof
            icon={<IconTimeline className="size-4 text-data" />}
            title="Deadlines on one clock"
            body="Every event on a Gantt tape with pin-and-compare built in. No tab hoarding."
          />
          <Proof
            icon={<IconScale className="size-4 text-deadline" />}
            title="EV in rupees, not vibes"
            body="Prize × win-probability per submission. The plan picks the portfolio optimum."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 mt-auto border-t border-border bg-muted/30 py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-foreground">HackMaxx</span>
            <span>·</span>
            <span>For builders who farm hackathons</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>AWS Bedrock</span>
            <span>·</span>
            <span>Titan Embeddings</span>
            <span>·</span>
            <span>Next.js + Bun</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* Deterministic ASCII wave field, generated once at build time. */
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
    <div className="ascii-field" aria-hidden="true">
      {rows.join("\n")}
    </div>
  );
}
