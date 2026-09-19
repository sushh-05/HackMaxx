export function WorthBar({ worth }: { worth: number }) {
  const tier = worth >= 65 ? "text-success" : worth >= 45 ? "text-warning" : "text-base-content/50";
  return (
    <div className="flex items-center gap-2.5" role="meter" aria-valuenow={worth} aria-valuemin={0} aria-valuemax={100} aria-label="Worth score">
      <span className={`min-w-9 text-lg font-extrabold ${tier}`}>{worth}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-base-content/10">
        <div className="worth-fill h-full rounded-full" style={{ width: `${worth}%` }} />
      </div>
    </div>
  );
}
