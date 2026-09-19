export const metadata = { title: "HackMaxx", description: "Maxx your hackathon ROI" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui", maxWidth: 960, margin: "0 auto", padding: 24 }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ margin: 0 }}>HackMaxx</h1>
          <nav style={{ display: "flex", gap: 12 }}>
            <a href="/">Explore</a>
            <a href="/maxx">Maxx My Project</a>
          </nav>
        </header>
        <main style={{ marginTop: 24 }}>{children}</main>
      </body>
    </html>
  );
}
