import React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export const INPUT_BASE =
  "w-full px-3.5 py-3 rounded-lg text-[14px] outline-none transition-colors focus:ring-2 focus:ring-[rgba(14,110,116,0.2)] focus:border-[#0E6E74]";

export const SELECT_BASE =
  "w-full px-3.5 py-3 rounded-lg text-[14px] outline-none transition-colors focus:ring-2 focus:ring-[rgba(14,110,116,0.2)] focus:border-[#0E6E74] bg-white";

export const TEXTAREA_BASE =
  "w-full px-3.5 py-3 rounded-lg text-[14px] outline-none transition-colors focus:ring-2 focus:ring-[rgba(14,110,116,0.2)] focus:border-[#0E6E74] resize-none";

export const inputBorder = (error?: string): React.CSSProperties => ({
  border: `1px solid ${error ? "#dc3545" : "var(--border-color)"}`,
});

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

export function FormField({ label, required, error, hint, children }: FormFieldProps) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--text-secondary)" }}>
        {label}
        {required && <span style={{ color: "#dc3545" }}> *</span>}
      </label>
      {children}
      {error && <p style={{ fontSize: 12, marginTop: 4, color: "#dc3545" }}>{error}</p>}
      {hint && !error && <p style={{ fontSize: 11, marginTop: 4, color: "var(--text-muted)" }}>{hint}</p>}
    </div>
  );
}

function useBodyScrollLock() {
  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);
}

const SIZE_MAX: Record<string, number> = { sm: 384, md: 448, lg: 512, xl: 672 };

interface ModalShellProps {
  title: string;
  onClose: () => void;
  footer: React.ReactNode;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export function ModalShell({ title, onClose, footer, children, size = "lg" }: ModalShellProps) {
  useBodyScrollLock();

  return createPortal(
    <div
      style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", background: "rgba(0,0,0,0.55)", zIndex: 99999 }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="card"
        style={{ width: "100%", maxWidth: SIZE_MAX[size], maxHeight: "90dvh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.25)", overflow: "hidden" }}
      >
        {/* Card header */}
        <div className="card-header">
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            <div className="card-title font-sans" style={{ fontSize: 15 }}>{title}</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ padding: "0 6px", flexShrink: 0 }}>
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Card body — scrollable */}
        <div className="card-body" style={{ overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
          {children}
        </div>

        {/* Card footer */}
        {footer && (
          <div className="card-footer" style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  danger?: boolean;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
  loading = false,
  danger = true,
}: ConfirmDialogProps) {
  useBodyScrollLock();

  return createPortal(
    <div
      style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", background: "rgba(0,0,0,0.55)", zIndex: 99999 }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="card" style={{ width: "100%", maxWidth: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.25)", overflow: "hidden" }}>
        <div className="card-header">
          <div className="card-title" style={{ fontSize: 15 }}>{title}</div>
        </div>
        <div className="card-body">
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>{message}</p>
        </div>
        <div className="card-footer" style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
          <button
            className="btn"
            onClick={onConfirm}
            disabled={loading}
            style={{ background: danger ? "#dc3545" : "var(--primary)", color: "#fff", borderColor: danger ? "#b02a37" : "var(--primary-dk)", opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
