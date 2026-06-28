import React from "react";
import PortalLayout from "@/components/PortalLayout";
import { useGetAbstract } from "@workspace/api-client-react";
import { useRoute, Link } from "wouter";
import { ArrowLeft, Loader2, FileText, Calendar, Download } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function AbstractDetails() {
  const [, params] = useRoute("/portal/abstracts/:id");
  const id = params?.id ? parseInt(params.id, 10) : 0;
  const { data: abstract, isLoading } = useGetAbstract(id);

  if (isLoading) {
    return (
      <PortalLayout title="Abstract Details">
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--primary)" }} />
        </div>
      </PortalLayout>
    );
  }

  if (!abstract) {
    return (
      <PortalLayout title="Abstract Details">
        <div className="text-center py-16">
          <p className="text-lg font-medium mb-4" style={{ color: "var(--text-muted)" }}>Abstract not found.</p>
          <Link href="/portal/abstracts">
            <button className="px-4 py-2 rounded-lg text-[13px] font-medium" style={{ border: "1px solid var(--border-color)", color: "var(--text-muted)" }}>
              Back to Abstracts
            </button>
          </Link>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout title="Abstract Details">
      <div className="max-w-3xl">
        <Link href="/portal/abstracts" className="flex items-center gap-1.5 text-[13px] mb-5 no-underline" style={{ color: "var(--text-muted)" }}>
          <ArrowLeft className="w-4 h-4" /> Back to Abstracts
        </Link>

        {/* Header card */}
        <div className="card p-6 mb-5">
          <div className="flex items-start justify-between gap-4 mb-3">
            <code className="text-[12px] font-mono bg-gray-100 px-2.5 py-1 rounded" style={{ color: "var(--text-secondary)" }}>
              {abstract.abstractCode}
            </code>
            <StatusBadge status={abstract.status} size="md" />
          </div>
          <h1 className="text-2xl font-sans font-bold mb-3 leading-snug" style={{ color: "var(--navy)" }}>
            {abstract.title}
          </h1>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-[13px]" style={{ color: "var(--text-muted)" }}>
              <FileText className="w-4 h-4" />
              <span className="capitalize">{abstract.abstractType} Presentation</span>
            </div>
            <div className="flex items-center gap-1.5 text-[13px]" style={{ color: "var(--text-muted)" }}>
              <Calendar className="w-4 h-4" />
              Submitted {new Date(abstract.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>
        </div>

        {/* Reviewer notes */}
        {abstract.reviewNotes && (
          <div className="rounded-xl p-5 mb-5" style={{ background: "var(--status-warning-bg)", border: "1px solid var(--border-color)" }}>
            <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--status-warning-text)" }}>
              Reviewer Notes
            </div>
            <p className="text-[14px] whitespace-pre-wrap" style={{ color: "var(--yellow-dk)" }}>
              {abstract.reviewNotes}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Abstract body */}
          <div className="card md:col-span-2 p-6">
            <h2 className="text-[13px] font-bold uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>Abstract</h2>
            <p className="text-[14px] whitespace-pre-wrap leading-relaxed" style={{ color: "var(--text)" }}>
              {abstract.body}
            </p>
          </div>

          {/* Metadata */}
          <div className="space-y-4">
            {abstract.keywords && (
              <div className="card p-4">
                <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Keywords</div>
                <div className="flex flex-wrap gap-1.5">
                  {abstract.keywords.split(",").map((kw, i) => (
                    <span key={i} className="text-[12px] px-2 py-0.5 rounded-full" style={{ background: "var(--primary-lt)", color: "var(--primary)" }}>
                      {kw.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {abstract.coAuthors && (
              <div className="card p-4">
                <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Co-Authors</div>
                <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>{abstract.coAuthors}</p>
              </div>
            )}
            {abstract.submitterName && (
              <div className="card p-4">
                <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Submitter</div>
                <p className="text-[13px] font-medium" style={{ color: "var(--text)" }}>{abstract.submitterName}</p>
              </div>
            )}
            {abstract.fileUrl && (
              <div className="card p-4">
                <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Abstract Document</div>
                <a
                  href={`/api/storage${abstract.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[13px] font-medium no-underline px-3 py-2 rounded-lg"
                  style={{ background: "var(--primary-lt)", color: "var(--primary)" }}
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
