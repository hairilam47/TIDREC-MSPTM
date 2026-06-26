import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";
import { MapPin, ChevronRight, CalendarDays, ExternalLink } from "lucide-react";
import { resolveImageUrl } from "@/lib/resolveImageUrl";
import { useGetSpeakers, useGetSponsors, useGetSettings } from "@workspace/api-client-react";
import { SiteHeader } from "@/components/SiteHeader";

import bannerImg from "@assets/Banner for website.png";


export default function Home() {
  const { data: speakers } = useGetSpeakers();
  const { data: sponsors } = useGetSponsors();
  const { data: cms } = useGetSettings();

  const keynoteSpeakers = speakers?.filter(s => s.speakerTier === "keynote") || [];
  const featuredSpeakers = keynoteSpeakers.length > 0 ? keynoteSpeakers : (speakers || []);

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <SiteHeader />
      <main className="flex-1">

        {/* ── Hero banner ── */}
        <section style={{ background: "var(--navy)" }} className="relative">
          <div className="relative w-full">
            <img
              src={bannerImg}
              alt={`${cms?.event_name ?? "3rd Southeast Asia Ticks and Tick-borne Diseases Symposium"} — ${cms?.event_dates ?? "22–23 March 2027"}, ${cms?.event_venue ?? "Sunway Putra Hotel"}, ${cms?.event_city ?? "Kuala Lumpur, Malaysia"}`}
              className="w-full h-auto block"
            />
          </div>
        </section>

        {/* ── About section ── */}
        <section id="about" className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-16 items-start">

            {/* Left — text */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-6">About {cms?.event_short_name ?? "SEAT-MSPTM 2027"}</h2>
              <p className="text-base text-muted-foreground mb-5 leading-relaxed text-justify">
                {cms?.about_text ?? "The 3rd Southeast Asia Ticks and Tick-borne Diseases Symposium (SEA TTBD 2027), held in conjunction with the 63rd Annual Scientific Conference of the Malaysian Society of Parasitology and Tropical Medicine (MSPTM), brings together researchers, veterinarians, healthcare professionals, and students to discuss the latest advances in tick and tick-borne disease research."}
              </p>
              {cms?.hero_subtitle && (
                <p className="text-base text-muted-foreground mb-8 leading-relaxed text-justify">
                  {cms.hero_subtitle}
                </p>
              )}
              <Button asChild variant="outline" className="border-secondary text-secondary hover:bg-secondary hover:text-white">
                <Link href="/register">Read More</Link>
              </Button>
            </div>

            {/* Right — CTAs + Important Dates */}
            <div className="flex flex-col gap-4">
              {/* CTA buttons */}
              <Link
                href="/register"
                className="flex items-center justify-between w-full px-5 py-4 rounded-lg bg-accent text-white font-semibold text-base transition-opacity hover:opacity-90"
              >
                <span className="flex items-center gap-3">
                  <CalendarDays className="w-5 h-5 flex-shrink-0" />
                  Register Now
                </span>
                <ChevronRight className="w-5 h-5 flex-shrink-0" />
              </Link>
              <Link
                href="/portal/abstracts/new"
                className="flex items-center justify-between w-full px-5 py-4 rounded-lg bg-secondary text-white font-semibold text-base transition-opacity hover:opacity-90"
              >
                <span className="flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                  Submit Abstract
                </span>
                <ChevronRight className="w-5 h-5 flex-shrink-0" />
              </Link>

              {/* Important Dates */}
              <div className="border border-border rounded-lg overflow-hidden mt-2">
                <div className="px-5 py-3 font-bold text-sm uppercase tracking-widest text-secondary" style={{ background: "var(--bg-surface-secondary)", borderBottom: "1px solid var(--border)" }}>
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
        <section className="py-12 bg-white border-y border-border">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

              {/* TIDREC@UM */}
              <div className="flex flex-col items-center text-center rounded-xl border border-border shadow-sm bg-white p-6 gap-3">
                <div className="h-20 flex items-center justify-center">
                  {cms?.co_organiser_tidrec_logo ? (
                    <img src="/api/co-organiser-logo/tidrec" alt="TIDREC@UM" className="max-h-20 max-w-[140px] object-contain" />
                  ) : (
                    <span className="text-xl font-bold text-secondary tracking-tight">TIDREC@UM</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-secondary leading-tight">TIDREC@UM</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Co-Organiser</p>
                </div>
                <a
                  href="https://tidrec.um.edu.my"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs font-medium text-secondary hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" /> Visit Website
                </a>
              </div>

              {/* MSPTM */}
              <div className="flex flex-col items-center text-center rounded-xl border border-border shadow-sm bg-white p-6 gap-3">
                <div className="h-20 flex items-center justify-center">
                  {cms?.co_organiser_msptm_logo ? (
                    <img src="/api/co-organiser-logo/msptm" alt="MSPTM" className="max-h-20 max-w-[140px] object-contain" />
                  ) : (
                    <span className="text-xl font-bold text-secondary tracking-tight">MSPTM</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-secondary leading-tight">MSPTM</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Co-Organiser</p>
                </div>
                <a
                  href="https://msptm.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs font-medium text-secondary hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" /> Visit Website
                </a>
              </div>

              {/* Venue */}
              <div className="flex flex-col items-center text-center rounded-xl border border-border shadow-sm bg-white p-6 gap-3">
                <div className="h-20 flex items-center justify-center">
                  {cms?.venue_logo ? (
                    <img src="/api/co-organiser-logo/venue" alt={cms?.event_venue ?? "Venue"} className="max-h-20 max-w-[140px] object-contain" />
                  ) : (
                    <span className="text-xl font-bold text-secondary tracking-tight text-center leading-tight">
                      {cms?.event_venue ?? "Sunway Putra Hotel"}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-secondary leading-tight">{cms?.event_venue ?? "Sunway Putra Hotel"}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Venue</p>
                </div>
                <a
                  href={cms?.venue_website_url || "https://www.sunwayhotels.com/sunway-putra"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs font-medium text-secondary hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" /> Visit Website
                </a>
              </div>

              {/* Venue Location / Google Maps */}
              <div className="flex flex-col items-center text-center rounded-xl border border-border shadow-sm bg-white p-6 gap-3">
                <div className="h-20 flex items-center justify-center">
                  <MapPin className="w-12 h-12" style={{ color: "var(--teal)" }} />
                </div>
                <div>
                  <p className="text-sm font-bold text-secondary leading-tight">Venue Location</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {cms?.event_venue ?? "Sunway Putra Hotel"}<br />{cms?.event_city ?? "Kuala Lumpur, Malaysia"}
                  </p>
                </div>
                <a
                  href={cms?.contact_maps_url || `https://maps.google.com/?q=${encodeURIComponent(`${cms?.event_venue ?? "Sunway Putra Hotel"} ${cms?.event_city ?? "Kuala Lumpur"}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-colors"
                  style={{ borderColor: "var(--teal)", color: "var(--teal)" }}
                >
                  <MapPin className="w-3 h-3" /> View on Google Maps
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

            <div className="grid gap-6 mb-10 [grid-template-columns:repeat(auto-fill,minmax(min(480px,100%),1fr))]">
              {featuredSpeakers.map(speaker => (
                <div key={speaker.id} className="flex gap-6 p-6 rounded-xl border border-border bg-white shadow-sm">
                  {/* Photo */}
                  <div className="flex-shrink-0">
                    <Avatar className="w-64 h-64 rounded-xl">
                      <AvatarImage src={resolveImageUrl(speaker.photoUrl) || ''} alt={speaker.name} className="object-cover object-top" />
                      <AvatarFallback className="text-5xl bg-secondary text-white rounded-xl font-bold">
                        {speaker.initials || speaker.name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  {/* Info */}
                  <div className="flex flex-col justify-center min-w-0">
                    <h3 className="font-bold text-secondary text-base leading-snug mb-0.5">{speaker.name}</h3>
                    {speaker.institution && <p className="text-sm text-muted-foreground">{speaker.institution}</p>}
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
        <section id="sponsors" className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#0B2744" }}>Our Sponsors</h2>
              <div className="mx-auto mt-2 h-0.5 w-12 rounded-full" style={{ background: "#C89B3C" }} />
            </div>
            {(() => {
              const TIER_PAIRS: [string, string][] = [["platinum", "gold"], ["silver", "bronze"]];
              const TIER_LABELS: Record<string, string> = {
                platinum: "PLATINUM SPONSOR",
                gold: "GOLD SPONSORS",
                silver: "SILVER SPONSORS",
                bronze: "BRONZE SPONSORS",
              };
              const LOGO_SIZE: Record<string, string> = {
                platinum: "h-28 max-w-[240px]",
                gold: "h-28 max-w-[240px]",
                silver: "h-28 max-w-[240px]",
                bronze: "h-28 max-w-[240px]",
              };
              return TIER_PAIRS.map(([left, right]) => {
                const populated = [left, right].filter(
                  tier => (sponsors?.filter(s => s.tier === tier) ?? []).length > 0
                );
                if (populated.length === 0) return null;
                return (
                  <div
                    key={`${left}-${right}`}
                    className={`grid gap-4 mb-4 ${populated.length === 2 ? "md:grid-cols-2" : "grid-cols-1"}`}
                  >
                    {populated.map(tier => {
                      const tierSponsors = sponsors?.filter(s => s.tier === tier) ?? [];
                      return (
                        <div key={tier} className="rounded-xl border p-6 flex flex-col items-center gap-6 bg-white"
                          style={{ borderColor: "rgba(200,155,60,0.35)" }}>
                          <p className="text-xs font-bold uppercase tracking-widest"
                            style={{ color: "#C89B3C" }}>
                            + {TIER_LABELS[tier]} +
                          </p>
                          <div className="flex flex-wrap justify-center items-center gap-8">
                            {tierSponsors.map(sponsor => (
                              <div key={sponsor.id} className="flex items-center justify-center">
                                {sponsor.logoUrl ? (
                                  <img
                                    src={resolveImageUrl(sponsor.logoUrl) ?? ""}
                                    alt={sponsor.name}
                                    className={`object-contain ${LOGO_SIZE[tier]}`}
                                  />
                                ) : (
                                  <span className="font-bold text-lg" style={{ color: "#0B2744" }}>{sponsor.name}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              });
            })()}
          </div>
        </section>

      </main>
      {/* ── Footer ── */}
      <footer className="bg-secondary text-secondary-foreground py-16 border-t border-sidebar-border">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1">
            <h3 className="text-accent text-xl font-bold mb-3">{cms?.event_short_name ?? "SEAT-MSPTM 2027"}</h3>
            <p className="text-sm text-muted/70 mb-4 leading-relaxed">
              Advancing research, collaboration, and innovation in tick and tick-borne disease studies across Southeast Asia.
            </p>
            <p className="text-xs text-muted/50">{cms?.event_dates ?? "22–23 March 2027"} · {cms?.event_city ?? "Kuala Lumpur"}</p>
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
            <ul className="space-y-4 text-sm text-muted/70">
              <li className="flex items-center gap-3">
                <a
                  href={(cms as Record<string, string> | undefined)?.co_organiser_msptm_website_url || "https://msptm.org"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 hover:opacity-80 transition-opacity"
                >
                  {cms?.co_organiser_msptm_logo ? (
                    <img
                      src="/api/co-organiser-logo/msptm"
                      alt="MSPTM"
                      className="max-h-10 max-w-[80px] object-contain"
                    />
                  ) : (
                    <span className="font-bold text-white text-xs">MSPTM</span>
                  )}
                </a>
                <span>Malaysian Society of Parasitology &amp; Tropical Medicine</span>
              </li>
              <li className="flex items-center gap-3">
                <a
                  href={(cms as Record<string, string> | undefined)?.co_organiser_tidrec_website_url || "https://tidrec.um.edu.my"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 hover:opacity-80 transition-opacity"
                >
                  {cms?.co_organiser_tidrec_logo ? (
                    <img
                      src="/api/co-organiser-logo/tidrec"
                      alt="TIDREC"
                      className="max-h-10 max-w-[80px] object-contain"
                    />
                  ) : (
                    <span className="font-bold text-white text-xs">TIDREC</span>
                  )}
                </a>
                <span>Tropical Infectious Diseases Research &amp; Education Centre (TIDREC)</span>
              </li>
              <li id="contact" className="pt-3 border-t border-white/10">
                <span className="text-white font-medium block mb-1">Contact Us</span>
                <a href="mailto:events@msptm.network" className="hover:text-accent transition-colors">events@msptm.network</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-white/10 text-center text-xs text-muted/50">
          <p>&copy; 2027 SEAT-MSPTM. All rights reserved. | <a href="mailto:events@msptm.network" className="hover:text-accent transition-colors">events@msptm.network</a></p>
        </div>
      </footer>
    </div>
  );
}
