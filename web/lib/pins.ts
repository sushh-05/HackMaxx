"use client";

/**
 * Pinned-watchlist persistence.
 *
 * Pins live in localStorage under `hackmaxx:pins:v1` as a string[] of
 * hackathon ids. Client-only — every window access is guarded so this is
 * safe during SSR. `usePins` starts empty and hydrates in an effect, so
 * server and first client render agree (no hydration mismatch).
 */
import { useCallback, useEffect, useState } from "react";

export const PINS_KEY = "hackmaxx:pins:v1";

export function readPins(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PINS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function writePins(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PINS_KEY, JSON.stringify(ids));
  } catch {
    /* storage full / private mode — pins just won't persist */
  }
}

export function usePins(): {
  pins: string[];
  toggle: (id: string) => void;
  unpin: (id: string) => void;
  isPinned: (id: string) => boolean;
} {
  const [pins, setPins] = useState<string[]>([]);

  useEffect(() => {
    setPins(readPins());
  }, []);

  const toggle = useCallback((id: string) => {
    setPins((prev) => {
      const next = prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id];
      writePins(next);
      return next;
    });
  }, []);

  const unpin = useCallback((id: string) => {
    setPins((prev) => {
      const next = prev.filter((p) => p !== id);
      writePins(next);
      return next;
    });
  }, []);

  const isPinned = useCallback((id: string) => pins.includes(id), [pins]);

  return { pins, toggle, unpin, isPinned };
}
