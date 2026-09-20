import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serifFont = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HackMaxx — Hackathon Portfolio Dashboard & ROI Planner",
  description:
    "Real-time hackathon portfolio dashboard. Paste your project idea or repo → find the best upcoming hackathons to reuse it in, ranked by AI Worth Score, with an expected-value maxxing submission plan.",
};

export default function RootLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${serifFont.variable} ${geistMono.variable} font-sans min-h-screen flex flex-col`}>
        <ClerkProvider>
          <script
            dangerouslySetInnerHTML={{
              __html:
                'try{var t=localStorage.getItem("hackmaxx-theme");document.documentElement.classList.toggle("dark",t!=="light"&&t!=="hackmaxx-light")}catch(e){}',
            }}
          />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
