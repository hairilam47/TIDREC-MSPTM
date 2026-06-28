import React from "react";

const STATUS_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  // Payment / invoice
  paid:               { bg: "var(--status-success-bg)", color: "var(--status-success-text)", label: "Paid" },
  pending:            { bg: "var(--status-warning-bg)", color: "var(--status-warning-text)", label: "Pending" },
  overdue:            { bg: "var(--status-danger-bg)",  color: "var(--status-danger-text)",  label: "Overdue" },
  waived:             { bg: "var(--primary-lt)",        color: "var(--primary)",             label: "Waived" },
  // Abstract
  submitted:          { bg: "var(--primary-lt)",        color: "var(--primary)",             label: "Submitted" },
  under_review:       { bg: "var(--status-warning-bg)", color: "var(--status-warning-text)", label: "Under Review" },
  accepted:           { bg: "var(--status-success-bg)", color: "var(--status-success-text)", label: "Accepted" },
  rejected:           { bg: "var(--status-danger-bg)",  color: "var(--status-danger-text)",  label: "Rejected" },
  revision_requested: { bg: "var(--status-warning-bg)", color: "var(--status-warning-text)", label: "Revision" },
  // General
  active:   { bg: "var(--status-success-bg)",    color: "var(--status-success-text)", label: "Active" },
  inactive: { bg: "var(--bg-surface-secondary)", color: "var(--text-disabled)",       label: "Inactive" },
  // Email
  sent:  { bg: "var(--status-success-bg)",    color: "var(--status-success-text)", label: "Sent" },
  failed:{ bg: "var(--status-danger-bg)",     color: "var(--status-danger-text)",  label: "Failed" },
  draft: { bg: "var(--bg-surface-secondary)", color: "var(--text-secondary)",      label: "Draft" },
  // Sponsor
  gold:     { bg: "var(--gold-lt)",   color: "var(--gold)",    label: "Gold" },
  silver:   { bg: "rgba(156,163,175,0.15)", color: "#6b7280", label: "Silver" },
  bronze:   { bg: "rgba(180,120,60,0.12)",  color: "#92400e", label: "Bronze" },
  platinum: { bg: "var(--primary-lt)", color: "var(--primary)", label: "Platinum" },
};

interface StatusBadgeProps {
  status: string;
  label?: string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, label, size = "sm" }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status] ?? { bg: "var(--bg-surface-secondary)", color: "var(--text-muted)", label: status };
  const text = label ?? cfg.label ?? status.replace(/_/g, " ");
  return (
    <span
      style={{
        display: "inline-block",
        padding: size === "sm" ? "2px 8px" : "4px 10px",
        fontSize: size === "sm" ? 11 : 12,
        fontWeight: 600,
        borderRadius: 20,
        background: cfg.bg,
        color: cfg.color,
        whiteSpace: "nowrap",
        letterSpacing: "0.3px",
        textTransform: "capitalize",
      }}
    >
      {text}
    </span>
  );
}
