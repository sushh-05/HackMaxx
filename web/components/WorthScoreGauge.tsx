export function WorthScoreGauge({ worth }: { worth: number }) {
  return <div role="meter" aria-valuenow={worth} aria-valuemin={0} aria-valuemax={100}>Worth {worth}/100</div>;
}
