import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Nav } from "../../components/Nav";
import { ThemeToggle } from "../../components/ThemeToggle";
import { CurrencySelector } from "../../components/CurrencySelector";
import { CurrencyProvider } from "../../lib/currency";
import { StickyGithubBadge } from "../../components/StickyGithubBadge";
import { CommandPalette } from "../../components/CommandPalette";
import { UserButton } from "@clerk/nextjs";
import { IconZap } from "../../components/Icons";

export default async function AppLayout({ children }: { children: React.ReactNode }): Promise<React.JSX.Element> {
  const clerkEnabled = process.env.CLERK_ENABLED === "true" || process.env.NEXT_PUBLIC_CLERK_ENABLED === "true";

  if (clerkEnabled) {
    const { userId } = await auth();
    if (!userId) {
      redirect("/sign-in");
    }
  }

  return (
    <CurrencyProvider>
      <CommandPalette />
      {/* Sticky frosted glass header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-card/85 border-b border-border/80">
        <div className="mx-auto max-w-6xl px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <a href="/dashboard" className="font-display flex items-center gap-2 sm:gap-2.5 text-lg sm:text-xl font-extrabold tracking-tight text-foreground no-underline group shrink-0">
              <span className="logo-mark">
                <IconZap className="size-4 text-primary-foreground" />
              </span>
              <span className="flex items-baseline gap-0.5">
                <span className="font-display font-extrabold tracking-tight">Hack</span>
                <span className="font-serif italic font-normal text-xl sm:text-2xl grad-text">Maxx</span>
              </span>
            </a>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
              <span className="pulse-dot" />
              Live index
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <Nav />
            <div className="h-5 w-px bg-border hidden sm:block" />
            <CurrencySelector />
            <ThemeToggle />
            <div className="h-5 w-px bg-border hidden sm:block" />
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "size-8",
                },
              }}
            />
          </div>
        </div>
      </header>

      {/* Sticky minimal GitHub badge in bottom-left corner across all pages */}
      <StickyGithubBadge />

      {/* Main content container */}
      <div className="mx-auto max-w-6xl w-full px-3.5 sm:px-6 pb-20 flex-1">
        <main>{children}</main>
      </div>

      {/* Modern Footer */}
      <footer className="border-t border-border bg-muted/30 mt-auto py-8">
        <div className="mx-auto max-w-6xl px-3.5 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-foreground">HackMaxx</span>
            <span>·</span>
            <span>Maxx your hackathon portfolio</span>
          </div>
          <div className="font-mono text-[11px]">
            <span>hackmaxx / live index</span>
          </div>
        </div>
      </footer>
    </CurrencyProvider>
  );
}
