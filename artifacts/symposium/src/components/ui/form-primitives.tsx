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
  border: `1px solid ${error ? "#dc3545" : "#dee2e6"}`,
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
      <label className="block text-[13px] font-semibold mb-1.5" style={{ color: "#495057" }}>
        {label}
        {required && <span style={{ color: "#dc3545" }}> *</span>}
      </label>
      {children}
      {error && <p className="text-[12px] mt-1" style={{ color: "#dc3545" }}>{error}</p>}
      {hint && !error && <p className="text-[12px] mt-1" style={{ color: "#adb5bd" }}>{hint}</p>}
    </div>
  );
}

interface ModalShellProps {
  title: string;
  onClose: () => void;
  footer: React.ReactNode;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export function ModalShell({ title, onClose, footer, children, size = "lg" }: ModalShellProps) {
  const maxW =
    size === "sm" ? "sm:max-w-sm" : size === "md" ? "sm:max-w-md" : "sm:max-w-lg";

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`bg-white w-full rounded-t-2xl sm:rounded-2xl ${maxW} max-h-[90vh] flex flex-col shadow-2xl`}
      >
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid #e9ecef" }}
        >
          <h3 className="text-[16px] font-semibold" style={{ color: "#0B2744" }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <X className="w-5 h-5" style={{ color: "#6c757d" }} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">{children}</div>
        {footer && (
          <div
            className="flex justify-end gap-3 px-6 py-4 flex-shrink-0"
            style={{ borderTop: "1px solid #e9ecef" }}
          >
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
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
        <h3 className="text-[16px] font-semibold mb-2" style={{ color: "#0B2744" }}>
          {title}
        </h3>
        <p className="text-[13px] leading-relaxed mb-5" style={{ color: "#6c757d" }}>
          {message}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-lg text-[13px] font-medium transition-colors hover:bg-gray-50"
            style={{ border: "1px solid #e9ecef", color: "#6c757d" }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2.5 rounded-lg text-[13px] font-semibold text-white disabled:opacity-60"
            style={{ background: danger ? "#dc3545" : "#0E6E74" }}
          >
            {loading ? "…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
