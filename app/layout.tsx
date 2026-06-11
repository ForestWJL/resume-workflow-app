import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "AI-Assisted Opportunity Screening",
  description:
    "Applying supply chain prioritisation and workflow routing principles to high-volume job opportunities. A workflow automation and decision-support case study.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-full font-sans text-ink-900 antialiased">
        <Nav />
        <main className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
          {children}
        </main>
        <footer className="mx-auto max-w-6xl px-6 pb-12 pt-6 text-xs text-ink-400">
          AI-Assisted Opportunity Screening · runs entirely on your device ·
          no external calls
        </footer>
      </body>
    </html>
  );
}
