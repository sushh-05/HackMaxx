"use client";

import { useEffect, useState } from "react";
import { checkBackendHealth } from "../lib/api";
import { IconCloud } from "./Icons";

type HealthState = "checking" | "online" | "offline";

export function BackendHealth(): React.JSX.Element {
  const [state, setState] = useState<HealthState>("checking");

  useEffect(() => {
    let active = true;

    async function refresh() {
      const online = await checkBackendHealth();
      if (active) setState(online ? "online" : "offline");
    }

    void refresh();
    const timer = window.setInterval(() => void refresh(), 30_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const online = state === "online";
  const checking = state === "checking";
  const label = checking ? "Checking API" : online ? "API online" : "API offline";
  const tone = checking ? "text-muted-foreground" : online ? "text-win" : "text-deadline";

  return (
    <span
      className={`hidden items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider sm:inline-flex ${tone}`}
      title={`${label} — health check runs every 30 seconds`}
      aria-label={label}
    >
      <span className={`size-1.5 rounded-full ${checking ? "animate-pulse bg-muted-foreground" : online ? "bg-win shadow-[0_0_7px_var(--color-win)]" : "bg-deadline"}`} />
      <IconCloud className="size-3" />
      <span>{label}</span>
    </span>
  );
}
