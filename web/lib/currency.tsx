"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

export type CurrencyCode = "USD" | "INR" | "EUR" | "GBP" | "CAD" | "SGD";

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  label: string;
  name: string;
  rateFromInr: number; // multiplier from stored INR value
  locale: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: {
    code: "USD",
    symbol: "$",
    label: "USD ($)",
    name: "US Dollar",
    rateFromInr: 1 / 85,
    locale: "en-US",
  },
  INR: {
    code: "INR",
    symbol: "₹",
    label: "INR (₹)",
    name: "Indian Rupee",
    rateFromInr: 1,
    locale: "en-IN",
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    label: "EUR (€)",
    name: "Euro",
    rateFromInr: 1 / 92,
    locale: "de-DE",
  },
  GBP: {
    code: "GBP",
    symbol: "£",
    label: "GBP (£)",
    name: "British Pound",
    rateFromInr: 1 / 108,
    locale: "en-GB",
  },
  CAD: {
    code: "CAD",
    symbol: "C$",
    label: "CAD (C$)",
    name: "Canadian Dollar",
    rateFromInr: 1 / 62,
    locale: "en-CA",
  },
  SGD: {
    code: "SGD",
    symbol: "S$",
    label: "SGD (S$)",
    name: "Singapore Dollar",
    rateFromInr: 1 / 64,
    locale: "en-SG",
  },
};

export function formatCurrencyAmount(
  amountInr: number,
  currencyCode: CurrencyCode = "USD"
): string {
  const cfg = CURRENCIES[currencyCode] ?? CURRENCIES.USD;
  const converted = Math.round(amountInr * cfg.rateFromInr);
  return `${cfg.symbol}${converted.toLocaleString(cfg.locale)}`;
}

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  format: (amountInr: number) => string;
  config: CurrencyConfig;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "USD",
  setCurrency: () => {},
  format: (amt) => formatCurrencyAmount(amt, "USD"),
  config: CURRENCIES.USD,
});

export function CurrencyProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [currency, setCurrencyState] = useState<CurrencyCode>("USD");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("hackmaxx_currency") as CurrencyCode | null;
      if (saved && CURRENCIES[saved]) {
        setCurrencyState(saved);
      }
    } catch {}
  }, []);

  function setCurrency(code: CurrencyCode) {
    if (!CURRENCIES[code]) return;
    setCurrencyState(code);
    try {
      localStorage.setItem("hackmaxx_currency", code);
    } catch {}
  }

  const config = CURRENCIES[currency] ?? CURRENCIES.USD;

  function format(amountInr: number) {
    return formatCurrencyAmount(amountInr, currency);
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, format, config }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
