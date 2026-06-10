import React from "react";
import PortalLayout from "@/components/PortalLayout";
import { Mail, Phone, MapPin, ExternalLink, Clock, HelpCircle } from "lucide-react";

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
    a: "Discounted rates have been arranged at Sunway Putra Hotel. Contact the hotel directly with the group code 'SATBDS2027' for the symposium rate.",
  },
  {
    q: "Will there be virtual attendance options?",
    a: "Selected keynote sessions will be streamed online. Details will be announced closer to the event date.",
  },
];

export default function Support() {
  const [open, setOpen] = React.useState<number | null>(null);

  return (
    <PortalLayout title="Support">
      <div className="max-w-2xl">
        <p className="text-sm mb-8" style={{ color: "#6c757d" }}>
          Need help? Find answers to common questions or get in touch with the organising committee.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5" style={{ border: "1px solid #e9ecef" }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: "#e6f4f5" }}>
              <Mail className="w-4.5 h-4.5" style={{ color: "#0E6E74", width: 18, height: 18 }} />
            </div>
            <div className="text-[13px] font-bold uppercase tracking-wider mb-1" style={{ color: "#6c757d" }}>Email</div>
            <a
              href="mailto:secretariat@satbds2027.org"
              className="text-[14px] font-medium no-underline"
              style={{ color: "#0E6E74" }}
            >
              secretariat@satbds2027.org
            </a>
            <div className="text-[12px] mt-1" style={{ color: "#adb5bd" }}>Usually responds within 2 business days</div>
          </div>

          <div className="bg-white rounded-xl p-5" style={{ border: "1px solid #e9ecef" }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: "rgba(200,155,60,0.12)" }}>
              <Clock className="w-4.5 h-4.5" style={{ color: "#C89B3C", width: 18, height: 18 }} />
            </div>
            <div className="text-[13px] font-bold uppercase tracking-wider mb-1" style={{ color: "#6c757d" }}>Office Hours</div>
            <div className="text-[14px] font-medium" style={{ color: "#212529" }}>Mon–Fri, 9am–5pm MYT</div>
            <div className="text-[12px] mt-1" style={{ color: "#adb5bd" }}>Malaysia Time (UTC+8)</div>
          </div>

          <div className="bg-white rounded-xl p-5" style={{ border: "1px solid #e9ecef" }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: "rgba(11,39,68,0.08)" }}>
              <MapPin className="w-4.5 h-4.5" style={{ color: "#0B2744", width: 18, height: 18 }} />
            </div>
            <div className="text-[13px] font-bold uppercase tracking-wider mb-1" style={{ color: "#6c757d" }}>Venue</div>
            <div className="text-[14px] font-medium" style={{ color: "#212529" }}>Sunway Putra Hotel</div>
            <div className="text-[12px] mt-1" style={{ color: "#adb5bd" }}>100, Jalan Putra, Kuala Lumpur</div>
          </div>

          <div className="bg-white rounded-xl p-5" style={{ border: "1px solid #e9ecef" }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: "#f8d7da" }}>
              <ExternalLink className="w-4.5 h-4.5" style={{ color: "#842029", width: 18, height: 18 }} />
            </div>
            <div className="text-[13px] font-bold uppercase tracking-wider mb-1" style={{ color: "#6c757d" }}>Organisers</div>
            <div className="text-[14px] font-medium" style={{ color: "#212529" }}>MSPTM & TIDREC@UM</div>
            <div className="text-[12px] mt-1" style={{ color: "#adb5bd" }}>Malaysian Society for Parasitology &amp; Tropical Medicine</div>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #e9ecef" }}>
          <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid #e9ecef" }}>
            <HelpCircle className="w-4 h-4" style={{ color: "#0E6E74" }} />
            <span className="text-[15px] font-semibold" style={{ color: "#212529" }}>
              Frequently Asked Questions
            </span>
          </div>
          <div>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ borderBottom: i < FAQS.length - 1 ? "1px solid #f1f3f5" : "none" }}>
                <button
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4"
                  onClick={() => setOpen(open === i ? null : i)}
                  style={{ background: "none" }}
                >
                  <span className="text-[14px] font-medium" style={{ color: "#212529" }}>
                    {faq.q}
                  </span>
                  <span className="text-lg flex-shrink-0" style={{ color: "#adb5bd" }}>
                    {open === i ? "−" : "+"}
                  </span>
                </button>
                {open === i && (
                  <div className="px-5 pb-4">
                    <p className="text-[13px] leading-relaxed" style={{ color: "#6c757d" }}>
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
