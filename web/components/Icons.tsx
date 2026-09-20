// Icon layer: real lucide-react icons behind stable app-local names.
//
// Every icon here — including the local GitHub mark — renders with the `lucide`
// class, so stroke weight and sizing are set once in globals.css instead of at
// each call site. Consumers keep writing <IconZap className="size-4" />.
//
// Naming convention: Icon<Something> is a *role* in this app, not a glyph. If a
// glyph should change later, swap the assignment here and every call site follows.
import type React from "react";
import type { LucideIcon, LucideProps } from "lucide-react";
import {
  Zap,
  Trophy,
  Calendar,
  CalendarClock,
  Globe,
  MapPin,
  Search,
  Sparkles,
  Sparkle,
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
  Copy,
  Check,
  TrendingUp,
  CircleCheck,
  CircleAlert,
  TriangleAlert,
  Info,
  Sun,
  Moon,
  Layers,
  Tag,
  CodeXml,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  X,
  SlidersVertical,
  RotateCcw,
  Flame,
  Gauge,
  Target,
  CircleDollarSign,
  Recycle,
  GitBranch,
  Hourglass,
  Award,
  Rocket,
  Lightbulb,
  Quote,
  Cpu,
  Database,
  Cloud,
  Terminal,
  Boxes,
  LayoutDashboard,
} from "lucide-react";

// Bun's isolated linker can expose two identical @types/react paths. Cast at
// this single boundary so consumers never compare Lucide's ReactNode with the
// app's ReactNode during Next.js production type checking.
export type AppIcon = React.ComponentType<LucideProps>;

function appIcon(icon: LucideIcon): AppIcon {
  return icon as unknown as AppIcon;
}

// --- core / brand ---
export const IconZap = appIcon(Zap);
export const IconDashboard = appIcon(LayoutDashboard);
export const IconTrophy = appIcon(Trophy);
export const IconAward = appIcon(Award);
export const IconRocket = appIcon(Rocket);

// --- time & deadlines ---
export const IconCalendar = appIcon(Calendar);
export const IconDeadline = appIcon(CalendarClock);
export const IconHourglass = appIcon(Hourglass);
export const IconFlame = appIcon(Flame);

// --- place / mode ---
export const IconGlobe = appIcon(Globe);
export const IconMapPin = appIcon(MapPin);
export const IconHybrid = appIcon(Sparkle);

// --- money & value ---
export const IconMoney = appIcon(CircleDollarSign);
export const IconTrendingUp = appIcon(TrendingUp);
export const IconWorth = appIcon(Gauge);
export const IconTarget = appIcon(Target);

// --- reuse & stack ---
export const IconReuse = appIcon(Recycle);
export const IconBranch = appIcon(GitBranch);
export const IconLayers = appIcon(Layers);
export const IconTag = appIcon(Tag);
export const IconCode = appIcon(CodeXml);
export const IconBoxes = appIcon(Boxes);

// --- ai / infra ---
export const IconSparkles = appIcon(Sparkles);
export const IconLightbulb = appIcon(Lightbulb);
export const IconChip = appIcon(Cpu);
export const IconDatabase = appIcon(Database);
export const IconCloud = appIcon(Cloud);
export const IconTerminal = appIcon(Terminal);

// --- interaction ---
export const IconSearch = appIcon(Search);
export const IconFilters = appIcon(SlidersVertical);
export const IconSliders = IconFilters;
export const IconReset = appIcon(RotateCcw);
export const IconCopy = appIcon(Copy);
export const IconCheck = appIcon(Check);
export const IconX = appIcon(X);
export const IconChevronDown = appIcon(ChevronDown);
export const IconChevronUp = appIcon(ChevronUp);
export const IconChevronRight = appIcon(ChevronRight);
export const IconArrowRight = appIcon(ArrowRight);
export const IconExternal = appIcon(ArrowUpRight);
export const IconExternalLink = appIcon(ExternalLink);
export const IconQuote = appIcon(Quote);

// --- status ---
export const IconCheckCircle = appIcon(CircleCheck);
export const IconAlertCircle = appIcon(CircleAlert);
export const IconWarning = appIcon(TriangleAlert);
export const IconInfo = appIcon(Info);

// --- theme toggle ---
export const IconSun = appIcon(Sun);
export const IconMoon = appIcon(Moon);

/**
 * GitHub mark. lucide dropped brand icons, so this stays a local SVG — but it
 * mirrors lucide's prop API (`size`, `className`, spread SVG attrs, forwardRef)
 * and carries the `lucide` class, so it is interchangeable at any call site.
 * It is fill-based, so `strokeWidth` is intentionally not applied.
 */
export function IconGithub({
  className,
  size = 24,
  strokeWidth: _strokeWidth,
  absoluteStrokeWidth: _absoluteStrokeWidth,
  nonScalingStroke: _nonScalingStroke,
  ...props
}: LucideProps): React.JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
      role="img"
      aria-hidden="true"
      className={["lucide", "lucide-github", className].filter(Boolean).join(" ")}
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}
