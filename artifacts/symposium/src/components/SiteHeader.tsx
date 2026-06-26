import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CountdownBadge } from "@/components/ui/CountdownBadge";
import { useGetSettings } from "@workspace/api-client-react";
import logoImg from "@assets/[WEBSITE LOGO] SEAT-MSPTM.png";

function AboutDropdown({ firstAnnouncementUrl }: { firstAnnouncementUrl?: string }) {
  return (
    <div className="relative group">
      <button
        type="button"
        className="hover:text-accent transition-colors text-[var(--navy)] font-semibold text-sm flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
      >
        About
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="mt-0.5 transition-transform group-hover:rotate-180">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className="absolute left-0 top-full pt-2 hidden group-hover:block z-50" style={{ minWidth: 228 }}>
        <div
          className="rounded-xl overflow-hidden border"
          style={{ background: "white", borderColor: "var(--border-color)", boxShadow: "0 8px 24px rgba(11,39,68,0.12)" }}
        >
          <Link
            href="/committee"
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50"
            style={{ color: "var(--navy)" }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <circle cx="9" cy="7" r="3" /><circle cx="17" cy="8" r="2.5" />
              <path d="M1 21v-1a8 8 0 0116 0v1" /><path d="M21 21v-1a5 5 0 00-4-4.9" />
            </svg>
            Organising Committee
          </Link>

          <a
            href="https://msptm.org/about-us"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50"
            style={{ color: "var(--navy)" }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20" />
            </svg>
            MSPTM
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="ml-auto opacity-40" aria-hidden="true">
              <path d="M3.5 1H11v7.5M11 1L1 11" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>

          <a
            href="https://tidrec.um.edu.my/about-us"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50"
            style={{ color: "var(--navy)" }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
            TIDREC
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="ml-auto opacity-40" aria-hidden="true">
              <path d="M3.5 1H11v7.5M11 1L1 11" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>

          {firstAnnouncementUrl && (
            <a
              href="/api/first-announcement"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 border-t"
              style={{ color: "var(--teal)", borderColor: "var(--border-color)" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              First Announcement
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function AbstractDropdown() {
  return (
    <div className="relative group">
      <button
        type="button"
        className="hover:text-accent transition-colors text-[var(--navy)] font-semibold text-sm flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
      >
        Abstract
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="mt-0.5 transition-transform group-hover:rotate-180">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className="absolute left-0 top-full pt-2 hidden group-hover:block z-50" style={{ minWidth: 200 }}>
        <div
          className="rounded-xl overflow-hidden border"
          style={{ background: "white", borderColor: "var(--border-color)", boxShadow: "0 8px 24px rgba(11,39,68,0.12)" }}
        >
          <Link
            href="/abstract"
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50"
            style={{ color: "var(--navy)" }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Abstract
          </Link>

          <a
            href="/portal/abstracts/new"
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 border-t"
            style={{ color: "var(--teal)", borderColor: "var(--border-color)" }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Submit Abstract
          </a>
        </div>
      </div>
    </div>
  );
}

export function SiteHeader() {
  const { data: cms } = useGetSettings();

  return (
    <header className="border-b border-sidebar-border sticky top-0 z-50 bg-white">
      <div className="w-full h-32 flex items-center pr-6">
        <Link href="/" className="flex-shrink-0">
          <img src={logoImg} alt="SEAT-MSPTM 2027" className="h-32 w-auto object-contain" />
        </Link>

        <nav className="hidden md:flex flex-1 items-center justify-center gap-5">
          <Link href="/" className="hover:text-accent transition-colors text-[var(--navy)] font-semibold text-sm">Home</Link>
          <AboutDropdown firstAnnouncementUrl={cms?.first_announcement_url} />
          <Link href="/programme" className="hover:text-accent transition-colors text-[var(--navy)] font-semibold text-sm">Programme</Link>
          <AbstractDropdown />
          <Link href="/speakers" className="hover:text-accent transition-colors text-[var(--navy)] font-semibold text-sm">Speakers</Link>
          <a href="/#sponsors" className="hover:text-accent transition-colors cursor-pointer text-[var(--navy)] font-semibold text-sm">Sponsors</a>
          <Link href="/contact" className="hover:text-accent transition-colors text-[var(--navy)] font-semibold text-sm">Contact</Link>
          {cms?.sponsor_prospectus_url && (
            <a href="/api/sponsor-prospectus" download className="hover:text-accent transition-colors text-[var(--navy)] font-semibold text-sm cursor-pointer">Prospectus</a>
          )}
          <Link href="/login" className="hover:text-accent transition-colors text-[var(--navy)] font-semibold text-sm">Login</Link>
          <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90 text-sm px-5">
            <Link href="/register">Registration</Link>
          </Button>
        </nav>

        <div className="flex-shrink-0">
          <CountdownBadge />
        </div>
      </div>
    </header>
  );
}
