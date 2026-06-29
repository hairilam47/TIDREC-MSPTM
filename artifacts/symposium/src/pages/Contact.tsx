import { SiteHeader } from "@/components/SiteHeader";
import logoImg from "@assets/[WEBSITE LOGO] SEAT-MSPTM.png";
import { useGetSettings } from "@workspace/api-client-react";

function InfoSection({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div className="text-center py-8">
      <h2 className="font-bold tracking-widest text-sm uppercase mb-4" style={{ color: "var(--navy)" }}>
        {heading}
      </h2>
      {children}
    </div>
  );
}

function Divider() {
  return <hr style={{ borderColor: "#e5e7eb", margin: "0 0" }} />;
}

export default function ContactPage() {
  const { data: cms } = useGetSettings();

  const email = (cms as Record<string, string> | undefined)?.contact_email ?? "events@msptm.network";
  const venue = (cms as Record<string, string> | undefined)?.event_venue ?? "Sunway Putra Hotel";
  const city = (cms as Record<string, string> | undefined)?.event_city ?? "Kuala Lumpur, Malaysia";
  const mapsUrl = (cms as Record<string, string> | undefined)?.contact_maps_url ?? "https://maps.google.com/?q=Sunway+Putra+Hotel+Kuala+Lumpur";
  const organiserPrimary = (cms as Record<string, string> | undefined)?.organiser_full_primary ?? "Malaysian Society of Parasitology and Tropical Medicine (MSPTM)";
  const organiserSecondary = (cms as Record<string, string> | undefined)?.organiser_full_secondary ?? "Tropical Infectious Diseases Research & Education Centre (TIDREC)";
  const organiserTertiary = (cms as Record<string, string> | undefined)?.organiser_full_tertiary ?? "Universiti Teknologi MARA (UiTM)";
  const eventName = (cms as Record<string, string> | undefined)?.event_name ?? "3rd Southeast Asia Ticks and Tick-borne Diseases Symposium";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="py-14 px-4" style={{ background: "var(--navy)" }}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-wide text-white">
            Contact
          </h1>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="w-8 h-px" style={{ background: "var(--gold)" }} />
            <div className="w-2 h-2 rounded-full" style={{ background: "var(--gold)" }} />
            <div className="w-8 h-px" style={{ background: "var(--gold)" }} />
          </div>
        </div>
      </section>

      {/* Content card */}
      <main className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-xl bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "#e5e7eb" }}>

          {/* Logo */}
          <div className="flex justify-center pt-10 pb-6 px-8">
            <img src={logoImg} alt="3rd SEAT-MSPTM 2027" className="h-36 w-auto object-contain" />
          </div>

          <Divider />

          {/* Conference Secretariat */}
          <div className="px-8">
            <InfoSection heading="Conference Secretariat">
              <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>
                {eventName}<br />
                {venue}, {city}
              </p>
              <p className="text-sm mt-2">
                Email:{" "}
                <a
                  href={`mailto:${email}`}
                  className="font-medium underline underline-offset-2"
                  style={{ color: "var(--teal)" }}
                >
                  {email}
                </a>
              </p>
            </InfoSection>
          </div>

          <Divider />

          {/* Organised By */}
          <div className="px-8">
            <InfoSection heading="Organised By">
              <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>
                {organiserPrimary}<br />
                {organiserSecondary}<br />
                {organiserTertiary}
              </p>
            </InfoSection>
          </div>

          <Divider />

          {/* Venue */}
          <div className="px-8">
            <InfoSection heading="Venue">
              <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>
                {venue}<br />
                {city}
              </p>
              {mapsUrl && (
                <p className="mt-2">
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium underline underline-offset-2"
                    style={{ color: "var(--teal)" }}
                  >
                    Google Maps
                  </a>
                </p>
              )}
            </InfoSection>
          </div>

        </div>
      </main>

      <footer className="py-6 text-center text-xs border-t" style={{ color: "#aaa" }}>
        © 2027 3rd Southeast Asia Ticks and Tick-borne Diseases Symposium. All rights reserved.
      </footer>
    </div>
  );
}
