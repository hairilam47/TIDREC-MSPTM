import React from "react";
import AdminLayout from "@/components/AdminLayout";
import { useGetAbstracts, useUpdateAbstract, useGetAbstractHistory } from "@workspace/api-client-react";
import { Search, ChevronDown, CheckCircle, XCircle, Edit3, Eye, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const STATUS_LABEL: Record<string, string> = {
  submitted: "Submitted",
  under_review: "Under Review",
  accepted: "Accepted",
  rejected: "Rejected",
  revision_requested: "Revision Requested",
};

const STATUS_COLOR: Record<string, string> = {
  submitted:          "var(--primary)",
  under_review:       "var(--status-warning-text)",
  accepted:           "var(--status-success-text)",
  rejected:           "var(--status-danger-text)",
  revision_requested: "var(--status-warning-text)",
};

function AbstractHistorySection({ abstractId }: { abstractId: number }) {
  const { data: history, isLoading } = useGetAbstractHistory(abstractId);
  if (isLoading) return <div className="text-[12px] py-2" style={{ color: "var(--text-disabled)" }}>Loading history…</div>;
  if (!history || history.length === 0) return <div className="text-[12px] py-2" style={{ color: "var(--text-disabled)" }}>No status changes recorded yet.</div>;
  return (
    <div className="space-y-2">
      {[...history].reverse().map((h) => (
        <div key={h.id} className="flex items-start gap-3 text-[12px]">
          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${STATUS_COLOR[h.toStatus] ?? "var(--text-muted)"}22` }}>
            <Clock className="w-3 h-3" style={{ color: STATUS_COLOR[h.toStatus] ?? "var(--text-muted)" }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {h.fromStatus && (
                <><span style={{ color: "var(--text-muted)" }}>{STATUS_LABEL[h.fromStatus] ?? h.fromStatus}</span><span style={{ color: "var(--text-disabled)" }}>→</span></>
              )}
              <span className="font-semibold" style={{ color: STATUS_COLOR[h.toStatus] ?? "var(--text)" }}>{STATUS_LABEL[h.toStatus] ?? h.toStatus}</span>
              {h.changedBy && <span style={{ color: "var(--text-disabled)" }}>by {h.changedBy}</span>}
            </div>
            {h.notes && <div style={{ color: "var(--text-muted)" }} className="mt-0.5 truncate">{h.notes}</div>}
            <div style={{ color: "var(--text-disabled)" }}>{new Date(h.createdAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  submitted:          { bg: "var(--primary-lt)",        color: "var(--primary)",              label: "Submitted" },
  under_review:       { bg: "var(--status-warning-bg)", color: "var(--status-warning-text)",  label: "Under Review" },
  accepted:           { bg: "var(--status-success-bg)", color: "var(--status-success-text)",  label: "Accepted" },
  rejected:           { bg: "var(--status-danger-bg)",  color: "var(--status-danger-text)",   label: "Rejected" },
  revision_requested: { bg: "var(--status-warning-bg)", color: "var(--status-warning-text)",  label: "Revision" },
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
          { label: "Total", value: counts.total, color: "var(--text)", bg: "var(--border-color)" },
          { label: "Pending Review", value: counts.pending, color: "var(--status-warning-text)", bg: "var(--status-warning-bg)" },
          { label: "Accepted",      value: counts.accepted, color: "var(--status-success-text)", bg: "var(--status-success-bg)" },
          { label: "Rejected",      value: counts.rejected, color: "var(--status-danger-text)",  bg: "var(--status-danger-bg)" },
        ].map((c) => (
          <div key={c.label} className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: c.bg, border: "1px solid rgba(0,0,0,0.06)" }}>
            <span className="text-[20px] font-bold" style={{ color: c.color }}>{c.value}</span>
            <span className="text-[12px] font-medium" style={{ color: c.color }}>{c.label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-disabled)" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title, submitter, or code…" className="w-full pl-9 pr-3 py-2.5 rounded-lg text-[13px] outline-none" style={{ border: "1px solid var(--border-color)" }} />
        </div>
        <div className="relative">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="appearance-none pl-3 pr-8 py-2.5 rounded-lg text-[13px] outline-none" style={{ border: "1px solid var(--border-color)", background: "var(--bg-surface)" }}>
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="revision_requested">Revision Requested</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: "var(--text-muted)" }} />
        </div>
        <div className="relative">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="appearance-none pl-3 pr-8 py-2.5 rounded-lg text-[13px] outline-none" style={{ border: "1px solid var(--border-color)", background: "var(--bg-surface)" }}>
            <option value="all">All Types</option>
            <option value="oral">Oral</option>
            <option value="poster">Poster</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: "var(--text-muted)" }} />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-[14px]" style={{ color: "var(--text-disabled)" }}>No abstracts found</div>
        ) : filtered.map((a) => {
          const sc = STATUS_STYLES[a.status];
          const isExpanded = expanded === a.id;
          return (
            <div key={a.id} className="card">
              <div className="flex items-start justify-between gap-4 p-5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <code className="text-[11px] font-mono bg-gray-100 px-2 py-0.5 rounded" style={{ color: "var(--text-secondary)" }}>{a.abstractCode}</code>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full capitalize" style={{ background: "var(--border-color)", color: "var(--text-secondary)" }}>{a.abstractType}</span>
                  </div>
                  <div className="text-[14px] font-semibold leading-snug mb-1" style={{ color: "var(--text)" }}>{a.title}</div>
                  <div className="text-[12px]" style={{ color: "var(--text-disabled)" }}>
                    {a.submitterName} · Submitted {new Date(a.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    {a.keywords && ` · ${a.keywords}`}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => setLocation(`/portal/abstracts/${a.id}`)} className="p-2 rounded-lg" style={{ border: "1px solid var(--border-color)", color: "var(--text-muted)" }} title="View full abstract">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : a.id)}
                    className="px-3 py-1.5 rounded-lg text-[12px] font-medium"
                    style={{ border: "1px solid var(--border-color)", color: "var(--text-muted)" }}
                  >
                    {isExpanded ? "Collapse" : "Review"}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="px-5 pb-5" style={{ borderTop: "1px solid var(--border-color-light)" }}>
                  {/* Meta row */}
                  <div className="grid grid-cols-2 gap-3 mt-4 mb-3">
                    {a.keywords && (
                      <div className="rounded-lg p-3" style={{ background: "var(--bg-surface-secondary)" }}>
                        <div className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: "var(--text-disabled)" }}>Keywords</div>
                        <div className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{a.keywords}</div>
                      </div>
                    )}
                    {a.coAuthors && (
                      <div className="rounded-lg p-3" style={{ background: "var(--bg-surface-secondary)" }}>
                        <div className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: "var(--text-disabled)" }}>Co-Authors</div>
                        <div className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{a.coAuthors}</div>
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg p-4 mb-4 text-[13px] leading-relaxed whitespace-pre-wrap" style={{ background: "var(--bg-surface-secondary)", color: "var(--text-secondary)" }}>
                    {a.body}
                  </div>

                  {/* Reviewer assignment */}
                  <div className="mb-3">
                    <label className="block text-[11px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--text-muted)" }}>
                      Assign Reviewer
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={a.reviewedBy ? `Current: ${a.reviewedBy}` : "Enter reviewer name…"}
                        value={reviewerName[a.id] ?? ""}
                        onChange={(e) => setReviewerName((p) => ({ ...p, [a.id]: e.target.value }))}
                        className="flex-1 px-3 py-2 rounded-lg text-[13px] outline-none"
                        style={{ border: "1px solid var(--border-color)" }}
                      />
                      <button
                        onClick={() => assignReviewer(a.id)}
                        className="btn btn-primary px-3 py-2 text-[12px]"
                      >
                        Assign
                      </button>
                    </div>
                    {a.reviewedBy && (
                      <div className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>
                        Currently assigned to: <span className="font-semibold" style={{ color: "var(--text)" }}>{a.reviewedBy}</span>
                      </div>
                    )}
                  </div>

                  {a.reviewNotes && (
                    <div className="rounded-lg p-3 mb-3 text-[12px]" style={{ background: "var(--status-warning-bg)", color: "var(--yellow-dk)" }}>
                      <span className="font-semibold">Review note:</span> {a.reviewNotes}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="Add review note (optional)"
                      value={reviewNote[a.id] ?? ""}
                      onChange={(e) => setReviewNote((p) => ({ ...p, [a.id]: e.target.value }))}
                      className="flex-1 px-3 py-2 rounded-lg text-[13px] outline-none"
                      style={{ border: "1px solid var(--border-color)" }}
                    />
                    <div className="flex gap-2 flex-wrap">
                      {a.status !== "under_review" && (
                        <button onClick={() => handleAction(a.id, "under_review")} className="px-3 py-2 rounded-lg text-[12px] font-semibold" style={{ background: "var(--primary-lt)", color: "var(--primary)" }}>Review</button>
                      )}
                      <button onClick={() => handleAction(a.id, "accepted")} className="flex items-center gap-1 px-3 py-2 rounded-lg text-[12px] font-semibold" style={{ background: "var(--status-success-bg)", color: "var(--status-success-text)" }}>
                        <CheckCircle className="w-3.5 h-3.5" /> Accept
                      </button>
                      <button onClick={() => handleAction(a.id, "revision_requested")} className="flex items-center gap-1 px-3 py-2 rounded-lg text-[12px] font-semibold" style={{ background: "var(--status-warning-bg)", color: "var(--status-warning-text)" }}>
                        <Edit3 className="w-3.5 h-3.5" /> Revise
                      </button>
                      <button onClick={() => handleAction(a.id, "rejected")} className="flex items-center gap-1 px-3 py-2 rounded-lg text-[12px] font-semibold" style={{ background: "var(--status-danger-bg)", color: "var(--status-danger-text)" }}>
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>

                  {/* Status history */}
                  <div className="pt-3" style={{ borderTop: "1px solid var(--border-color-light)" }}>
                    <div className="text-[11px] font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--text-muted)" }}>
                      <Clock className="w-3 h-3 inline mr-1" />Status History
                    </div>
                    <AbstractHistorySection abstractId={a.id} />
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
