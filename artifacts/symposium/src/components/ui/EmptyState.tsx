import React from "react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  body?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, body, action }: EmptyStateProps) {
  return (
    <div style={{ textAlign: "center", padding: "64px 16px" }}>
      {icon && (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "var(--bg-surface-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            {icon}
          </div>
        </div>
      )}
      <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", margin: 0, marginBottom: body || action ? 8 : 0 }}>
        {title}
      </h3>
      {body && (
        <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 auto", maxWidth: 320 }}>
          {body}
        </p>
      )}
      {action && <div style={{ marginTop: 20 }}>{action}</div>}
    </div>
  );
}
