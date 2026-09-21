"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { CopilotKit, useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";

const CopilotPopup = dynamic(
  () => import("@copilotkit/react-ui").then((mod) => mod.CopilotPopup),
  { ssr: false }
);
import {
  getUserPreferences,
  saveUserPreferences,
  PREFERENCES_UPDATED_EVENT,
  type UserPreferences,
} from "../lib/preferences";

function CopilotAgentContext(): React.JSX.Element | null {
  const pathname = usePathname();
  const router = useRouter();
  const [prefs, setPrefs] = useState<UserPreferences>(getUserPreferences());

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const custom = e as CustomEvent<UserPreferences>;
      if (custom.detail) {
        setPrefs(custom.detail);
      } else {
        setPrefs(getUserPreferences());
      }
    };

    window.addEventListener(PREFERENCES_UPDATED_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(PREFERENCES_UPDATED_EVENT, handleUpdate);
    };
  }, []);

  // 1. Give the Copilot continuous context of the user's persona & preferences
  useCopilotReadable({
    description: "The user's developer profile, skills, and hackathon targeting preferences",
    value: {
      developer: {
        name: prefs.name,
        handle: prefs.handle,
        role: prefs.role,
        experienceLevel: prefs.experienceLevel,
        bio: prefs.bio,
      },
      skills: prefs.skills,
      interests: prefs.interests,
      preferences: {
        preferredFormats: prefs.preferredFormats,
        targetGoals: prefs.targetGoals,
        preferredPlatforms: prefs.preferredPlatforms,
        minPrizeUsd: prefs.minPrizeUsd,
        maxDeadlineDays: prefs.maxDeadlineDays,
      },
      activeProject: {
        title: prefs.activeIdeaTitle,
        description: prefs.activeIdeaDescription,
        stack: prefs.activeIdeaStack,
      },
      currentPage: pathname,
    },
  });

  // 2. Action: Filter Dashboard Hackathons
  useCopilotAction({
    name: "filterDashboard",
    description: "Filter hackathons on the dashboard by keyword query, platform, or format (online, offline, hybrid)",
    parameters: [
      {
        name: "query",
        type: "string",
        description: "Search keyword (e.g., 'ai', 'solana', 'aws', 'agents')",
        required: false,
      },
      {
        name: "format",
        type: "string",
        description: "Hackathon format: 'online', 'offline', or 'hybrid'",
        required: false,
      },
      {
        name: "platform",
        type: "string",
        description: "Platform filter (e.g. 'devpost', 'devfolio', 'unstop')",
        required: false,
      },
    ],
    handler: async ({ query, format, platform }) => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("hackmaxx:copilot-filter", {
            detail: { query: query || "", format: format || "", platform: platform || "" },
          })
        );
      }
      if (!pathname.startsWith("/dashboard")) {
        router.push("/dashboard");
      }
      return `Filtered dashboard hackathons with query="${query || 'all'}", format="${format || 'any'}", platform="${platform || 'any'}".`;
    },
  });

  // 3. Action: Stage Hackathon for Comparison
  useCopilotAction({
    name: "stageForCompare",
    description: "Add a hackathon ID or title to the head-to-head comparison staging list",
    parameters: [
      {
        name: "hackathonId",
        type: "string",
        description: "The unique ID or title slug of the hackathon to compare",
        required: true,
      },
    ],
    handler: async ({ hackathonId }) => {
      if (typeof window !== "undefined") {
        try {
          const raw = window.localStorage.getItem("hackmaxx:compare:ids");
          const ids: string[] = raw ? JSON.parse(raw) : [];
          if (!ids.includes(hackathonId)) {
            ids.push(hackathonId);
            window.localStorage.setItem("hackmaxx:compare:ids", JSON.stringify(ids));
            window.dispatchEvent(new CustomEvent("hackmaxx:compare-updated", { detail: ids }));
          }
        } catch {
          // ignore
        }
      }
      return `Hackathon "${hackathonId}" added to comparison staging. Navigate to /compare to view head-to-head details.`;
    },
  });

  // 4. Action: Quick Maxx Project
  useCopilotAction({
    name: "launchMaxx",
    description: "Navigate to /maxx and pre-fill project idea details for expected-value submission planning",
    parameters: [
      {
        name: "title",
        type: "string",
        description: "Project idea title",
        required: true,
      },
      {
        name: "description",
        type: "string",
        description: "Description of the project",
        required: true,
      },
      {
        name: "stack",
        type: "string",
        description: "Comma-separated tech stack (e.g., 'Next.js, Python, Anthropic, Tailwind')",
        required: false,
      },
    ],
    handler: async ({ title, description, stack }) => {
      const sp = new URLSearchParams({
        title,
        description,
        stack: stack || prefs.skills.slice(0, 4).join(", "),
      });
      router.push(`/maxx?${sp.toString()}`);
      return `Navigating to /maxx with project "${title}" to generate your maxxing submission plan.`;
    },
  });

  // 5. Action: Update Developer Preferences
  useCopilotAction({
    name: "updateDeveloperPreferences",
    description: "Update the user's developer profile, skills, role, or hackathon preferences",
    parameters: [
      {
        name: "role",
        type: "string",
        description: "New developer role (e.g. 'Solo Fullstack Builder', 'AI Agent Specialist')",
        required: false,
      },
      {
        name: "skills",
        type: "string[]",
        description: "Array of tech skills and stacks",
        required: false,
      },
      {
        name: "preferredFormats",
        type: "string[]",
        description: "Array of formats: 'online', 'offline', 'hybrid'",
        required: false,
      },
      {
        name: "minPrizeUsd",
        type: "number",
        description: "Minimum prize pool threshold in USD",
        required: false,
      },
    ],
    handler: async ({ role, skills, preferredFormats, minPrizeUsd }) => {
      const updates: Partial<UserPreferences> = {};
      if (role) updates.role = role;
      if (Array.isArray(skills) && skills.length > 0) updates.skills = skills;
      if (Array.isArray(preferredFormats) && preferredFormats.length > 0) {
        updates.preferredFormats = preferredFormats as UserPreferences["preferredFormats"];
      }
      if (typeof minPrizeUsd === "number") updates.minPrizeUsd = minPrizeUsd;

      const next = saveUserPreferences(updates);
      setPrefs(next);
      return `Preferences updated: role="${next.role}", ${next.skills.length} skills tracked, min prize=$${next.minPrizeUsd}.`;
    },
  });

  // 6. Action: Navigate to Page
  useCopilotAction({
    name: "navigateTo",
    description: "Navigate to a specific page inside HackMaxx",
    parameters: [
      {
        name: "page",
        type: "string",
        description: "Destination page: 'dashboard', 'maxx', 'timeline', 'portfolio', 'compare', or 'settings'",
        required: true,
      },
    ],
    handler: async ({ page }) => {
      const target = page.startsWith("/") ? page : `/${page}`;
      router.push(target);
      return `Navigated to ${target}.`;
    },
  });

  return (
    <>
      <CopilotPopup
        instructions={`You are the HackMaxx Copilot — an expert AI hackathon portfolio strategist and quantitative ROI optimizer for software builders and hackathon competitors ("farming hackathons").
Your job is to help the user discover high-EV hackathons, evaluate project reuse, compare upcoming hackathons, tailor their submission plans, and optimize their developer settings & tech stack preferences.
You have continuous access to the user's developer profile (name, handle, role, experience level, skills, active idea, target formats, goals).
Always speak directly, concisely, and with industrial/quant discipline.
When recommending hackathons, emphasize Worth Score, Expected Value (EV), tech stack alignment, and days remaining.
You can execute actions on behalf of the user: filter hackathons on the dashboard, stage hackathons for comparison, launch a maxxing plan, update preferences, or navigate between pages.`}
        labels={{
          title: "HackMaxx Copilot",
          initial: `Hey ${prefs.name ? prefs.name.split(" ")[0] : "builder"}! I'm your HackMaxx Copilot.

I have live context of your **${prefs.skills.slice(0, 3).join(", ")}** stack, your role (*${prefs.role}*), and active project (*${prefs.activeIdeaTitle}*).

**Quick Actions:**
• 🎯 "Recommend the highest-EV hackathons for my stack"
• ⚡ "Maxx my active idea for maximum prize returns"
• 🔍 "Filter online hackathons with prizes > $10,000"
• ⚙️ "Tune my developer profile and constraints"`,
          placeholder: "Ask Copilot about high-EV hackathons, stack fit, or maxxing (/)...",
        }}
        clickOutsideToClose={true}
        hitEscapeToClose={true}
        shortcut="/"
        className="hackmaxx-copilot-popup"
      />

      {/* Floating launcher badge / shortcut hint */}
      <aside
        aria-label="HackMaxx Copilot Assistant"
        onClick={() => {
          const btn = document.querySelector<HTMLButtonElement>(".copilotKitButton");
          btn?.click();
        }}
        className="fixed bottom-4 right-18 z-30 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/90 border border-primary/25 shadow-lg backdrop-blur-md cursor-pointer group hover:border-primary/60 hover:shadow-primary/10 transition-all select-none"
      >
        <span className="size-2 rounded-full bg-win pulse-dot" />
        <span className="text-[11px] font-mono text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-1.5">
          <span>Copilot Agent</span>
          <span className="text-primary font-bold">/</span>
        </span>
      </aside>
    </>
  );
}

export function HackMaxxCopilot(): React.JSX.Element | null {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <CopilotAgentContext />
    </CopilotKit>
  );
}
