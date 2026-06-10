import React from "react";
import AdminLayout from "@/components/AdminLayout";
import { useGetAbstracts, useUpdateAbstract } from "@workspace/api-client-react";
import { Search, ChevronDown, CheckCircle, XCircle, Edit3, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  submitted: { bg: "#e6f4f5", color: "#0E6E74", label: "Submitted" },
  under_review: { bg: "#fff3cd", color: "#856404", label: "Under Review" },
  accepted: { bg: "#d1e7dd", color: "#0a5c39", label: "Accepted" },
  rejected: { bg: "#f8d7da", color: "#842029", label: "Rejected" },
  revision_requested: { bg: "#fff3cd", color: "#856404", label: "Revision" },
};

export default function AdminAbstracts() {
  const { data: abstracts, refetch } = useGetAbstracts();
  const updateMutation = useUpdateAbstract();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [reviewNote, setReviewNote] = React.useState<Record<number, string>>({});
  const [reviewerName, setReviewerName] = React.useState<Record<number, string>>({});
  const [expanded, setExpanded] = React.useState<number | null>(null);

  const filtered = (abstracts ?? []).filter((a) => {
    const q = search.toLowerCase();
    const matchSearch = !q || a.title.toLowerCase().includes(q) || (a.submitterName ?? "").toLowerCase().includes(q) || (a.abstractCode ?? "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    const matchType = typeFilter === "all" || a.abstractType === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const handleAction = (id: number, status: "accepted" | "rejected" | "revision_requested" | "under_review") => {
    updateMutation.mutate(
      { id, data: { status, reviewNotes: reviewNote[id] || undefined, reviewedBy: reviewerName[id] || undefined } },
      {
        onSuccess: () => {
          refetch();
          setReviewNote((p) => { const n = { ...p }; delete n[id]; return n; });
          setReviewerName((p) => { const n = { ...p }; delete n[id]; return n; });
          toast({ title: `Abstract ${status.replace(/_/g, " ")}` });
        },
        onError: () => toast({ title: "Update failed", variant: "destructive" }),
      }
    );
  };

  const assignReviewer = (id: number) => {
    const name = reviewerName[id];
    if (!name?.trim()) return;
    updateMutation.mutate(
      { id, data: { reviewedBy: name } },
      {
        onSuccess: () => { refetch(); toast({ title: `Reviewer assigned: ${name}` }); },
        onError: () => toast({ title: "Update failed", variant: "destructive" }),
      }
    );
  };

  const counts = {
    total: abstracts?.length ?? 0,
    pending: abstracts?.filter((a) => a.status === "submitted" || a.status === "under_review").length ?? 0,
    accepted: abstracts?.filter((a) => a.status === "accepted").length ?? 0,
    rejected: abstracts?.filter((a) => a.status === "rejected").length ?? 0,
  };

  return (
    <AdminLayout title="Abstracts Review">
      {/* Summary chips */}
      <div className="flex gap-3 flex-wrap mb-5">
        {[
          { label: "Total", value: counts.total, color: "#0B2744" },
          { label: "Pending Review", value: counts.pending, color: "#856404", bg: "#fff3cd" },
          { label: "Accepted", value: counts.accepted, color: "#0a5c39", bg: "#d1e7dd" },
          { label: "Rejected", value: counts.rejected, color: "#842029", bg: "#f8d7da" },
        ].map((c) => (
          <div key={c.label} className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: c.bg ?? "#e9ecef", border: "1px solid rgba(0,0,0,0.06)" }}>
            <span className="text-[20px] font-bold" style={{ color: c.color }}>{c.value}</span>
            <span className="text-[12px] font-medium" style={{ color: c.color }}>{c.label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#adb5bd" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title, submitter, or code…" className="w-full pl-9 pr-3 py-2.5 rounded-lg text-[13px] outline-none" style={{ border: "1px solid #dee2e6" }} />
        </div>
        <div className="relative">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="appearance-none pl-3 pr-8 py-2.5 rounded-lg text-[13px] outline-none" style={{ border: "1px solid #dee2e6", background: "#fff" }}>
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="revision_requested">Revision Requested</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: "#6c757d" }} />
        </div>
        <div className="relative">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="appearance-none pl-3 pr-8 py-2.5 rounded-lg text-[13px] outline-none" style={{ border: "1px solid #dee2e6", background: "#fff" }}>
            <option value="all">All Types</option>
            <option value="oral">Oral</option>
            <option value="poster">Poster</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: "#6c757d" }} />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-[14px]" style={{ color: "#adb5bd" }}>No abstracts found</div>
        ) : filtered.map((a) => {
          const sc = STATUS_STYLES[a.status];
          const isExpanded = expanded === a.id;
          return (
            <div key={a.id} className="bg-white rounded-xl" style={{ border: "1px solid #e9ecef" }}>
              <div className="flex items-start justify-between gap-4 p-5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <code className="text-[11px] font-mono bg-gray-100 px-2 py-0.5 rounded" style={{ color: "#495057" }}>{a.abstractCode}</code>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full capitalize" style={{ background: "#e9ecef", color: "#495057" }}>{a.abstractType}</span>
                  </div>
                  <div className="text-[14px] font-semibold leading-snug mb-1" style={{ color: "#0B2744" }}>{a.title}</div>
                  <div className="text-[12px]" style={{ color: "#adb5bd" }}>
                    {a.submitterName} · Submitted {new Date(a.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    {a.keywords && ` · ${a.keywords}`}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => setLocation(`/portal/abstracts/${a.id}`)} className="p-2 rounded-lg" style={{ border: "1px solid #e9ecef", color: "#6c757d" }} title="View full abstract">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : a.id)}
                    className="px-3 py-1.5 rounded-lg text-[12px] font-medium"
                    style={{ border: "1px solid #e9ecef", color: "#6c757d" }}
                  >
                    {isExpanded ? "Collapse" : "Review"}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="px-5 pb-5" style={{ borderTop: "1px solid #f1f3f5" }}>
                  {/* Meta row */}
                  <div className="grid grid-cols-2 gap-3 mt-4 mb-3">
                    {a.keywords && (
                      <div className="rounded-lg p-3" style={{ background: "#f8f9fa" }}>
                        <div className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: "#adb5bd" }}>Keywords</div>
                        <div className="text-[12px]" style={{ color: "#495057" }}>{a.keywords}</div>
                      </div>
                    )}
                    {a.coAuthors && (
                      <div className="rounded-lg p-3" style={{ background: "#f8f9fa" }}>
                        <div className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: "#adb5bd" }}>Co-Authors</div>
                        <div className="text-[12px]" style={{ color: "#495057" }}>{a.coAuthors}</div>
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg p-4 mb-4 text-[13px] leading-relaxed whitespace-pre-wrap" style={{ background: "#f8f9fa", color: "#495057" }}>
                    {a.body}
                  </div>

                  {/* Reviewer assignment */}
                  <div className="mb-3">
                    <label className="block text-[11px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#6c757d" }}>
                      Assign Reviewer
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={a.reviewedBy ? `Current: ${a.reviewedBy}` : "Enter reviewer name…"}
                        value={reviewerName[a.id] ?? ""}
                        onChange={(e) => setReviewerName((p) => ({ ...p, [a.id]: e.target.value }))}
                        className="flex-1 px-3 py-2 rounded-lg text-[13px] outline-none"
                        style={{ border: "1px solid #dee2e6" }}
                      />
                      <button
                        onClick={() => assignReviewer(a.id)}
                        className="px-3 py-2 rounded-lg text-[12px] font-semibold"
                        style={{ background: "#0B2744", color: "#fff" }}
                      >
                        Assign
                      </button>
                    </div>
                    {a.reviewedBy && (
                      <div className="text-[11px] mt-1" style={{ color: "#6c757d" }}>
                        Currently assigned to: <span className="font-semibold" style={{ color: "#0B2744" }}>{a.reviewedBy}</span>
                      </div>
                    )}
                  </div>

                  {a.reviewNotes && (
                    <div className="rounded-lg p-3 mb-3 text-[12px]" style={{ background: "#fff3cd", color: "#664d03" }}>
                      <span className="font-semibold">Review note:</span> {a.reviewNotes}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Add review note (optional)"
                      value={reviewNote[a.id] ?? ""}
                      onChange={(e) => setReviewNote((p) => ({ ...p, [a.id]: e.target.value }))}
                      className="flex-1 px-3 py-2 rounded-lg text-[13px] outline-none"
                      style={{ border: "1px solid #dee2e6" }}
                    />
                    <div className="flex gap-2 flex-wrap">
                      {a.status !== "under_review" && (
                        <button onClick={() => handleAction(a.id, "under_review")} className="px-3 py-2 rounded-lg text-[12px] font-semibold" style={{ background: "#e6f4f5", color: "#0E6E74" }}>Review</button>
                      )}
                      <button onClick={() => handleAction(a.id, "accepted")} className="flex items-center gap-1 px-3 py-2 rounded-lg text-[12px] font-semibold" style={{ background: "#d1e7dd", color: "#0a5c39" }}>
                        <CheckCircle className="w-3.5 h-3.5" /> Accept
                      </button>
                      <button onClick={() => handleAction(a.id, "revision_requested")} className="flex items-center gap-1 px-3 py-2 rounded-lg text-[12px] font-semibold" style={{ background: "#fff3cd", color: "#856404" }}>
                        <Edit3 className="w-3.5 h-3.5" /> Revise
                      </button>
                      <button onClick={() => handleAction(a.id, "rejected")} className="flex items-center gap-1 px-3 py-2 rounded-lg text-[12px] font-semibold" style={{ background: "#f8d7da", color: "#842029" }}>
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
}
