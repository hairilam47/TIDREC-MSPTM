import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { MapPin, Clock, Users, Building, ChevronRight, CalendarDays } from "lucide-react";
import { CountdownBadge } from "@/components/ui/CountdownBadge";
import { useGetSessions, useGetSpeakers, useGetSponsors, useGetSettings } from "@workspace/api-client-react";

import bannerImg from "@assets/[BANNER]_3rd_Southeast_Asia_Ticks_and_Tick-borne_Diseases_Symp_1781130718946.png";

export default function Home() {
  const { data: sessions } = useGetSessions();
  const { data: speakers } = useGetSpeakers();
  const { data: sponsors } = useGetSponsors();
  const { data: cms } = useGetSettings();

  const eventDates = cms?.event_dates ?? "22–23 March 2027";
  const eventVenue = cms?.event_venue ?? "Sunway Putra Hotel";
  const eventCity = cms?.event_city ?? "Kuala Lumpur, Malaysia";
  const aboutText = cms?.about_text ?? "The SATBDS symposium brings together researchers, clinicians, veterinarians, and public health professionals from across Southeast Asia to share the latest advances in tick biology and tick-borne disease research.";
  const organisers = `${cms?.organiser_primary ?? "MSPTM"} & ${cms?.organiser_secondary ?? "TIDREC@UM"}`;

  const featuredSessions = sessions?.slice(0, 4) || [];
  const featuredSpeakers = speakers?.slice(0, 4) || [];

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <header className="bg-secondary text-secondary-foreground border-b border-sidebar-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="hover:text-accent transition-colors font-medium">Home</Link>
            <a href="#about" className="hover:text-accent transition-colors font-medium cursor-pointer">About</a>
            <a href="#programme" className="hover:text-accent transition-colors font-medium cursor-pointer">Programme</a>
            <a href="#speakers" className="hover:text-accent transition-colors font-medium cursor-pointer">Speakers</a>
            <a href="#sponsors" className="hover:text-accent transition-colors font-medium cursor-pointer">Sponsors</a>
            {cms?.sponsor_prospectus_url && (
              <a href="/api/sponsor-prospectus" download className="hover:text-accent transition-colors font-medium cursor-pointer">Sponsor Prospectus</a>
            )}
          </nav>
          <div className="flex items-center gap-4">
            <CountdownBadge variant="dark" />
            <Link href="/login" className="hover:text-accent transition-colors font-medium">Login</Link>
            <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/register">Register Now</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {/* 2. Hero section */}
        <section style={{ background: "#0B2744" }} className="relative">
          {/* Full-width banner — object-contain preserves all poster content */}
          <div className="relative w-full">
            <img
              src={bannerImg}
              alt="SATBDS 2027 — 3rd Southeast Asia Ticks and Tick-borne Diseases Symposium"
              className="w-full h-auto block"
            />
            {/* Gradient scrim so overlaid text/buttons stay legible */}
            <div
              className="absolute bottom-0 left-0 right-0 pointer-events-none"
              style={{ height: "45%", background: "linear-gradient(to top, rgba(11,39,68,0.95) 0%, rgba(11,39,68,0.5) 55%, transparent 100%)" }}
            />
            {/* Date/venue pill + CTAs overlaid at the bottom-left */}
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
        
        {/* 4. About section */}
        <section id="about" className="py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-sans font-bold text-secondary mb-6">About The Symposium</h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                The 3rd Southeast Asia Ticks and Tick-borne Diseases Symposium (SEA TTBD 2027), held in conjunction with the 63rd Annual Scientific Conference of the Malaysian Society of Parasitology and Tropical Medicine (MSPTM), brings together researchers, veterinarians, healthcare professionals, and students to discuss the latest advances in tick and tick-borne disease research.
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                The symposium provides a platform for sharing knowledge on tick biology, ecology, pathogen discovery, diagnostics, epidemiology, surveillance, and control strategies, while fostering regional collaboration and promoting a One Health approach to addressing tick-borne diseases in Southeast Asia.
              </p>
              
              <div className="bg-accent/10 border-l-4 border-accent p-6 rounded-r-lg mb-8">
                <h3 className="font-bold text-secondary text-lg mb-2">Early Bird Registration Open!</h3>
                <p className="text-muted-foreground">Register before December 31st, 2026 to secure discounted rates.</p>
              </div>
              
              <Button asChild variant="outline" className="border-secondary text-secondary hover:bg-secondary hover:text-white">
                <Link href="/register">Secure Your Spot</Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-muted p-8 rounded-2xl aspect-square flex flex-col items-center justify-center text-center">
                  <Building className="w-12 h-12 text-primary mb-4" />
                  <h4 className="font-bold text-secondary">TIDREC@UM</h4>
                  <p className="text-sm text-muted-foreground">Co-Organiser</p>
                </div>
                <div className="bg-primary/5 p-8 rounded-2xl aspect-square flex flex-col items-center justify-center text-center">
                  <Users className="w-12 h-12 text-primary mb-4" />
                  <h4 className="font-bold text-secondary">MSPTM</h4>
                  <p className="text-sm text-muted-foreground">Co-Organiser</p>
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="bg-accent/10 p-8 rounded-2xl aspect-square flex flex-col items-center justify-center text-center">
                  <MapPin className="w-12 h-12 text-accent mb-4" />
                  <h4 className="font-bold text-secondary">Kuala Lumpur</h4>
                  <p className="text-sm text-muted-foreground">Host City</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Speakers section */}
        <section id="speakers" className="py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-sans font-bold text-secondary mb-4">Keynote Speakers</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Hear from world-renowned experts in the field of tropical medicine and infectious diseases.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredSpeakers.map(speaker => (
                <div key={speaker.id} className="group cursor-pointer">
                  <div className="relative mb-6 mx-auto w-48 h-48 rounded-full overflow-hidden border-4 border-muted group-hover:border-accent transition-colors">
                    <Avatar className="w-full h-full">
                      <AvatarImage src={speaker.photoUrl || ''} alt={speaker.name} className="object-cover" />
                      <AvatarFallback className="text-3xl bg-secondary text-white font-sans">
                        {speaker.initials || speaker.name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="text-center">
                    <h3 className="font-sans font-bold text-xl text-secondary mb-1">{speaker.name}</h3>
                    <div className="text-sm font-medium text-primary mb-2">{speaker.country}</div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{speaker.topic}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <Button asChild variant="outline" className="border-secondary text-secondary hover:bg-secondary hover:text-white">
                <Link href="/speakers">See All Speakers</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* 8. Sponsors section */}
        <section id="sponsors" className="py-24 bg-[color:var(--color-amber-200)]">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-sans font-bold text-secondary mb-12">Our Sponsors</h2>
            
            {['platinum', 'gold', 'silver', 'bronze'].map(tier => {
              const tierSponsors = sponsors?.filter(s => s.tier === tier) || [];
              if (tierSponsors.length === 0) return null;
              
              return (
                <div key={tier} className="mb-12">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-8">
                    {tier} Sponsors
                  </h3>
                  <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center">
                    {tierSponsors.map(sponsor => (
                      <div key={sponsor.id} className={`grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100 ${tier === 'platinum' ? 'w-48' : tier === 'gold' ? 'w-40' : 'w-32'}`}>
                        {sponsor.logoUrl ? (
                          <img src={sponsor.logoUrl} alt={sponsor.name} className="w-full h-auto object-contain" />
                        ) : (
                          <div className="font-sans font-bold text-xl text-secondary">{sponsor.name}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 9. CTA Banner */}
        <section className="bg-primary text-primary-foreground py-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-sans font-bold mb-6">Don't miss SATBDS 2027</h2>
            <p className="text-xl text-primary-foreground/80 mb-10">
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
      {/* 10. Footer */}
      <footer className="bg-secondary text-secondary-foreground py-16 border-t border-sidebar-border">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <h3 className="font-sans text-accent text-2xl font-bold mb-4">SATBDS 2027</h3>
            <p className="text-sm text-muted/70 mb-6 leading-relaxed">
              Uniting the World Against Tropical Diseases in a Changing Climate. 22–23 March 2027.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-6 uppercase text-sm tracking-wider">Navigation</h4>
            <ul className="space-y-3 text-sm text-muted/70">
              <li><Link href="/" className="hover:text-accent transition-colors">Home</Link></li>
              <li><a href="#about" className="hover:text-accent transition-colors">About</a></li>
              <li><Link href="/portal/programme" className="hover:text-accent transition-colors">Programme</Link></li>
              <li><Link href="/speakers" className="hover:text-accent transition-colors">Speakers</Link></li>
              {cms?.sponsor_prospectus_url && (
                <li><a href="/api/sponsor-prospectus" download className="hover:text-accent transition-colors">Sponsor Prospectus</a></li>
              )}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-6 uppercase text-sm tracking-wider">Delegates</h4>
            <ul className="space-y-3 text-sm text-muted/70">
              <li><Link href="/register" className="hover:text-accent transition-colors">Registration</Link></li>
              <li><Link href="/portal/abstracts/new" className="hover:text-accent transition-colors">Call for Abstracts</Link></li>
              <li><Link href="/login" className="hover:text-accent transition-colors">Participant Portal</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-6 uppercase text-sm tracking-wider">Organisers</h4>
            <ul className="space-y-3 text-sm text-muted/70">
              <li>Malaysian Society of Parasitology and Tropical Medicine (MSPTM)</li>
              <li>Tropical Infectious Diseases Research & Education Centre (TIDREC@UM)</li>
              <li className="pt-3 border-t border-white/10">
                <span className="text-white font-medium block mb-1">Contact Us</span>
                <a href="mailto:events@msptm.network" className="hover:text-accent transition-colors">events@msptm.network</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-white/10 text-center text-sm text-muted/50">
          <p>&copy; 2027 SATBDS. All rights reserved. | Contact: <a href="mailto:events@msptm.network" className="hover:text-accent transition-colors">events@msptm.network</a></p>
        </div>
      </footer>
    </div>
  );
}