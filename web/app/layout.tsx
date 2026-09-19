import "./globals.css";
import { Nav } from "../components/Nav";

export const metadata = {
  title: "HackMaxx — Maxx your hackathon ROI",
  description:
    "Paste your project idea → find the best upcoming hackathons to reuse it in, ranked by Worth Score, with a submission plan that maxxes total expected value.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="wrap">
          <header className="site-header">
            <a className="logo" href="/">
              <span className="logo-mark">⚡</span>
              Hack<em>Maxx</em>
            </a>
            <Nav />
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
