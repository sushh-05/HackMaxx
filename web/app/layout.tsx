import type { Metadata } from "next";
import { Outfit, Instrument_Serif, Fira_Code, Merriweather } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const bodyFont = Outfit({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const serifFont = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const monoFont = Fira_Code({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

// Amber Slate theme ships Merriweather as its display serif face.
const displayFont = Merriweather({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: "--font-display-face",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HackMaxx — Hackathon Portfolio Dashboard & ROI Planner",
  description:
    "Real-time hackathon portfolio dashboard. Paste your project idea or repo → find the best upcoming hackathons to reuse it in, ranked by AI Worth Score, with an expected-value maxxing submission plan.",
};

export default function RootLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <ClerkProvider>
      <html lang="en" className="dark" suppressHydrationWarning>
        <body className={`${bodyFont.variable} ${serifFont.variable} ${monoFont.variable} ${displayFont.variable} font-sans min-h-screen flex flex-col`}>
          <script
            dangerouslySetInnerHTML={{
              __html:
                'try{var t=localStorage.getItem("hackmaxx-theme");document.documentElement.classList.toggle("dark",t!=="light"&&t!=="hackmaxx-light")}catch(e){}',
            }}
          />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
