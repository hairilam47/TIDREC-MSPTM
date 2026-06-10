import React from "react";
import PortalLayout from "@/components/PortalLayout";
import { useGetAbstracts } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Plus, FileText, Loader2, ArrowRight } from "lucide-react";

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  submitted: { bg: "#e6f4f5", color: "#0E6E74", label: "Submitted" },
  under_review: { bg: "#fff3cd", color: "#856404", label: "Under Review" },
  accepted: { bg: "#d1e7dd", color: "#0a5c39", label: "Accepted" },
  rejected: { bg: "#f8d7da", color: "#842029", label: "Rejected" },
  revision_requested: { bg: "#fff3cd", color: "#856404", label: "Revision Needed" },
};

export default function Abstracts() {
  const { data: abstracts, isLoading } = useGetAbstracts();

  return (
    <PortalLayout title="My Abstracts">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm" style={{ color: "#6c757d" }}>
          Submit and track your abstract submissions for SATBDS 2027.
        </p>
        <Link href="/portal/abstracts/new">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold text-white"
            style={{ background: "#0E6E74" }}
          >
            <Plus className="w-4 h-4" /> Submit New Abstract
          </button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#0E6E74" }} />
        </div>
      ) : abstracts && abstracts.length > 0 ? (
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #e9ecef" }}>
          <table className="w-full">
            <thead style={{ background: "#f8f9fa" }}>
              <tr>
                {["Code", "Title", "Type", "Status", "Submitted", ""].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: "#6c757d", borderBottom: "1px solid #e9ecef" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {abstracts.map((a) => {
                const sc = STATUS_STYLES[a.status] ?? STATUS_STYLES.submitted;
                return (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3.5" style={{ borderBottom: "1px solid #f1f3f5" }}>
                      <code className="text-[11px] font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                        {a.abstractCode}
                      </code>
                    </td>
                    <td className="px-4 py-3.5 max-w-xs" style={{ borderBottom: "1px solid #f1f3f5" }}>
                      <div className="text-[14px] font-medium leading-snug" style={{ color: "#212529" }}>
                        {a.title.length > 50 ? a.title.slice(0, 50) + "…" : a.title}
                      </div>
                      {a.reviewNotes && (
                        <div className="text-[11px] mt-0.5" style={{ color: "#856404" }}>
                          Reviewer notes available
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 capitalize text-[13px]" style={{ color: "#6c757d", borderBottom: "1px solid #f1f3f5" }}>
                      {a.abstractType}
                    </td>
                    <td className="px-4 py-3.5" style={{ borderBottom: "1px solid #f1f3f5" }}>
                      <span
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: sc.bg, color: sc.color }}
                      >
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[13px]" style={{ color: "#6c757d", borderBottom: "1px solid #f1f3f5" }}>
                      {new Date(a.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3.5" style={{ borderBottom: "1px solid #f1f3f5" }}>
                      <Link
                        href={`/portal/abstracts/${a.id}`}
                        className="flex items-center gap-1 text-[13px] font-medium no-underline"
                        style={{ color: "#0E6E74" }}
                      >
                        View <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          className="bg-white rounded-xl p-16 text-center"
          style={{ border: "1px dashed #dee2e6" }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "#e6f4f5" }}
          >
            <FileText className="w-8 h-8" style={{ color: "#0E6E74" }} />
          </div>
          <h3 className="text-xl font-serif font-bold mb-2" style={{ color: "#212529" }}>
            No Abstracts Yet
          </h3>
          <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: "#6c757d" }}>
            Share your research with the global tick and tick-borne diseases community.
          </p>
          <Link href="/portal/abstracts/new">
            <button
              className="px-5 py-2.5 rounded-lg text-[14px] font-semibold text-white"
              style={{ background: "#0E6E74" }}
            >
              Submit Your First Abstract
            </button>
          </Link>
        </div>
      )}
    </PortalLayout>
  );
}
