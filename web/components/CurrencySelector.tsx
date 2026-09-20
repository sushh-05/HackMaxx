"use client";
import { useCurrency, CURRENCIES, type CurrencyCode } from "../lib/currency";
import { Select, SelectContent, SelectItem, SelectTrigger } from "./ui/select";

export function CurrencySelector(): React.JSX.Element {
  const { currency, setCurrency, config } = useCurrency();

  return (
    <Select value={currency} onValueChange={(v) => setCurrency(v as CurrencyCode)}>
      {/* Custom trigger label: compact mono code in the header, full name only in
          the popup. SelectTrigger renders its own chevron. */}
      <SelectTrigger
        size="sm"
        className="h-9 w-auto gap-1 rounded-lg border-border bg-card/80 px-2 shadow-none"
        aria-label="Select display currency"
        title={`Display currency: ${config.name}`}
      >
        <span className="font-mono text-xs font-semibold tabular-nums">
          {config.symbol}
          <span className="hidden sm:inline"> {config.code}</span>
        </span>
      </SelectTrigger>
      <SelectContent position="popper" align="start" side="bottom" sideOffset={6} className="min-w-[190px]">
        {Object.values(CURRENCIES).map((c) => (
          <SelectItem key={c.code} value={c.code} className="text-xs">
            <span className="flex items-baseline gap-1.5">
              <span className="font-mono font-semibold">
                {c.symbol} {c.code}
              </span>
              <span className="text-muted-foreground">{c.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
