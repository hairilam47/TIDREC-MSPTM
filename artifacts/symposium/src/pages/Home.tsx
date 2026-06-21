import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";
import { MapPin, ChevronRight, CalendarDays, ExternalLink } from "lucide-react";
import { CountdownBadge } from "@/components/ui/CountdownBadge";
import { useGetSpeakers, useGetSponsors, useGetSettings } from "@workspace/api-client-react";

import bannerImg from "@assets/[WEBSITE BANNER] SEAT-MSPTM.png";
import logoImg from "@assets/[WEBSITE_LOGO]_SEAT-MSPTM_1782081214245.png";


export default function Home() {
  const { data: speakers } = useGetSpeakers();
  const { data: sponsors } = useGetSponsors();
  const { data: cms } = useGetSettings();

  const featuredSpeakers = speakers?.slice(0, 2) || [];

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      {/* ── Navigation ── */}
      <header className="text-secondary-foreground border-b border-sidebar-border sticky top-0 z-50 bg-[#ffffff]">
        <div className="max-w-7xl mx-auto px-4 h-28 flex gap-4 bg-[color:var(--tw-ring-offset-color)] font-semibold ml-[0px] mr-[0px] pl-[0px] pr-[0px] pt-[0px] pb-[0px] justify-between items-center">
          {/* Logo + Nav grouped on the left */}
          <div className="flex items-center min-w-0 gap-[100px]">
            <Link href="/" className="flex-shrink-0">
              <img src={logoImg} alt="SATBDS 2027" className="h-28 w-auto object-contain ml-[5px] mr-[5px]" />
            </Link>
            <nav className="hidden md:flex gap-5 text-sm justify-between items-center ml-[0px] mr-[0px] mt-[2px] mb-[2px] text-left">
              <Link href="/" className="hover:text-accent transition-colors text-[#092748] font-bold text-[20px]">Home</Link>
              <a href="#about" className="hover:text-accent transition-colors cursor-pointer text-[#092748] font-bold text-[20px]">About</a>
              <a href="#speakers" className="hover:text-accent transition-colors cursor-pointer text-[#092748] font-bold text-[20px]">Speakers</a>
              <a href="#sponsors" className="hover:text-accent transition-colors cursor-pointer text-[#092748] font-bold text-[20px]">Sponsors</a>
              <Link href="/portal/abstracts/new" className="hover:text-accent transition-colors text-[#092748] font-bold text-[20px]">Abstract</Link>
              <a href="#contact" className="hover:text-accent transition-colors cursor-pointer text-[#092748] font-bold text-[20px]">Contact</a>
              {cms?.sponsor_prospectus_url && (
                <a href="/api/sponsor-prospectus" download className="hover:text-accent transition-colors font-medium cursor-pointer">Prospectus</a>
              )}
            </nav>
          </div>

          {/* Right actions */}
          <div className="flex flex-shrink-0 justify-center items-center gap-[20px] ml-[-150px] mr-[-150px]">
            <CountdownBadge variant="dark" />
            <Link href="/login" className="hidden sm:block hover:text-accent transition-colors font-medium text-sm">Login</Link>
            <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90 text-sm">
              <Link href="/register">Registration</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">

        {/* ── Hero banner ── */}
        <section style={{ background: "#0B2744" }} className="relative">
          <div className="relative w-full">
            <img
              src={bannerImg}
              alt="3rd Southeast Asia Ticks and Tick-borne Diseases Symposium — 22–23 March 2027, Sunway Putra Hotel, Kuala Lumpur"
              className="w-full h-auto block"
            />
            {/* Gradient scrim so overlaid buttons stay legible */}
            <div
              className="absolute bottom-0 left-0 right-0 pointer-events-none"
              style={{ height: "35%", background: "linear-gradient(to top, rgba(11,39,68,0.85) 0%, rgba(11,39,68,0.3) 60%, transparent 100%)" }}
            />
            {/* CTA buttons overlaid at the bottom-left */}
            <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 z-10">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 h-12 px-8 text-base w-full sm:w-auto">
                    <Link href="/register">Register Now</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white/10 h-12 px-8 text-base w-full sm:w-auto">
                    <Link href="/portal/programme">View Programme</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── About section ── */}
        <section id="about" className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-16 items-start">

            {/* Left — text */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-6">About SEAT-MSPTM 2027</h2>
              <p className="text-base text-muted-foreground mb-5 leading-relaxed">
                The 3rd Southeast Asia Ticks and Tick-borne Diseases Symposium (SEA TTBD 2027), held in conjunction with the 63rd Annual Scientific Conference of the Malaysian Society of Parasitology and Tropical Medicine (MSPTM), brings together researchers, veterinarians, healthcare professionals, and students to discuss the latest advances in tick and tick-borne disease research.
              </p>
              <p className="text-base text-muted-foreground mb-8 leading-relaxed">
                The symposium provides a platform for sharing knowledge on tick biology, ecology, pathogen discovery, diagnostics, epidemiology, surveillance, and control strategies, while fostering regional collaboration and advancing research on tick-borne diseases in Southeast Asia.
              </p>
              <Button asChild variant="outline" className="border-secondary text-secondary hover:bg-secondary hover:text-white">
                <Link href="/register">Read More</Link>
              </Button>
            </div>

            {/* Right — CTAs + Important Dates */}
            <div className="flex flex-col gap-4">
              {/* CTA buttons */}
              <Link
                href="/register"
                className="flex items-center justify-between w-full px-5 py-4 rounded-lg text-white font-semibold text-base transition-opacity hover:opacity-90"
                style={{ background: "#C89B3C" }}
              >
                <span className="flex items-center gap-3">
                  <CalendarDays className="w-5 h-5 flex-shrink-0" />
                  Register Now
                </span>
                <ChevronRight className="w-5 h-5 flex-shrink-0" />
              </Link>
              <Link
                href="/portal/abstracts/new"
                className="flex items-center justify-between w-full px-5 py-4 rounded-lg text-white font-semibold text-base transition-opacity hover:opacity-90"
                style={{ background: "#C89B3C" }}
              >
                <span className="flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                  Submit Abstract
                </span>
                <ChevronRight className="w-5 h-5 flex-shrink-0" />
              </Link>

              {/* Important Dates */}
              <div className="border border-border rounded-lg overflow-hidden mt-2">
                <div className="px-5 py-3 font-bold text-sm uppercase tracking-widest text-secondary" style={{ background: "#f4f6f8", borderBottom: "1px solid var(--border)" }}>
                  Important Dates
                </div>
                <div className="divide-y divide-border">
                  {[
                    { key: "date_registration_opens", label: "Registration Opens" },
                    { key: "date_early_bird_closes", label: "Early Bird Registration Closes" },
                    { key: "date_abstract_submission_closes", label: "Abstract Submission Closes" },
                    { key: "date_regular_submission_closes", label: "Regular Submission Closes" },
                    { key: "date_conference", label: "Conference Dates" },
                  ].map(({ key, label }) => {
                    const date = cms?.[key as keyof typeof cms] as string | undefined;
                    if (!date) return null;
                    return (
                      <div key={key} className="flex items-start gap-3 px-5 py-3">
                        <CalendarDays className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-secondary text-sm">{date}</span>
                          <span className="text-muted-foreground text-sm"> — {label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Co-organisers strip ── */}
        <section className="py-10 bg-white border-y border-border">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-wrap items-stretch justify-center divide-y md:divide-y-0 md:divide-x divide-border">
              {/* TIDREC@UM */}
              <div className="flex flex-col items-center justify-center gap-1 px-10 py-4 text-center">
                <span className="text-lg font-bold text-secondary tracking-tight">TIDREC@UM</span>
                <span className="text-xs text-muted-foreground">Tick-borne Diseases Research &amp; Education Centre</span>
                <span className="text-xs font-medium text-primary mt-1">Co-Organiser</span>
                <a href="https://tidrec.um.edu.my" target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline flex items-center gap-1 mt-1">
                  Visit Website <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              {/* MSPTM */}
              <div className="flex flex-col items-center justify-center gap-1 px-10 py-4 text-center">
                <span className="text-lg font-bold text-secondary tracking-tight">MSPTM</span>
                <span className="text-xs text-muted-foreground">Malaysian Society of Parasitology &amp; Tropical Medicine</span>
                <span className="text-xs font-medium text-primary mt-1">Co-Organiser</span>
                <a href="https://msptm.org" target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline flex items-center gap-1 mt-1">
                  Visit Website <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              {/* Sunway Putra Hotel */}
              <div className="flex flex-col items-center justify-center gap-1 px-10 py-4 text-center">
                <span className="text-lg font-bold text-secondary tracking-tight">Sunway Putra Hotel</span>
                <span className="text-xs text-muted-foreground">Kuala Lumpur, Malaysia</span>
                <span className="text-xs font-medium text-primary mt-1">Venue</span>
                <a href="https://www.sunwayhotels.com/sunway-putra" target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline flex items-center gap-1 mt-1">
                  Visit Website <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              {/* Google Maps */}
              <div className="flex flex-col items-center justify-center gap-1 px-10 py-4 text-center">
                <MapPin className="w-7 h-7 text-accent mb-1" />
                <span className="text-sm font-semibold text-secondary">Venue Location</span>
                <span className="text-xs text-muted-foreground">Sunway Putra Hotel<br />Kuala Lumpur</span>
                <a
                  href="https://maps.google.com/?q=Sunway+Putra+Hotel+Kuala+Lumpur"
                  target="_blank" rel="noopener noreferrer"
                  className="text-xs text-accent hover:underline flex items-center gap-1 mt-1"
                >
                  View on Google Maps <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── Keynote Speakers ── */}
        <section id="speakers" className="py-20 bg-background">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-3">Keynote Speakers</h2>
              <p className="text-base text-muted-foreground max-w-xl mx-auto">Hear from world-renowned experts in tropical medicine and infectious diseases.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
              {featuredSpeakers.map(speaker => (
                <div key={speaker.id} className="flex gap-5 p-5 rounded-xl border border-border bg-white shadow-sm">
                  {/* Photo */}
                  <div className="flex-shrink-0">
                    <Avatar className="w-24 h-24 rounded-xl">
                      <AvatarImage src={speaker.photoUrl || ''} alt={speaker.name} className="object-cover object-top" />
                      <AvatarFallback className="text-2xl bg-secondary text-white rounded-xl font-bold">
                        {speaker.initials || speaker.name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  {/* Info */}
                  <div className="flex flex-col justify-center min-w-0">
                    <span
                      className="inline-block self-start text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded mb-2"
                      style={{ background: "rgba(200,155,60,0.15)", color: "#C89B3C" }}
                    >
                      Keynote Speaker
                    </span>
                    <h3 className="font-bold text-secondary text-base leading-snug mb-0.5 truncate">{speaker.name}</h3>
                    {speaker.affiliation && <p className="text-sm text-muted-foreground truncate">{speaker.affiliation}</p>}
                    <p className="text-sm text-primary font-medium">{speaker.country}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Button asChild variant="outline" className="border-secondary text-secondary hover:bg-secondary hover:text-white">
                <Link href="/speakers">See All Speakers <ChevronRight className="w-4 h-4 ml-1" /></Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── Sponsors ── */}
        <section id="sponsors" className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-12">Our Sponsors</h2>
            {['platinum', 'gold', 'silver', 'bronze'].map(tier => {
              const tierSponsors = sponsors?.filter(s => s.tier === tier) || [];
              if (tierSponsors.length === 0) return null;
              return (
                <div key={tier} className="mb-10">
                  <div className="flex items-center gap-4 justify-center mb-6">
                    <div className="h-px flex-1 max-w-24 bg-border" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      {tier} Sponsors
                    </h3>
                    <div className="h-px flex-1 max-w-24 bg-border" />
                  </div>
                  <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center">
                    {tierSponsors.map(sponsor => (
                      <div key={sponsor.id} className={`grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100 ${tier === 'platinum' ? 'w-48' : tier === 'gold' ? 'w-40' : 'w-32'}`}>
                        {sponsor.logoUrl ? (
                          <img src={sponsor.logoUrl} alt={sponsor.name} className="w-full h-auto object-contain" />
                        ) : (
                          <div className="font-bold text-xl text-secondary">{sponsor.name}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── CTA banner ── */}
        <section className="bg-secondary text-secondary-foreground py-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Don't miss SATBDS 2027</h2>
            <p className="text-xl text-secondary-foreground/80 mb-10">
              Join us in Kuala Lumpur to share knowledge, foster collaborations, and advance research.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 h-14 px-8 text-lg">
                <Link href="/register">Register Now</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white/10 h-14 px-8 text-lg">
                <Link href="/portal/abstracts/new">Submit Abstract</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      {/* ── Footer ── */}
      <footer className="bg-secondary text-secondary-foreground py-16 border-t border-sidebar-border">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1">
            <h3 className="text-accent text-xl font-bold mb-3">SEAT-MSPTM 2027</h3>
            <p className="text-sm text-muted/70 mb-4 leading-relaxed">
              Advancing research, collaboration, and innovation in tick and tick-borne disease studies across Southeast Asia.
            </p>
            <p className="text-xs text-muted/50">22–23 March 2027 · Kuala Lumpur</p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-5 uppercase text-xs tracking-wider">Navigation</h4>
            <ul className="space-y-3 text-sm text-muted/70">
              <li><Link href="/" className="hover:text-accent transition-colors">Home</Link></li>
              <li><a href="#about" className="hover:text-accent transition-colors">About</a></li>
              <li><Link href="/speakers" className="hover:text-accent transition-colors">Speakers</Link></li>
              <li><a href="#sponsors" className="hover:text-accent transition-colors">Sponsors</a></li>
              {cms?.sponsor_prospectus_url && (
                <li><a href="/api/sponsor-prospectus" download className="hover:text-accent transition-colors">Sponsor Prospectus</a></li>
              )}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-5 uppercase text-xs tracking-wider">Delegates</h4>
            <ul className="space-y-3 text-sm text-muted/70">
              <li><Link href="/register" className="hover:text-accent transition-colors">Registration</Link></li>
              <li><Link href="/portal/abstracts/new" className="hover:text-accent transition-colors">Call for Abstracts</Link></li>
              <li><Link href="/login" className="hover:text-accent transition-colors">Participant Portal</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-5 uppercase text-xs tracking-wider">Organisers</h4>
            <ul className="space-y-3 text-sm text-muted/70">
              <li className="flex items-start gap-2">
                <span className="font-bold text-white text-xs mt-0.5">MSPTM</span>
                <span>Malaysian Society of Parasitology and Tropical Medicine</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-white text-xs mt-0.5">TIDREC</span>
                <span>Tropical Infectious Diseases Research &amp; Education Centre (TIDREC@UM)</span>
              </li>
              <li id="contact" className="pt-3 border-t border-white/10">
                <span className="text-white font-medium block mb-1">Contact Us</span>
                <a href="mailto:events@msptm.network" className="hover:text-accent transition-colors">events@msptm.network</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-white/10 text-center text-xs text-muted/50">
          <p>&copy; 2027 SATBDS. All rights reserved. | <a href="mailto:events@msptm.network" className="hover:text-accent transition-colors">events@msptm.network</a></p>
        </div>
      </footer>
    </div>
  );
}
