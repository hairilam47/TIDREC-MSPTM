import React from "react";
import PortalLayout from "@/components/PortalLayout";
import { useGetMyInvoice, useGetRegistrationCategories } from "@workspace/api-client-react";
import { Loader2, Receipt, Download, CheckCircle, Clock, AlertCircle } from "lucide-react";

const STATUS_CONFIG: Record<string, { bg: string; color: string; label: string; icon: React.ReactNode }> = {
  paid:    { bg: "var(--green-lt)",        color: "var(--green)",   label: "Paid",             icon: <CheckCircle style={{ width: 16, height: 16 }} /> },
  pending: { bg: "var(--status-warning-bg)", color: "var(--status-warning-text)", label: "Awaiting Payment", icon: <Clock style={{ width: 16, height: 16 }} /> },
  overdue: { bg: "var(--red-lt)",         color: "var(--red)",      label: "Overdue",          icon: <AlertCircle style={{ width: 16, height: 16 }} /> },
  waived:  { bg: "var(--primary-lt)",     color: "var(--primary)",  label: "Waived",           icon: <CheckCircle style={{ width: 16, height: 16 }} /> },
};

export default function Invoices() {
  const { data: invoice, isLoading, isError } = useGetMyInvoice();
  const { data: categories = [] } = useGetRegistrationCategories();

  return (
    <PortalLayout title="Invoices">
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "64px 0" }}>
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--primary)" }} />
        </div>
      ) : isError || !invoice ? (
        <div className="card" style={{ maxWidth: 380, margin: "0 auto" }}>
          <div className="card-body" style={{ padding: "64px 16px", textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--bg-surface-secondary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Receipt style={{ width: 28, height: 28, color: "var(--text-disabled)" }} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>No Invoice Yet</h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
              Complete your registration to generate an invoice.
            </p>
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: 640 }}>
          <div className="card" style={{ overflow: "hidden" }}>
            {/* Invoice header — brand gradient, intentionally not using CSS vars */}
            <div style={{ padding: "24px 32px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", background: "linear-gradient(135deg, var(--navy), var(--teal))" }}>
              <div>
                <div style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>INVOICE</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
                  SEAT-MSPTM 2027 — Symposium Registration
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--gold)", marginBottom: 4 }}>
                  Invoice Number
                </div>
                <div style={{ color: "#fff", fontFamily: "monospace", fontSize: 16, fontWeight: 700 }}>
                  {invoice.invoiceNumber}
                </div>
              </div>
            </div>

            {/* Status banner */}
            {(() => {
              const sc = STATUS_CONFIG[invoice.status] ?? STATUS_CONFIG.pending;
              return (
                <div style={{ padding: "10px 32px", display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, background: sc.bg, color: sc.color }}>
                  {sc.icon}
                  {sc.label}
                  {invoice.status === "pending" && (
                    <span style={{ marginLeft: "auto", fontWeight: 400 }}>Payment required within 48 hours</span>
                  )}
                </div>
              );
            })()}

            {/* Invoice body */}
            <div className="card-body" style={{ padding: "24px 32px" }}>
              {/* Dates */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid var(--border-color)" }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-disabled)", marginBottom: 4 }}>Issued</div>
                  <div style={{ fontSize: 14, color: "var(--text)" }}>
                    {new Date(invoice.issuedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </div>
                </div>
                {invoice.paidAt && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-disabled)", marginBottom: 4 }}>Paid On</div>
                    <div style={{ fontSize: 14, color: "var(--text)" }}>
                      {new Date(invoice.paidAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                    </div>
                  </div>
                )}
              </div>

              {/* Bill to */}
              <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid var(--border-color)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-disabled)", marginBottom: 10 }}>Bill To</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>{invoice.delegate.name}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{invoice.delegate.email}</div>
                {invoice.delegate.institution && (
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{invoice.delegate.institution}</div>
                )}
                {invoice.delegate.country && (
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{invoice.delegate.country}</div>
                )}
              </div>

              {/* Line items */}
              <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid var(--border-color)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-disabled)", marginBottom: 10 }}>Items</div>
                <div style={{ borderRadius: 6, overflow: "hidden", border: "1px solid var(--border-color)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto", padding: "10px 16px", background: "var(--bg-surface-secondary)", borderBottom: "1px solid var(--border-color)" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)" }}>Description</div>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)" }}>Amount</div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto", padding: "14px 16px", gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>
                        Symposium Registration — {categories.find(c => c.slug === invoice.category)?.label || invoice.category?.replace(/_/g, " ") || invoice.category}
                      </div>
                      <div style={{ fontSize: 12, marginTop: 2, color: "var(--text-muted)" }}>
                        SEAT-MSPTM 2027 · 22–23 March 2027 · Sunway Putra Hotel, KL
                      </div>
                      <div style={{ fontSize: 12, marginTop: 2, color: "var(--text-muted)" }}>
                        Reg: {invoice.registrationCode}
                      </div>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>
                      {invoice.currency} {invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto", padding: "12px 16px", background: "var(--bg-surface-secondary)", borderTop: "1px solid var(--border-color)", fontWeight: 700 }}>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Total</div>
                    <div style={{ fontSize: 16, color: "var(--text)" }}>
                      {invoice.currency} {invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment instructions */}
              {invoice.status === "pending" && (
                <div style={{ borderRadius: 6, padding: "14px 16px", background: "var(--primary-lt)", border: "1px solid rgba(14,110,116,0.2)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--primary)", marginBottom: 8 }}>
                    Payment Instructions
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
                    Please transfer the total amount to the account details provided in your registration confirmation email.
                    Quote your registration code <strong>{invoice.registrationCode}</strong> as the payment reference.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="card-footer" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 12, color: "var(--text-disabled)" }}>
                Organised by MSPTM &amp; TIDREC · seat-msptm2027.org
              </div>
              <button
                className="btn"
                style={{ border: "1px solid var(--border-color)", color: "var(--text-secondary)", background: "var(--bg-surface)" }}
                onClick={() => window.print()}
              >
                <Download style={{ width: 14, height: 14 }} />
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
