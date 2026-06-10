import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { MapPin, Clock, Users, Building, HeartPulse, GraduationCap, ChevronRight, FileText, Stethoscope, FlaskConical, Briefcase } from "lucide-react";
import { useGetSessions, useGetSpeakers, useGetSponsors } from "@workspace/api-client-react";

import headerImg from "@assets/[HEADER]_3rd_Southeast_Asia_Ticks_and_Tick-borne_Diseases_Symp_1781130713404.png";
import bannerImg from "@assets/[BANNER]_3rd_Southeast_Asia_Ticks_and_Tick-borne_Diseases_Symp_1781130718946.png";

export default function Home() {
  const { data: sessions } = useGetSessions();
  const { data: speakers } = useGetSpeakers();
  const { data: sponsors } = useGetSponsors();

  const featuredSessions = sessions?.slice(0, 4) || [];
  const featuredSpeakers = speakers?.slice(0, 4) || [];

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <header className="bg-secondary text-secondary-foreground border-b border-sidebar-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-serif text-2xl text-accent font-bold">SATBDS 2027</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="hover:text-accent transition-colors font-medium">Home</Link>
            <a href="#about" className="hover:text-accent transition-colors font-medium cursor-pointer">About</a>
            <a href="#programme" className="hover:text-accent transition-colors font-medium cursor-pointer">Programme</a>
            <a href="#speakers" className="hover:text-accent transition-colors font-medium cursor-pointer">Speakers</a>
            <a href="#sponsors" className="hover:text-accent transition-colors font-medium cursor-pointer">Sponsors</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-accent transition-colors font-medium">Login</Link>
            <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/register">Register Now</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* 2. Hero section */}
        <section className="bg-secondary relative overflow-hidden text-secondary-foreground">
          <div className="absolute inset-0 z-0 opacity-20">
            <img src={headerImg} alt="Symposium background" className="w-full h-full object-cover" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 py-24 md:py-32 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-primary/20 text-primary-foreground px-4 py-2 rounded-full mb-6 text-sm font-semibold tracking-wide border border-primary/30">
                <Clock className="w-4 h-4" /> 22–23 March 2027
                <span className="mx-2 opacity-50">|</span>
                <MapPin className="w-4 h-4" /> Sunway Putra Hotel, KL
              </div>
              <h2 className="font-serif text-4xl md:text-6xl max-w-4xl leading-tight mb-6 text-white">
                3rd Southeast Asia Ticks and Tick-Borne Diseases Symposium
              </h2>
              <p className="text-xl md:text-2xl text-muted/80 max-w-2xl mb-10">
                Uniting the World Against Tropical Diseases in a Changing Climate.
              </p>
              <div className="flex flex-col sm:flex-row items-center md:justify-start gap-4">
                <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 h-14 px-8 text-lg w-full sm:w-auto">
                  <Link href="/register">Register Now</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white/10 h-14 px-8 text-lg w-full sm:w-auto">
                  <Link href="/portal/programme">View Programme</Link>
                </Button>
              </div>
            </div>
            <div className="flex-1 w-full max-w-lg hidden md:block">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <img src={bannerImg} alt="SATBDS Banner" className="w-full h-auto" />
                <div className="absolute inset-0 bg-gradient-to-tr from-secondary/80 to-transparent mix-blend-multiply pointer-events-none"></div>
              </div>
            </div>
          </div>
        </section>
        
        {/* 3. Stats bar */}
        <section className="bg-primary text-primary-foreground py-12 border-y border-primary-border relative z-20 shadow-lg">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center divide-x divide-white/10">
              <div className="flex flex-col">
                <span className="text-4xl font-bold font-serif mb-2">400+</span>
                <span className="text-sm opacity-80 uppercase tracking-wider">Delegates</span>
              </div>
              <div className="flex flex-col">
                <span className="text-4xl font-bold font-serif mb-2">30+</span>
                <span className="text-sm opacity-80 uppercase tracking-wider">Speakers</span>
              </div>
              <div className="flex flex-col">
                <span className="text-4xl font-bold font-serif mb-2">2</span>
                <span className="text-sm opacity-80 uppercase tracking-wider">Days</span>
              </div>
              <div className="flex flex-col">
                <span className="text-4xl font-bold font-serif mb-2">15+</span>
                <span className="text-sm opacity-80 uppercase tracking-wider">Countries</span>
              </div>
              <div className="flex flex-col">
                <span className="text-4xl font-bold font-serif mb-2">10+</span>
                <span className="text-sm opacity-80 uppercase tracking-wider">Sponsors</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. About section */}
        <section id="about" className="py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-secondary mb-6">About The Symposium</h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                The 3rd Southeast Asia Ticks and Tick-Borne Diseases Symposium (SATBDS 2027) brings together leading researchers, public health officials, and medical professionals to address the growing threat of tick-borne pathogens in the region.
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Organised by the Malaysian Society of Parasitology and Tropical Medicine (MSPTM) and the Tropical Infectious Diseases Research & Education Centre (TIDREC@UM).
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

        {/* 5. Programme highlights */}
        <section id="programme" className="py-24 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <h2 className="text-3xl md:text-5xl font-serif font-bold text-secondary mb-4">Programme Highlights</h2>
                <p className="text-lg text-muted-foreground max-w-2xl">Discover keynotes and major sessions from our comprehensive two-day agenda.</p>
              </div>
              <Button asChild variant="outline" className="border-secondary text-secondary hover:bg-secondary hover:text-white shrink-0">
                <Link href="/portal/programme">View Full Programme <ChevronRight className="w-4 h-4 ml-2" /></Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredSessions.map(session => (
                <Card key={session.id} className="border-l-4 border-l-primary hover:shadow-md transition-shadow">
                  <CardContent className="p-6 flex flex-col sm:flex-row gap-6">
                    <div className="sm:w-32 shrink-0 border-b sm:border-b-0 sm:border-r border-border pb-4 sm:pb-0 pr-4">
                      <div className="font-bold text-secondary flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-primary" /> {session.startTime}
                      </div>
                      <div className="text-sm text-muted-foreground">Day {session.day}</div>
                      {session.room && <div className="text-xs text-muted-foreground mt-2"><MapPin className="w-3 h-3 inline mr-1"/>{session.room}</div>}
                    </div>
                    <div className="flex-1">
                      <Badge variant="secondary" className="mb-2 uppercase text-xs tracking-wider">{session.sessionType}</Badge>
                      <h3 className="font-serif font-bold text-xl text-secondary mb-2 leading-tight">{session.title}</h3>
                      {session.speakerName && <p className="text-sm font-medium text-primary">Speaker: {session.speakerName}</p>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Speakers section */}
        <section id="speakers" className="py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-secondary mb-4">Featured Speakers</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Hear from world-renowned experts in the field of tropical medicine and infectious diseases.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredSpeakers.map(speaker => (
                <div key={speaker.id} className="group cursor-pointer">
                  <div className="relative mb-6 mx-auto w-48 h-48 rounded-full overflow-hidden border-4 border-muted group-hover:border-primary transition-colors">
                    <Avatar className="w-full h-full">
                      <AvatarImage src={speaker.photoUrl || ''} alt={speaker.name} className="object-cover" />
                      <AvatarFallback className="text-3xl bg-secondary text-white font-serif">
                        {speaker.initials || speaker.name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="text-center">
                    <h3 className="font-serif font-bold text-xl text-secondary mb-1">{speaker.name}</h3>
                    <div className="text-sm font-medium text-primary mb-2">{speaker.country}</div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{speaker.topic}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <Button asChild variant="outline" className="border-secondary text-secondary hover:bg-secondary hover:text-white">
                <Link href="/portal/speakers">See All Speakers</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* 7. Who Should Attend */}
        <section className="py-24 bg-secondary text-secondary-foreground">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">Who Should Attend</h2>
              <p className="text-lg text-muted/80 max-w-2xl mx-auto">This symposium is designed for a diverse professional audience committed to combating tropical diseases.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white/5 border-white/10 text-white hover:bg-white/10 transition-colors">
                <CardContent className="p-8 text-center">
                  <HeartPulse className="w-12 h-12 text-accent mx-auto mb-6" />
                  <h3 className="font-bold text-xl mb-2">Healthcare Professionals</h3>
                  <p className="text-sm text-muted/70">Physicians, clinicians, and practitioners managing infectious diseases.</p>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10 text-white hover:bg-white/10 transition-colors">
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 text-primary-foreground mx-auto mb-6" />
                  <h3 className="font-bold text-xl mb-2">Researchers & Scientists</h3>
                  <p className="text-sm text-muted/70">Experts studying tick-borne pathogens and epidemiological trends.</p>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10 text-white hover:bg-white/10 transition-colors">
                <CardContent className="p-8 text-center">
                  <GraduationCap className="w-12 h-12 text-accent mx-auto mb-6" />
                  <h3 className="font-bold text-xl mb-2">Educators & Students</h3>
                  <p className="text-sm text-muted/70">Academic faculty and students in public health and medicine.</p>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10 text-white hover:bg-white/10 transition-colors">
                <CardContent className="p-8 text-center">
                  <Building className="w-12 h-12 text-primary-foreground mx-auto mb-6" />
                  <h3 className="font-bold text-xl mb-2">Industry Professionals</h3>
                  <p className="text-sm text-muted/70">Pharmaceutical and diagnostic sector representatives.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* 8. Sponsors section */}
        <section id="sponsors" className="py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-secondary mb-12">Our Sponsors</h2>
            
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
                          <div className="font-serif font-bold text-xl text-secondary">{sponsor.name}</div>
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
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">Don't miss SATBDS 2027</h2>
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
            <h3 className="font-serif text-accent text-2xl font-bold mb-4">SATBDS 2027</h3>
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
              <li><Link href="/portal/speakers" className="hover:text-accent transition-colors">Speakers</Link></li>
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