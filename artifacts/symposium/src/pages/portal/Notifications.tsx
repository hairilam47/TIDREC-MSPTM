import React from "react";
import PortalLayout from "@/components/PortalLayout";
import { useGetAnnouncements } from "@workspace/api-client-react";
import { Loader2, Bell, AlertCircle, Info } from "lucide-react";

export default function Notifications() {
  const { data: announcements, isLoading } = useGetAnnouncements();

  const sorted = React.useMemo(
    () => [...(announcements ?? [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [announcements],
  );

  return (
    <PortalLayout title="Notifications">
      <p className="text-sm mb-6" style={{ color: "#6c757d" }}>
        Official announcements and updates from the SATBDS 2027 organising committee.
      </p>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#0E6E74" }} />
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="w-10 h-10 mx-auto mb-3" style={{ color: "#dee2e6" }} />
          <p className="text-[14px]" style={{ color: "#6c757d" }}>No announcements yet.</p>
        </div>
      ) : (
        <div className="space-y-3 max-w-2xl">
          {sorted.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-xl p-5 flex items-start gap-4"
              style={{
                border: a.important ? "1px solid #a3d4d6" : "1px solid #e9ecef",
                borderLeft: `4px solid ${a.important ? "#0E6E74" : "#dee2e6"}`,
              }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: a.important ? "#e6f4f5" : "#f8f9fa" }}
              >
                {a.important ? (
                  <AlertCircle className="w-4.5 h-4.5" style={{ color: "#0E6E74", width: 18, height: 18 }} />
                ) : (
                  <Info className="w-4.5 h-4.5" style={{ color: "#adb5bd", width: 18, height: 18 }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4 mb-1">
                  <h3 className="text-[14px] font-semibold" style={{ color: "#212529" }}>
                    {a.title}
                    {a.important && (
                      <span
                        className="ml-2 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                        style={{ background: "#0E6E74", color: "#fff" }}
                      >
                        Important
                      </span>
                    )}
                  </h3>
                  <div className="text-[12px] flex-shrink-0" style={{ color: "#adb5bd" }}>
                    {new Date(a.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
                <p className="text-[13px] leading-relaxed" style={{ color: "#495057" }}>
                  {a.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </PortalLayout>
  );
}
