import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CountdownBadge } from "@/components/ui/CountdownBadge";
import { useGetSettings } from "@workspace/api-client-react";
import logoImg from "@assets/[WEBSITE LOGO] SEAT-MSPTM.png";

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
          <a href="/#about" className="hover:text-accent transition-colors cursor-pointer text-[var(--navy)] font-semibold text-sm">About</a>
          <Link href="/portal/programme" className="hover:text-accent transition-colors text-[var(--navy)] font-semibold text-sm">Programme</Link>
          <Link href="/portal/abstracts/new" className="hover:text-accent transition-colors text-[var(--navy)] font-semibold text-sm">Abstract</Link>
          <Link href="/speakers" className="hover:text-accent transition-colors text-[var(--navy)] font-semibold text-sm">Speakers</Link>
          <a href="/#sponsors" className="hover:text-accent transition-colors cursor-pointer text-[var(--navy)] font-semibold text-sm">Sponsors</a>
          <a href="/#contact" className="hover:text-accent transition-colors cursor-pointer text-[var(--navy)] font-semibold text-sm">Contact</a>
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
