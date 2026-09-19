import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Nav } from "../components/Nav";

const body = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const heading = Space_Grotesk({ subsets: ["latin"], variable: "--font-heading", display: "swap" });

export const metadata: Metadata = {
  title: "HackMaxx — Maxx your hackathon ROI",
  description:
    "Paste your project idea → find the best upcoming hackathons to reuse it in, ranked by Worth Score, with a submission plan that maxxes total expected value.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="hackmaxx">
      <body className={`${body.variable} ${heading.variable} font-sans min-h-screen`}>
        <div className="mx-auto max-w-4xl px-6 pb-16">
          <header className="mb-2 flex items-center justify-between py-5">
            <a href="/" className="font-display flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-base-content no-underline">
              <span className="logo-mark">⚡</span>
              Hack<span className="text-primary">Maxx</span>
            </a>
            <Nav />
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
