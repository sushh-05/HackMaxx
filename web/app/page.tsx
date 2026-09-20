"use client";

import React from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  IconZap,
  IconDashboard,
  IconTimeline,
  IconPortfolio,
  IconScale,
  IconTrophy,
  IconSparkles,
  IconCalendar,
  IconTarget,
} from "../components/Icons";

export default function LandingPage(): React.JSX.Element {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  // Redirect signed-in users straight to dashboard
  React.useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Nav bar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-card/85 border-b border-border/80">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="/" className="font-display flex items-center gap-2 sm:gap-2.5 text-lg sm:text-xl font-extrabold tracking-tight text-foreground no-underline shrink-0">
            <span className="logo-mark">
              <IconZap className="size-4 text-primary-foreground" />
            </span>
            <span className="flex items-baseline gap-0.5">
              <span className="font-display font-extrabold tracking-tight">Hack</span>
              <span className="font-serif italic font-normal text-xl sm:text-2xl grad-text">Maxx</span>
            </span>
          </a>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="/sign-in"
              className="px-4 py-2 text-sm font-semibold text-foreground hover:text-primary transition-colors rounded-xl"
            >
              Sign in
            </a>
            <a
              href="/sign-up"
              className="px-4 py-2 text-sm font-bold rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/25 hover:opacity-90 transition-opacity"
            >
              Get Started
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <span className="pulse-dot" />
            Built for AWS First Commit
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
            Your hackathon portfolio,{" "}
            <span className="grad-text-gold">maxxed.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Paste your project idea → get{" "}
            <span className="text-foreground font-semibold">AI-ranked hackathons</span>{" "}
            by Worth Score, an{" "}
            <span className="text-money font-semibold font-mono">EV-maximizing</span>{" "}
            submission plan, and a timeline to farm them all.
          </p>

          {/* Worth Score demo glyph */}
          <div className="flex items-center justify-center gap-3">
            <span className="font-mono text-5xl sm:text-6xl font-extrabold text-money tabular-nums tracking-tighter">
              W92
            </span>
            <div className="text-left text-sm text-muted-foreground">
              <div className="font-semibold text-foreground">Worth Score</div>
              <div>AI-computed reuse fit × prize × deadline</div>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <a
              href="/sign-up"
              className="w-full sm:w-auto px-8 py-3.5 text-base font-bold rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-90 hover:shadow-xl transition-all text-center"
            >
              Start Maxxing — Free
            </a>
            <a
              href="/sign-in"
              className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold rounded-2xl border border-border text-foreground hover:bg-muted transition-colors text-center"
            >
              Sign In
            </a>
          </div>

          <p className="text-xs text-muted-foreground">
            For builders who farm hackathons.
          </p>
        </div>
      </section>

      {/* Features grid */}
      <section className="border-t border-border bg-muted/20 py-16 sm:py-20 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground text-center mb-12">
            One project. Every hackathon.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <FeatureCard
              icon={<IconSparkles className="size-5 text-money" />}
              title="Worth Score"
              description="AI ranks every hackathon by how well your project fits — prize pool, deadline, category match, reuse potential."
            />
            <FeatureCard
              icon={<IconZap className="size-5 text-primary" />}
              title="Maxx Strategy"
              description="Paste your idea or repo link and get a submission plan: what to tweak, which APIs to add, how to position."
            />
            <FeatureCard
              icon={<IconTimeline className="size-5 text-data" />}
              title="Timeline View"
              description="Gantt-style timeline of all upcoming hackathons. See overlaps, plan your sprint calendar, never miss a deadline."
            />
            <FeatureCard
              icon={<IconPortfolio className="size-5 text-win" />}
              title="Portfolio Tracker"
              description="Track submissions across hackathons. See total prize pool exposure, win rate, and your best-performing projects."
            />
            <FeatureCard
              icon={<IconScale className="size-5 text-deadline" />}
              title="Compare Side-by-Side"
              description="Pin up to 3 hackathons and compare prize pools, deadlines, platforms, and Worth Scores in one view."
            />
            <FeatureCard
              icon={<IconTarget className="size-5 text-primary" />}
              title="AWS Bedrock AI"
              description="Powered by Amazon Titan embeddings and Bedrock for semantic matching — not keyword search, real understanding."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center space-y-12">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Three steps to maxx
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <Step num={1} title="Paste your idea" description="Drop your project description, GitHub repo, or devpost link." />
            <Step num={2} title="Get ranked matches" description="AI scores every upcoming hackathon for reuse fit and expected value." />
            <Step num={3} title="Submit & track" description="Follow the maxxing plan, submit, track your portfolio across events." />
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-border bg-muted/20 py-16 px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center space-y-6">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Stop browsing hackathons manually.
          </h2>
          <p className="text-muted-foreground">
            Let the algorithm find where your project wins.
          </p>
          <a
            href="/sign-up"
            className="inline-block px-8 py-3.5 text-base font-bold rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-90 transition-opacity"
          >
            Get Started — Free
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 mt-auto py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
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

/* ---------- Sub-components ---------- */

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}): React.JSX.Element {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-3 card-glass">
      <div className="flex items-center gap-2.5">
        {icon}
        <h3 className="font-display text-base font-bold text-foreground">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function Step({
  num,
  title,
  description,
}: {
  num: number;
  title: string;
  description: string;
}): React.JSX.Element {
  return (
    <div className="space-y-3">
      <div className="step-num mx-auto">{num}</div>
      <h3 className="font-display text-base font-bold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
