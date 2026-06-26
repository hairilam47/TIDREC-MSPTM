import { SiteHeader } from "@/components/SiteHeader";
import { Target, CheckCircle2 } from "lucide-react";

const OBJECTIVES = [
  "Promote the exchange of current research and scientific advances in parasitology, tropical medicine, vector-borne diseases, and related fields.",
  "Strengthen regional and international collaborations among researchers, healthcare professionals, and public health practitioners.",
  "Support capacity building and networking among students, early-career researchers, and professionals.",
  "Encourage interdisciplinary discussions on infectious, parasitic, zoonotic, and vector-borne diseases.",
  "Enhance awareness of emerging and re-emerging diseases of public and veterinary health importance.",
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SiteHeader />
      {/* Hero */}
      <section className="py-14 px-4" style={{ background: "#0B2744" }}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-wide text-white">
            About{" "}
            <span style={{ color: "#C89B3C" }}>SEAT-MSPTM 2027</span>
          </h1>
          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="w-12 h-px" style={{ background: "#C89B3C" }} />
            <div className="w-2 h-2 rounded-full" style={{ background: "#0E6E74" }} />
            <div className="w-12 h-px" style={{ background: "#C89B3C" }} />
          </div>
        </div>
      </section>
      {/* Content */}
      <main className="flex-1 px-4 py-16">
        <div className="max-w-3xl mx-auto">

          {/* Body paragraphs */}
          <div className="space-y-5 text-base leading-relaxed text-gray-700 mb-12">
            <p className="text-justify">
              The{" "}
              <strong className="text-gray-900 font-semibold">
                3rd Southeast Asia Ticks and Tick-borne Diseases Symposium (SEAT 2027)
              </strong>{" "}
              will be held in conjunction with the{" "}
              <strong className="text-gray-900 font-semibold">
                63rd Annual Scientific Conference of the Malaysian Society of Parasitology and Tropical Medicine (MSPTM)
              </strong>{" "}
              in Kuala Lumpur, Malaysia. This joint event provides a platform for researchers, healthcare professionals, veterinarians, public health practitioners, students, and industry partners to exchange knowledge and discuss the latest advances in parasitology, tropical medicine, vector-borne diseases, and related disciplines.
            </p>
            <p className="text-justify">
              MSPTM has long served as a leading forum for scientific discussion and collaboration in parasitology and tropical medicine, while SEAT highlights current research and emerging challenges related to ticks and tick-borne diseases in Southeast Asia. Together, these meetings bring together experts from diverse fields to share research findings, foster collaborations, and promote innovation in disease surveillance, diagnosis, prevention, and control.
            </p>
            <p className="text-justify">
              Building on the success of previous meetings, the inaugural Southeast Asia Ticks and Tick-borne Diseases Symposium was held in Cambodia in 2023, followed by the second symposium in Singapore in 2025. SEAT-MSPTM 2027 continues this tradition of strengthening regional networks and advancing scientific research across Southeast Asia and beyond.
            </p>
          </div>

          {/* Objectives */}
          <div className="mb-12">
            {/* Icon + heading */}
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(14,110,116,0.12)" }}
              >
                <Target className="w-6 h-6" style={{ color: "#0E6E74" }} />
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: "#0B2744" }}>
                  Objectives
                </h2>
                <div className="mt-1 h-0.5 w-10 rounded-full" style={{ background: "#C89B3C" }} />
              </div>
            </div>

            {/* Bullet list */}
            <ul className="space-y-4">
              {OBJECTIVES.map((obj, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2
                    className="w-5 h-5 mt-0.5 flex-shrink-0"
                    style={{ color: "#0E6E74" }}
                  />
                  <span className="text-base text-gray-700 leading-relaxed text-justify">{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Closing */}
          <p className="text-base text-gray-700 leading-relaxed text-justify">
            Join us at SEAT-MSPTM 2027 as we foster scientific collaboration, share innovative research, and address current and emerging health challenges in Southeast Asia.
          </p>

        </div>
      </main>
    </div>
  );
}
