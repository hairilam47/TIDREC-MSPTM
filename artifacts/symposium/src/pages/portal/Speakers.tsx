import React from "react";
import PortalLayout from "@/components/PortalLayout";
import { useGetSpeakers } from "@workspace/api-client-react";
import { Loader2 } from "lucide-react";

export default function Speakers() {
  const { data: speakers, isLoading } = useGetSpeakers();

  return (
    <PortalLayout title="Invited Speakers">
      <p className="text-sm mb-6" style={{ color: "#6c757d" }}>
        Distinguished experts presenting at SATBDS 2027.
      </p>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#0E6E74" }} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {speakers?.map((speaker) => (
            <div
              key={speaker.id}
              className="bg-white rounded-xl overflow-hidden transition-all hover:shadow-md"
              style={{ border: "1px solid #e9ecef", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
            >
              {/* Photo area */}
              <div
                className="h-[180px] flex items-center justify-center"
                style={{
                  background: speaker.photoUrl
                    ? undefined
                    : "linear-gradient(135deg, #e6f4f5, #f8f9fa)",
                }}
              >
                {speaker.photoUrl ? (
                  <img src={speaker.photoUrl} alt={speaker.name} className="w-full h-full object-cover" />
                ) : (
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center font-serif text-3xl font-bold"
                    style={{ background: "#0E6E74", color: "#fff" }}
                  >
                    {speaker.initials || speaker.name.slice(0, 2)}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="text-[15px] font-serif font-bold mb-0.5" style={{ color: "#212529" }}>
                  {speaker.name}
                </h3>
                <div className="text-[12px] mb-3" style={{ color: "#6c757d" }}>
                  {speaker.institution && <span>{speaker.institution} · </span>}
                  {speaker.country}
                </div>
                <div className="rounded-lg px-3 py-2" style={{ background: "#e6f4f5" }}>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#0E6E74" }}>
                    Topic
                  </div>
                  <div className="text-[13px]" style={{ color: "#212529" }}>{speaker.topic}</div>
                </div>
                {speaker.bio && (
                  <p className="text-[12px] mt-3 line-clamp-3" style={{ color: "#6c757d" }}>
                    {speaker.bio}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </PortalLayout>
  );
}
