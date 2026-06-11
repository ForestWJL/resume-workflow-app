"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Case Study" },
  { href: "/router", label: "Screening" },
  { href: "/workflow", label: "Workflow" },
  { href: "/memory", label: "Knowledge" },
  { href: "/library", label: "Resources" },
];

// Cross-domain link back to Forest's main portfolio site. Kept as a plain
// <a> (not next/link) because this leaves the Next.js app entirely. Opens
// in the same tab so the browser back button continues to work as expected.
const PORTFOLIO_HREF = "https://forestwang-portfolio.netlify.app";

export function Nav() {
  const pathname = usePathname();
  return (
    <>
      {/* Top-left "Back to Portfolio" strip — non-sticky, visible on desktop
          and mobile. Sits above the existing sticky nav. */}
      <div className="w-full border-b border-ink-100 bg-ink-50/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-1.5">
          <a
            href={PORTFOLIO_HREF}
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ink-600 transition hover:text-ink-900"
          >
            <span aria-hidden>←</span>
            <span>Back to Portfolio</span>
          </a>
          <span className="hidden text-[11px] uppercase tracking-wide text-ink-400 sm:inline">
            Case Study · Project 03
          </span>
        </div>
      </div>

      {/* Existing sticky nav — unchanged behaviour */}
      <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold tracking-tight text-ink-900"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink-900 text-white">
              <svg
                viewBox="0 0 20 20"
                className="h-3.5 w-3.5"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M4 4h4v4H4zM4 12h4v4H4zM12 4h4v4h-4zM12 12h4v4h-4z" />
              </svg>
            </span>
            <span className="hidden sm:inline">
              AI-Assisted Opportunity Screening
            </span>
            <span className="sm:hidden">Opportunity Screening</span>
          </Link>
          <nav className="flex items-center gap-1">
            {NAV.map((item) => {
              const active =
                pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm transition",
                    active
                      ? "bg-ink-100 text-ink-900"
                      : "text-ink-500 hover:text-ink-800"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
    </>
  );
}
