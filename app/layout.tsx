import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "Resume Workflow",
  description:
    "A calm, focused assistant for routing job descriptions and running a structured resume tailoring workflow.",
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
          Resume Workflow · V1 · local assistant · no external calls yet
        </footer>
      </body>
    </html>
  );
}
