import React from "react";
import { Link } from "wouter";
import { SiteHeader } from "@/components/SiteHeader";
import { useGetSettings } from "@workspace/api-client-react";

const SEAT_TOPICS_DEFAULT = [
  "Tick Biology and Ecology",
  "Tick-Borne Pathogens and Diseases",
  "Surveillance and Public Health",
  "Genomics, Data Science and Emerging Technologies",
  "Tick Control and Management",
];

const MSPTM_TOPICS_DEFAULT = [
  "Tropical and Infectious Diseases",
  "Vector Biology and Medical Entomology",
  "Microbiology and Parasitology",
  "Drug, Insecticide and Antibiotic Resistance",
  "Other Related Topics",
];

const GUIDELINE_DEFAULTS = [
  {
    key: "guideline_submission",
    title: "Abstract Submission Guidelines",
    defaultBody: "Abstracts must be submitted through the online submission portal. Each abstract should be no more than 300 words (excluding title and authors). The title should be concise and clearly reflect the content of the abstract. All abstracts must be written in English. Presenting authors are required to register for the conference.",
  },
  {
    key: "guideline_mode",
    title: "Mode of Presentation & Presentation Guidelines",
    defaultBody: "Authors may indicate their preferred mode of presentation (oral or poster) during submission. The Scientific Committee reserves the right to reassign the mode of presentation based on the programme requirements. Notification of acceptance and assigned mode will be communicated via email.",
  },
  {
    key: "guideline_oral",
    title: "Oral Presentation Guidelines",
    defaultBody: "Oral presentations are allocated 12 minutes for presentation and 3 minutes for Q&A. Slides must be prepared in PowerPoint (.pptx) or PDF format in widescreen (16:9) ratio. Presenters are requested to submit their slides to the audio-visual desk at least 2 hours before their session.",
  },
  {
    key: "guideline_poster",
    title: "Poster Display Guidelines",
    defaultBody: "Posters should be prepared in portrait orientation (A0 size: 841 mm × 1189 mm). Presenters must be available at their poster during the designated poster viewing sessions. Posters must be mounted and removed within the stipulated times. The organisers will not be responsible for posters left after the event.",
  },
  {
    key: "guideline_competition",
    title: "MSPTM Student Competition – Rapid Oral Presentation",
    defaultBody: "This competition is open to students (undergraduate and postgraduate) presenting under the MSPTM Scientific Conference track. Each participant will have 5 minutes to present followed by 2 minutes of Q&A. Participants must indicate their intention to compete during abstract submission. Judging criteria include scientific content, clarity of presentation, and ability to answer questions.",
  },
  {
    key: "guideline_consent",
    title: "Consent, Permission & Copyright",
    defaultBody: "By submitting an abstract, authors confirm that the work is original and has not been published or presented elsewhere. Authors grant the organisers permission to publish the accepted abstracts in the conference proceedings and digital platforms. All co-authors have given their consent for the submission. Authors are responsible for obtaining necessary ethics approvals and institutional permissions prior to submission.",
  },
];

function KeyDateCard({
  icon,
  label,
  date,
}: {
  icon: React.ReactNode;
  label: string;
  date: string;
}) {
  return (
    <div
      className="flex-1 min-w-[200px] rounded-2xl p-6 flex flex-col gap-3 items-start"
      style={{ border: "1px solid #e5e9ef", background: "white", boxShadow: "0 2px 12px rgba(11,39,68,0.06)" }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: "rgba(200,155,60,0.12)" }}
      >
        {icon}
      </div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted, #6b7a8d)" }}>
          {label}
        </div>
        <div className="text-base font-bold" style={{ color: "var(--gold, #C89B3C)" }}>
          {date}
        </div>
      </div>
    </div>
  );
}

function GuidelineItem({ title, body }: { title: string; body: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid #e5e9ef" }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-gray-50"
        style={{ background: open ? "#f7f9fc" : "white" }}
      >
        <span className="font-semibold text-sm" style={{ color: "var(--navy, #0B2744)" }}>
          {title}
        </span>
        <span
          className="ml-4 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-transform"
          style={{
            background: open ? "var(--navy, #0B2744)" : "rgba(11,39,68,0.08)",
            color: open ? "white" : "var(--navy, #0B2744)",
            transform: open ? "rotate(45deg)" : "none",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
            <line x1="6.5" y1="1" x2="6.5" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="1" y1="6.5" x2="12" y2="6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </span>
      </button>
      {open && (
        <div
          className="px-5 pb-5 pt-1 text-sm leading-relaxed"
          style={{ color: "var(--text-secondary, #4a5568)", background: "#f7f9fc", borderTop: "1px solid #e5e9ef" }}
        >
          {body}
        </div>
      )}
    </div>
  );
}

export default function AbstractPage() {
  const { data: cms } = useGetSettings();

  const callForAbstractOpens = cms?.date_call_for_abstract_opens ?? "1 August 2026";
  const submissionDeadline = cms?.date_abstract_submission_deadline ?? "30 December 2026";
  const resultNotification = cms?.date_abstract_result_notification ?? "15 January 2027";

  const cmsRecord = cms as Record<string, string> | undefined;

  const conferenceTheme = cmsRecord?.abstract_conference_theme
    ?? "Advancing One Health: Bridging Research, Surveillance, and Control of Ticks and Tick-Borne Diseases in Southeast Asia.";

  const seatTopics = cmsRecord?.abstract_seat_topics
    ? cmsRecord.abstract_seat_topics.split("\n").map((s) => s.trim()).filter(Boolean)
    : SEAT_TOPICS_DEFAULT;

  const msptmTopics = cmsRecord?.abstract_msptm_topics
    ? cmsRecord.abstract_msptm_topics.split("\n").map((s) => s.trim()).filter(Boolean)
    : MSPTM_TOPICS_DEFAULT;

  const contactEmail = cmsRecord?.contact_email ?? "events@msptm.network";

  const guidelines = GUIDELINE_DEFAULTS.map((g) => ({
    title: g.title,
    body: (cms as Record<string, string> | undefined)?.[g.key] ?? g.defaultBody,
  }));

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="py-16 px-4" style={{ background: "var(--navy, #0B2744)" }}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "var(--gold, #C89B3C)" }}>
            3rd SEAT-MSPTM 2027
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Abstract</h1>
          <div className="mx-auto w-16 h-1 rounded-full" style={{ background: "var(--gold, #C89B3C)" }} />
          <p className="mt-5 text-sm md:text-base max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.72)" }}>
            Submit your research abstracts for the 3rd SEAT-MSPTM 2027. We welcome submissions across all tracks of the symposium and concurrent scientific conference.
          </p>
        </div>
      </section>

      <main className="flex-1 w-full">

        {/* Key Dates */}
        <section className="py-14 px-4" style={{ background: "white" }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold" style={{ color: "var(--navy, #0B2744)" }}>Key Dates</h2>
              <div className="mt-2 mx-auto w-12 h-0.5 rounded" style={{ background: "var(--gold, #C89B3C)" }} />
            </div>
            <div className="flex flex-wrap gap-5 justify-center">
              <KeyDateCard
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold,#C89B3C)" strokeWidth="1.8" aria-hidden="true">
                    <path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                }
                label="Call for Abstract Opens"
                date={callForAbstractOpens}
              />
              <KeyDateCard
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold,#C89B3C)" strokeWidth="1.8" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                }
                label="Abstract Submission Deadline"
                date={submissionDeadline}
              />
              <KeyDateCard
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold,#C89B3C)" strokeWidth="1.8" aria-hidden="true">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                }
                label="Abstract Result Notification"
                date={resultNotification}
              />
            </div>
          </div>
        </section>

        {/* Abstract Categories */}
        <section className="py-14 px-4" style={{ background: "#f7f9fc" }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold" style={{ color: "var(--navy, #0B2744)" }}>Abstract Categories</h2>
              <div className="mt-2 mx-auto w-12 h-0.5 rounded" style={{ background: "var(--gold, #C89B3C)" }} />
            </div>
            <p className="text-sm text-center mb-10 max-w-2xl mx-auto" style={{ color: "var(--text-muted, #6b7a8d)" }}>
              The conference theme is <span className="font-semibold" style={{ color: "var(--navy, #0B2744)" }}>"{conferenceTheme}"</span> Abstract submissions are accepted under the following tracks:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* SEAT card */}
              <div className="rounded-2xl p-7" style={{ background: "var(--navy, #0B2744)" }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(200,155,60,0.18)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold,#C89B3C)" strokeWidth="1.8" aria-hidden="true">
                      <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0 0h18" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-base text-white">SEAT Symposium</h3>
                </div>
                <ul className="space-y-2.5">
                  {seatTopics.map((t) => (
                    <li key={t} className="flex items-start gap-2.5 text-sm" style={{ color: "rgba(255,255,255,0.82)" }}>
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--gold, #C89B3C)" }} />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              {/* MSPTM card */}
              <div className="rounded-2xl p-7" style={{ background: "var(--teal, #0E6E74)" }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(200,155,60,0.18)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold,#C89B3C)" strokeWidth="1.8" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-base text-white leading-snug">
                    MSPTM Scientific Conference<br />
                    <span className="font-normal text-xs opacity-80">(Concurrent Sessions)</span>
                  </h3>
                </div>
                <ul className="space-y-2.5">
                  {msptmTopics.map((t) => (
                    <li key={t} className="flex items-start gap-2.5 text-sm" style={{ color: "rgba(255,255,255,0.82)" }}>
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--gold, #C89B3C)" }} />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Guidelines accordion */}
        <section className="py-14 px-4" style={{ background: "white" }}>
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-3">
              <h2 className="text-2xl font-bold" style={{ color: "var(--navy, #0B2744)" }}>
                Guidelines &amp; Terms and Conditions
              </h2>
              <div className="mt-1 mx-auto w-16 h-1 rounded-full" style={{ background: "var(--gold, #C89B3C)" }} />
              <p className="mt-3 text-xs" style={{ color: "var(--text-muted, #6b7a8d)" }}>
                for Abstract Submission
              </p>
            </div>
            <div className="mt-8 space-y-3">
              {guidelines.map((g) => (
                <GuidelineItem key={g.title} title={g.title} body={g.body} />
              ))}
            </div>
            <p className="mt-6 text-xs text-center italic" style={{ color: "var(--text-muted, #6b7a8d)" }}>
              Please read all guidelines carefully before submitting your abstract.
            </p>
          </div>
        </section>

        {/* Contact strip */}
        <section className="py-10 px-4" style={{ background: "#f7f9fc", borderTop: "1px solid #e5e9ef" }}>
          <div className="max-w-2xl mx-auto flex flex-col items-center gap-3 text-center">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "rgba(11,39,68,0.08)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--navy,#0B2744)" strokeWidth="1.8" aria-hidden="true">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-sm" style={{ color: "var(--text-muted, #6b7a8d)" }}>
              For any issues or enquiries, please contact the conference secretariat:
            </p>
            <a
              href={`mailto:${contactEmail}`}
              className="font-bold text-base hover:underline"
              style={{ color: "var(--navy, #0B2744)" }}
            >
              {contactEmail}
            </a>
            <div className="mt-4">
              <Link
                href="/portal/abstracts/new"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-semibold text-sm transition-opacity hover:opacity-90"
                style={{ background: "var(--navy, #0B2744)", color: "white" }}
              >
                Submit Your Abstract
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M2 7h10M8 3l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

      </main>

      <footer className="py-6 text-center text-xs border-t" style={{ color: "var(--text-muted, #6b7a8d)" }}>
        © 2027 SEAT-MSPTM. All rights reserved.
      </footer>
    </div>
  );
}
