"use client";
import React from "react";
import { useCurrency, CURRENCIES, type CurrencyCode } from "../lib/currency";
import { IconChevronDown } from "./Icons";

export function CurrencySelector() {
  const { currency, setCurrency, config } = useCurrency();

  return (
    <div className="relative inline-flex items-center" title={`Display currency: ${config.name}`}>
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
        className="appearance-none bg-base-200/80 hover:bg-base-300 text-base-content text-xs font-semibold pl-2.5 pr-6 py-1.5 rounded-xl border border-base-content/15 focus:outline-none focus:border-primary cursor-pointer transition-all duration-150 h-9 font-mono"
        aria-label="Select display currency"
      >
        {Object.values(CURRENCIES).map((c) => (
          <option key={c.code} value={c.code} className="bg-base-200 text-base-content font-sans">
            {c.symbol} {c.code} — {c.name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-2 flex items-center text-base-content/40">
        <IconChevronDown className="size-3" />
      </div>
    </div>
  );
}
