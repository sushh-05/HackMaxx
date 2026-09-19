export function WorthBar({ worth }: { worth: number }) {
  const tier = worth >= 65 ? "high" : worth >= 45 ? "med" : "low";
  return (
    <div className="worth-row" role="meter" aria-valuenow={worth} aria-valuemin={0} aria-valuemax={100} aria-label="Worth score">
      <span className={`worth-num ${tier}`}>{worth}</span>
      <div className="worth-track">
        <div className="worth-fill" style={{ width: `${worth}%` }} />
      </div>
    </div>
  );
}
