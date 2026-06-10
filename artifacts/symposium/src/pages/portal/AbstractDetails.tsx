import React from "react";
import PortalLayout from "@/components/PortalLayout";
import { useGetAbstract } from "@workspace/api-client-react";
import { useRoute, Link } from "wouter";
import { ArrowLeft, Loader2, FileText, Calendar, Download } from "lucide-react";

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  submitted: { bg: "#e6f4f5", color: "#0E6E74", label: "Submitted" },
  under_review: { bg: "#fff3cd", color: "#856404", label: "Under Review" },
  accepted: { bg: "#d1e7dd", color: "#0a5c39", label: "Accepted" },
  rejected: { bg: "#f8d7da", color: "#842029", label: "Rejected" },
  revision_requested: { bg: "#fff3cd", color: "#856404", label: "Revision Needed" },
};

export default function AbstractDetails() {
  const [, params] = useRoute("/portal/abstracts/:id");
  const id = params?.id ? parseInt(params.id, 10) : 0;
  const { data: abstract, isLoading } = useGetAbstract(id);

  if (isLoading) {
    return (
      <PortalLayout title="Abstract Details">
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#0E6E74" }} />
        </div>
      </PortalLayout>
    );
  }

  if (!abstract) {
    return (
      <PortalLayout title="Abstract Details">
        <div className="text-center py-16">
          <p className="text-lg font-medium mb-4" style={{ color: "#6c757d" }}>Abstract not found.</p>
          <Link href="/portal/abstracts">
            <button className="px-4 py-2 rounded-lg text-[13px] font-medium" style={{ border: "1px solid #e9ecef", color: "#6c757d" }}>
              Back to Abstracts
            </button>
          </Link>
        </div>
      </PortalLayout>
    );
  }

  const sc = STATUS_STYLES[abstract.status] ?? STATUS_STYLES.submitted;

  return (
    <PortalLayout title="Abstract Details">
      <div className="max-w-3xl">
        <Link href="/portal/abstracts" className="flex items-center gap-1.5 text-[13px] mb-5 no-underline" style={{ color: "#6c757d" }}>
          <ArrowLeft className="w-4 h-4" /> Back to Abstracts
        </Link>

        {/* Header card */}
        <div className="bg-white rounded-xl p-6 mb-5" style={{ border: "1px solid #e9ecef" }}>
          <div className="flex items-start justify-between gap-4 mb-3">
            <code className="text-[12px] font-mono bg-gray-100 px-2.5 py-1 rounded" style={{ color: "#495057" }}>
              {abstract.abstractCode}
            </code>
            <span
              className="text-[12px] font-semibold px-3 py-1 rounded-full flex-shrink-0"
              style={{ background: sc.bg, color: sc.color }}
            >
              {sc.label}
            </span>
          </div>
          <h1 className="text-2xl font-serif font-bold mb-3 leading-snug" style={{ color: "#0B2744" }}>
            {abstract.title}
          </h1>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-[13px]" style={{ color: "#6c757d" }}>
              <FileText className="w-4 h-4" />
              <span className="capitalize">{abstract.abstractType} Presentation</span>
            </div>
            <div className="flex items-center gap-1.5 text-[13px]" style={{ color: "#6c757d" }}>
              <Calendar className="w-4 h-4" />
              Submitted {new Date(abstract.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>
        </div>

        {/* Reviewer notes */}
        {abstract.reviewNotes && (
          <div className="rounded-xl p-5 mb-5" style={{ background: "#fff3cd", border: "1px solid #ffe69c" }}>
            <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "#856404" }}>
              Reviewer Notes
            </div>
            <p className="text-[14px] whitespace-pre-wrap" style={{ color: "#664d03" }}>
              {abstract.reviewNotes}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Abstract body */}
          <div className="md:col-span-2 bg-white rounded-xl p-6" style={{ border: "1px solid #e9ecef" }}>
            <h2 className="text-[13px] font-bold uppercase tracking-wider mb-4" style={{ color: "#6c757d" }}>Abstract</h2>
            <p className="text-[14px] whitespace-pre-wrap leading-relaxed" style={{ color: "#212529" }}>
              {abstract.body}
            </p>
          </div>

          {/* Metadata */}
          <div className="space-y-4">
            {abstract.keywords && (
              <div className="bg-white rounded-xl p-4" style={{ border: "1px solid #e9ecef" }}>
                <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "#6c757d" }}>Keywords</div>
                <div className="flex flex-wrap gap-1.5">
                  {abstract.keywords.split(",").map((kw, i) => (
                    <span key={i} className="text-[12px] px-2 py-0.5 rounded-full" style={{ background: "#e6f4f5", color: "#0E6E74" }}>
                      {kw.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {abstract.coAuthors && (
              <div className="bg-white rounded-xl p-4" style={{ border: "1px solid #e9ecef" }}>
                <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "#6c757d" }}>Co-Authors</div>
                <p className="text-[13px]" style={{ color: "#495057" }}>{abstract.coAuthors}</p>
              </div>
            )}
            {abstract.submitterName && (
              <div className="bg-white rounded-xl p-4" style={{ border: "1px solid #e9ecef" }}>
                <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "#6c757d" }}>Submitter</div>
                <p className="text-[13px] font-medium" style={{ color: "#212529" }}>{abstract.submitterName}</p>
              </div>
            )}
            {abstract.fileUrl && (
              <div className="bg-white rounded-xl p-4" style={{ border: "1px solid #e9ecef" }}>
                <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "#6c757d" }}>Abstract Document</div>
                <a
                  href={`/api/storage${abstract.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[13px] font-medium no-underline px-3 py-2 rounded-lg"
                  style={{ background: "#e6f4f5", color: "#0E6E74" }}
                >
                  <Download className="w-4 h-4" />
                  Download Document
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
