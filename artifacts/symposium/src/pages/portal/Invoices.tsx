import React from "react";
import PortalLayout from "@/components/PortalLayout";
import { useGetMyInvoice, useGetRegistrationCategories } from "@workspace/api-client-react";
import { Loader2, Receipt, Download, CheckCircle, Clock, AlertCircle } from "lucide-react";

const STATUS_CONFIG: Record<string, { bg: string; color: string; label: string; icon: React.ReactNode }> = {
  paid: { bg: "#d1e7dd", color: "#0a5c39", label: "Paid", icon: <CheckCircle className="w-4 h-4" /> },
  pending: { bg: "#fff3cd", color: "#856404", label: "Awaiting Payment", icon: <Clock className="w-4 h-4" /> },
  overdue: { bg: "#f8d7da", color: "#842029", label: "Overdue", icon: <AlertCircle className="w-4 h-4" /> },
  waived: { bg: "#e6f4f5", color: "#0E6E74", label: "Waived", icon: <CheckCircle className="w-4 h-4" /> },
};

export default function Invoices() {
  const { data: invoice, isLoading, isError } = useGetMyInvoice();
  const { data: categories = [] } = useGetRegistrationCategories();

  return (
    <PortalLayout title="Invoices">
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#0E6E74" }} />
        </div>
      ) : isError || !invoice ? (
        <div
          className="bg-white rounded-xl p-16 text-center max-w-sm mx-auto"
          style={{ border: "1px dashed #dee2e6" }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "#f8f9fa" }}
          >
            <Receipt className="w-8 h-8" style={{ color: "#dee2e6" }} />
          </div>
          <h3 className="text-xl font-sans font-bold mb-2" style={{ color: "#212529" }}>
            No Invoice Yet
          </h3>
          <p className="text-sm" style={{ color: "#6c757d" }}>
            Complete your registration to generate an invoice.
          </p>
        </div>
      ) : (
        <div className="max-w-2xl">
          {/* Invoice document */}
          <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #e9ecef", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            {/* Invoice header */}
            <div
              className="px-8 py-6 flex items-start justify-between"
              style={{ background: "linear-gradient(135deg, #0B2744, #0E6E74)" }}
            >
              <div>
                <div className="text-white font-sans text-xl font-bold mb-1">INVOICE</div>
                <div className="text-[13px]" style={{ color: "rgba(255,255,255,0.7)" }}>
                  3rd SATBDS 2027 — Symposium Registration
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: "#C89B3C" }}>
                  Invoice Number
                </div>
                <div className="text-white font-mono text-[16px] font-bold">
                  {invoice.invoiceNumber}
                </div>
              </div>
            </div>

            {/* Status banner */}
            {(() => {
              const sc = STATUS_CONFIG[invoice.status] ?? STATUS_CONFIG.pending;
              return (
                <div
                  className="px-8 py-3 flex items-center gap-2 text-[13px] font-semibold"
                  style={{ background: sc.bg, color: sc.color }}
                >
                  {sc.icon}
                  {sc.label}
                  {invoice.status === "pending" && (
                    <span className="ml-auto font-normal">
                      Payment required within 48 hours
                    </span>
                  )}
                </div>
              );
            })()}

            {/* Invoice body */}
            <div className="px-8 py-6">
              {/* Dates */}
              <div className="grid grid-cols-2 gap-6 mb-6 pb-6" style={{ borderBottom: "1px solid #e9ecef" }}>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: "#adb5bd" }}>Issued</div>
                  <div className="text-[14px]" style={{ color: "#212529" }}>
                    {new Date(invoice.issuedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </div>
                </div>
                {invoice.paidAt && (
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: "#adb5bd" }}>Paid On</div>
                    <div className="text-[14px]" style={{ color: "#212529" }}>
                      {new Date(invoice.paidAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                    </div>
                  </div>
                )}
              </div>

              {/* Bill to */}
              <div className="mb-6 pb-6" style={{ borderBottom: "1px solid #e9ecef" }}>
                <div className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: "#adb5bd" }}>Bill To</div>
                <div className="text-[15px] font-semibold" style={{ color: "#212529" }}>{invoice.delegate.name}</div>
                <div className="text-[13px]" style={{ color: "#6c757d" }}>{invoice.delegate.email}</div>
                {invoice.delegate.institution && (
                  <div className="text-[13px]" style={{ color: "#6c757d" }}>{invoice.delegate.institution}</div>
                )}
                {invoice.delegate.country && (
                  <div className="text-[13px]" style={{ color: "#6c757d" }}>{invoice.delegate.country}</div>
                )}
              </div>

              {/* Line items */}
              <div className="mb-6 pb-6" style={{ borderBottom: "1px solid #e9ecef" }}>
                <div className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: "#adb5bd" }}>Items</div>
                <div className="rounded-lg overflow-hidden" style={{ border: "1px solid #e9ecef" }}>
                  <div className="grid grid-cols-3 px-4 py-2.5" style={{ background: "#f8f9fa", borderBottom: "1px solid #e9ecef" }}>
                    <div className="text-[11px] font-semibold uppercase tracking-wider col-span-2" style={{ color: "#6c757d" }}>Description</div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-right" style={{ color: "#6c757d" }}>Amount</div>
                  </div>
                  <div className="grid grid-cols-3 px-4 py-3.5">
                    <div className="col-span-2">
                      <div className="text-[14px] font-medium" style={{ color: "#212529" }}>
                        Symposium Registration — {categories.find(c => c.slug === invoice.category)?.label || invoice.category?.replace(/_/g, " ") || invoice.category}
                      </div>
                      <div className="text-[12px] mt-0.5" style={{ color: "#6c757d" }}>
                        3rd SATBDS 2027 · 22–23 March 2027 · Sunway Putra Hotel, KL
                      </div>
                      <div className="text-[12px] mt-0.5" style={{ color: "#6c757d" }}>
                        Reg: {invoice.registrationCode}
                      </div>
                    </div>
                    <div className="text-[15px] font-bold text-right" style={{ color: "#212529" }}>
                      {invoice.currency} {invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div
                    className="grid grid-cols-3 px-4 py-3 font-bold"
                    style={{ background: "#f8f9fa", borderTop: "1px solid #e9ecef" }}
                  >
                    <div className="col-span-2 text-[13px]" style={{ color: "#495057" }}>Total</div>
                    <div className="text-[16px] text-right" style={{ color: "#0B2744" }}>
                      {invoice.currency} {invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment instructions */}
              {invoice.status === "pending" && (
                <div className="rounded-lg p-4" style={{ background: "#e6f4f5", border: "1px solid #a3d4d6" }}>
                  <div className="text-[12px] font-bold uppercase tracking-wider mb-2" style={{ color: "#0E6E74" }}>
                    Payment Instructions
                  </div>
                  <p className="text-[13px]" style={{ color: "#055160" }}>
                    Please transfer the total amount to the account details provided in your registration confirmation email.
                    Quote your registration code <strong>{invoice.registrationCode}</strong> as the payment reference.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-4 flex items-center justify-between" style={{ background: "#f8f9fa", borderTop: "1px solid #e9ecef" }}>
              <div className="text-[12px]" style={{ color: "#adb5bd" }}>
                Organised by MSPTM & TIDREC@UM · satbds2027.org
              </div>
              <button
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium"
                style={{ border: "1px solid #dee2e6", color: "#495057", background: "#fff" }}
                onClick={() => window.print()}
              >
                <Download className="w-3.5 h-3.5" />
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
