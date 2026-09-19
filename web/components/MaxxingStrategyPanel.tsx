export function MaxxingStrategyPanel({ strategy }: { strategy: string }) {
  return (
    <section style={{ background: "#111827", color: "white", borderRadius: 12, padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>Maxxing strategy</h2>
      <p>{strategy}</p>
    </section>
  );
}
