import React from "react";
import PortalLayout from "@/components/PortalLayout";
import { Mail, MapPin, ExternalLink, Clock, HelpCircle } from "lucide-react";

const FAQS = [
  {
    q: "When is the early bird registration deadline?",
    a: "The early bird registration discount closes on 1 March 2027. Register before this date to enjoy reduced rates.",
  },
  {
    q: "Can I modify my abstract after submission?",
    a: "Abstracts can be modified until the submission deadline of 15 January 2027. After this date, edits require contacting the organising committee.",
  },
  {
    q: "How do I pay my registration fee?",
    a: "Payment instructions are sent to your registered email upon registration. You can also find your invoice in the Invoices section of this portal.",
  },
  {
    q: "Is accommodation provided?",
    a: "Discounted rates have been arranged at Sunway Putra Hotel. Contact the hotel directly with the group code 'SEAT-MSPTM2027' for the symposium rate.",
  },
  {
    q: "Will there be virtual attendance options?",
    a: "Selected keynote sessions will be streamed online. Details will be announced closer to the event date.",
  },
];

const CONTACT_TILES = [
  {
    icon: Mail,
    iconBg: "var(--primary-lt)",
    iconColor: "var(--primary)",
    label: "Email",
    value: <a href="mailto:secretariat@seat-msptm2027.org" style={{ fontSize: 14, fontWeight: 500, color: "var(--primary)", textDecoration: "none" }}>secretariat@seat-msptm2027.org</a>,
    sub: "Usually responds within 2 business days",
  },
  {
    icon: Clock,
    iconBg: "var(--gold-lt)",
    iconColor: "var(--gold)",
    label: "Office Hours",
    value: <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>Mon–Fri, 9am–5pm MYT</div>,
    sub: "Malaysia Time (UTC+8)",
  },
  {
    icon: MapPin,
    iconBg: "var(--navy-lt)",
    iconColor: "var(--navy)",
    label: "Venue",
    value: <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>Sunway Putra Hotel</div>,
    sub: "100, Jalan Putra, Kuala Lumpur",
  },
  {
    icon: ExternalLink,
    iconBg: "var(--red-lt)",
    iconColor: "var(--red)",
    label: "Organisers",
    value: <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>MSPTM &amp; TIDREC</div>,
    sub: "Malaysian Society for Parasitology & Tropical Medicine",
  },
];

export default function Support() {
  const [open, setOpen] = React.useState<number | null>(null);

  return (
    <PortalLayout title="Support">
      <div>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 32 }}>
          Need help? Find answers to common questions or get in touch with the organising committee.
        </p>

        {/* Contact tiles */}
        <div className="row col-2" style={{ marginBottom: 24 }}>
          {CONTACT_TILES.map(({ icon: Icon, iconBg, iconColor, label, value, sub }) => (
            <div key={label} className="card">
              <div className="card-body">
                <div style={{ width: 34, height: 34, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", background: iconBg, marginBottom: 12 }}>
                  <Icon style={{ width: 18, height: 18, color: iconColor }} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)", marginBottom: 4 }}>{label}</div>
                {value}
                <div style={{ fontSize: 12, marginTop: 4, color: "var(--text-disabled)" }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQs */}
        <div className="card" style={{ overflow: "hidden" }}>
          <div className="card-header">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <HelpCircle style={{ width: 16, height: 16, color: "var(--primary)" }} />
              <div className="card-title">Frequently Asked Questions</div>
            </div>
          </div>
          <div>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ borderBottom: i < FAQS.length - 1 ? "1px solid var(--border-color-light)" : "none" }}>
                <button
                  style={{ width: "100%", textAlign: "left", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>{faq.q}</span>
                  <span style={{ fontSize: 18, flexShrink: 0, color: "var(--text-disabled)", lineHeight: 1 }}>
                    {open === i ? "−" : "+"}
                  </span>
                </button>
                {open === i && (
                  <div style={{ padding: "0 16px 14px" }}>
                    <p style={{ fontSize: 13, lineHeight: 1.5, color: "var(--text-muted)", margin: 0 }}>
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
