"use client";

import { useEffect, useMemo, useState } from "react";
import { connectGithub, fetchGithubRepos } from "../lib/api";
import { IconCheck, IconGithub, IconReset } from "./Icons";
import { Button } from "./ui/button";

type Repo = { id: string; name: string; full_name: string; html_url: string; description?: string };

function getUserId(): string {
  const key = "hackmaxx_composio_user_id";
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const created = `demo-${crypto.randomUUID()}`;
  localStorage.setItem(key, created);
  return created;
}

function getStoredAccountId(): string | null {
  return localStorage.getItem("hackmaxx_composio_github_account");
}

function extractRepos(payload: unknown): Repo[] {
  const root = payload as { data?: unknown; response_data?: unknown; repositories?: unknown; items?: unknown };
  const data = root?.data as { repositories?: unknown; items?: unknown; response_data?: unknown } | undefined;
  const responseData = data?.response_data as { repositories?: unknown; items?: unknown } | undefined;
  const candidates = [
    root?.repositories,
    root?.items,
    root?.response_data,
    data?.repositories,
    data?.items,
    data?.response_data,
    responseData?.repositories,
    responseData?.items,
  ];
  const list = candidates.find(Array.isArray) as unknown[] | undefined;
  return (list ?? []).flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const value = item as Partial<Repo>;
    const fullName = value.full_name ?? value.name;
    if (!value.name || !fullName || !value.html_url) return [];
    return [{ id: value.id ?? value.html_url, name: value.name, full_name: fullName, html_url: value.html_url, description: value.description }];
  });
}

export function GithubRepoConnector({ onSelect }: { onSelect: (url: string) => void }): React.JSX.Element {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const connected = useMemo(() => Boolean(accountId), [accountId]);

  useEffect(() => {
    const stored = getStoredAccountId();
    if (stored) setAccountId(stored);
    if (new URLSearchParams(window.location.search).get("github") === "connected" && stored) {
      void loadRepos(stored);
    }
  }, []);

  async function startConnection() {
    setBusy(true);
    setMessage("");
    try {
      const result = await connectGithub(getUserId());
      localStorage.setItem("hackmaxx_composio_github_account", result.connected_account_id);
      window.location.assign(result.redirect_url);
    } catch {
      setMessage("Could not start GitHub connection. Check the Composio backend configuration.");
      setBusy(false);
    }
  }

  async function loadRepos(existingAccountId = accountId) {
    if (!existingAccountId) return;
    setBusy(true);
    setMessage("");
    try {
      const result = await fetchGithubRepos(getUserId(), existingAccountId);
      const nextRepos = extractRepos(result);
      setRepos(nextRepos);
      if (nextRepos.length === 0) setMessage("No repositories were returned. Complete GitHub consent, then try again.");
    } catch {
      setMessage("GitHub is not connected yet. Complete the consent screen, then load repositories again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3 rounded-2xl border border-action/20 bg-action/5 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2.5">
          <IconGithub className="mt-0.5 size-4 text-action" />
          <div>
            <p className="text-xs font-bold text-base-content">Use a GitHub project as your input</p>
            <p className="text-[11px] text-muted-foreground">Composio keeps the OAuth token server-side.</p>
          </div>
        </div>
        {!connected ? (
          <Button type="button" size="sm" onClick={startConnection} disabled={busy} className="gap-1.5 rounded-xl text-xs">
            <IconGithub className="size-3.5" /> Connect GitHub
          </Button>
        ) : (
          <Button type="button" variant="outline" size="sm" onClick={() => void loadRepos()} disabled={busy} className="gap-1.5 rounded-xl text-xs">
            <IconReset className="size-3.5" /> {busy ? "Loading…" : "Load repositories"}
          </Button>
        )}
      </div>

      {repos.length > 0 && (
        <label className="block space-y-1.5 text-[11px] font-semibold text-muted-foreground">
          Select a repository
          <select
            className="w-full rounded-xl border border-border bg-base-100 px-3 py-2 text-xs font-medium text-base-content outline-none focus:border-action focus:ring-2 focus:ring-action/20"
            defaultValue=""
            onChange={(event) => onSelect(event.target.value)}
          >
            <option value="" disabled>Choose a repository…</option>
            {repos.map((repo) => (
              <option key={repo.id} value={repo.html_url}>{repo.full_name}</option>
            ))}
          </select>
        </label>
      )}

      {connected && repos.length > 0 && (
        <p className="flex items-center gap-1.5 text-[11px] text-win"><IconCheck className="size-3.5" /> GitHub connected · {repos.length} repositories available</p>
      )}
      {message && <p className="text-[11px] text-deadline">{message}</p>}
    </div>
  );
}
