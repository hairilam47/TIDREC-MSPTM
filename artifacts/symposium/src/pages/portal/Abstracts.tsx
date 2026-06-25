import React from "react";
import PortalLayout from "@/components/PortalLayout";
import { useGetAbstracts } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Plus, FileText, Loader2, ArrowRight } from "lucide-react";

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  submitted:          { bg: "var(--primary-lt)",        color: "var(--primary)",              label: "Submitted" },
  under_review:       { bg: "var(--status-warning-bg)", color: "var(--status-warning-text)",  label: "Under Review" },
  accepted:           { bg: "var(--status-success-bg)", color: "var(--status-success-text)",  label: "Accepted" },
  rejected:           { bg: "var(--status-danger-bg)",  color: "var(--status-danger-text)",   label: "Rejected" },
  revision_requested: { bg: "var(--status-warning-bg)", color: "var(--status-warning-text)",  label: "Revision Needed" },
};

export default function Abstracts() {
  const { data: abstracts, isLoading } = useGetAbstracts();

  return (
    <PortalLayout title="My Abstracts">
      <div className="flex items-center justify-between mb-5">
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
          Submit and track your abstract submissions for SEAT-MSPTM 2027.
        </p>
        <Link href="/portal/abstracts/new">
          <button className="btn btn-primary">
            <Plus style={{ width: 14, height: 14 }} /> Submit New Abstract
          </button>
        </Link>
      </div>

      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "64px 0" }}>
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--primary)" }} />
        </div>
      ) : abstracts && abstracts.length > 0 ? (
        <div className="card">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    {["Code", "Title", "Type", "Status", "Submitted", ""].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {abstracts.map((a) => {
                    const sc = STATUS_STYLES[a.status] ?? STATUS_STYLES.submitted;
                    return (
                      <tr key={a.id}>
                        <td><span className="cell-mono">{a.abstractCode}</span></td>
                        <td style={{ maxWidth: 280 }}>
                          <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)", lineHeight: 1.4 }}>
                            {a.title.length > 50 ? a.title.slice(0, 50) + "…" : a.title}
                          </div>
                          {a.reviewNotes && (
                            <div style={{ fontSize: 11, marginTop: 2, color: "var(--text-secondary)" }}>
                              Reviewer notes available
                            </div>
                          )}
                        </td>
                        <td style={{ color: "var(--text-secondary)", textTransform: "capitalize", fontSize: 13 }}>
                          {a.abstractType?.replace(/_/g, " ")}
                        </td>
                        <td>
                          <span style={{ background: sc.bg, color: sc.color, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, display: "inline-block" }}>
                            {sc.label}
                          </span>
                        </td>
                        <td style={{ fontSize: 13, color: "var(--text-muted)" }}>
                          {new Date(a.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </td>
                        <td>
                          <Link
                            href={`/portal/abstracts/${a.id}`}
                            style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 500, color: "var(--primary)", textDecoration: "none" }}
                          >
                            View <ArrowRight style={{ width: 14, height: 14 }} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body" style={{ padding: "64px 16px", textAlign: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--primary-lt)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
              <FileText style={{ width: 22, height: 22, color: "var(--primary)" }} />
            </div>
            <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>No Abstracts Yet</p>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20, maxWidth: 340, margin: "0 auto 20px" }}>
              Share your research with the global tick and tick-borne diseases community.
            </p>
            <Link href="/portal/abstracts/new">
              <button className="btn btn-primary">Submit Your First Abstract</button>
            </Link>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
