import React from "react";
import PortalLayout from "@/components/PortalLayout";
import { useGetMyRegistration, useGetMe, useCreateRegistration, useGetRegistrationCategories } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, AlertCircle, Clock, ClipboardList, Upload, FileCheck, Eye, RefreshCw } from "lucide-react";

const PAYMENT_STATUS_CONFIG: Record<string, { bg: string; color: string; label: string; icon: React.ReactNode }> = {
  paid:                 { bg: "var(--status-success-bg)", color: "var(--status-success-text)", label: "Paid",                   icon: <CheckCircle style={{ width: 16, height: 16 }} /> },
  pending:              { bg: "var(--status-warning-bg)", color: "var(--status-warning-text)", label: "Payment Pending",         icon: <Clock style={{ width: 16, height: 16 }} /> },
  overdue:              { bg: "var(--status-danger-bg)",  color: "var(--status-danger-text)",  label: "Overdue",                 icon: <AlertCircle style={{ width: 16, height: 16 }} /> },
  waived:               { bg: "var(--primary-lt)",        color: "var(--primary)",             label: "Waived",                  icon: <CheckCircle style={{ width: 16, height: 16 }} /> },
  pending_confirmation: { bg: "rgba(14,110,116,0.1)",     color: "var(--teal, #0e6e74)",       label: "Pending Confirmation",    icon: <RefreshCw style={{ width: 16, height: 16 }} /> },
};

const ALLOWED_RECEIPT_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const ALLOWED_RECEIPT_EXT = ".jpg, .jpeg, .png, .webp, .pdf";
const MAX_RECEIPT_MB = 10;

async function requestUploadUrl(file: File): Promise<{ uploadURL: string; objectPath: string }> {
  const token = localStorage.getItem("satbds_token");
  const res = await fetch("/api/storage/uploads/request-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
  });
  if (!res.ok) throw new Error("Failed to request upload URL");
  return res.json();
}

async function uploadToStorage(presignedUrl: string, file: File): Promise<void> {
  const res = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!res.ok) throw new Error("Failed to upload file");
}

function receiptViewUrl(objectPath: string): string {
  return objectPath.replace(/^\/objects/, "/api/storage/objects");
}

interface RegistrationWithReceipt {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  institution?: string | null;
  country?: string | null;
  category: string;
  paymentStatus: string;
  paymentAmount?: number | null;
  paymentMethod?: string | null;
  receiptUrl?: string | null;
  registrationCode: string;
  createdAt: string;
}

function ReceiptUploadSection({ registration, onSuccess }: { registration: RegistrationWithReceipt; onSuccess: () => void }) {
  const { toast } = useToast();
  const [file, setFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const hasExisting = !!registration.receiptUrl;
  const isPendingConfirmation = registration.paymentStatus === "pending_confirmation";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!ALLOWED_RECEIPT_TYPES.includes(f.type)) {
      toast({ title: "Invalid file type", description: `Allowed: ${ALLOWED_RECEIPT_EXT}`, variant: "destructive" });
      return;
    }
    if (f.size > MAX_RECEIPT_MB * 1024 * 1024) {
      toast({ title: "File too large", description: `Maximum size is ${MAX_RECEIPT_MB} MB`, variant: "destructive" });
      return;
    }
    setFile(f);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const { uploadURL, objectPath } = await requestUploadUrl(file);
      await uploadToStorage(uploadURL, file);

      const token = localStorage.getItem("satbds_token");
      const res = await fetch("/api/registrations/me/receipt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ receiptUrl: objectPath }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Submission failed");
      }
      toast({ title: "Receipt submitted", description: "Your payment proof is under review. We will confirm your payment shortly." });
      setFile(null);
      onSuccess();
    } catch (err) {
      toast({ title: "Upload failed", description: err instanceof Error ? err.message : "Please try again.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ marginTop: 16, borderTop: "1px solid var(--border-color-light)", paddingTop: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.4px" }}>
        Payment Proof / Receipt
      </div>

      {/* Currently submitted receipt */}
      {hasExisting && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, background: isPendingConfirmation ? "rgba(14,110,116,0.06)" : "var(--bg-surface-secondary)", border: "1px solid var(--border-color)", marginBottom: 12 }}>
          <FileCheck style={{ width: 16, height: 16, color: isPendingConfirmation ? "var(--teal, #0e6e74)" : "var(--status-success-text)", flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
              {isPendingConfirmation ? "Receipt submitted — under review" : "Receipt on file"}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
              {isPendingConfirmation
                ? "Our team will verify your payment and update your status."
                : "Your receipt has been recorded."}
            </div>
          </div>
          <a
            href={receiptViewUrl(registration.receiptUrl!)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-outline"
            style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12 }}
          >
            <Eye style={{ width: 12, height: 12 }} /> View
          </a>
        </div>
      )}

      {/* Upload new / replace */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {hasExisting && (
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
            Need to replace your receipt? Upload a new file below.
          </div>
        )}

        <div
          style={{
            border: "2px dashed var(--border-color)",
            borderRadius: 8,
            padding: "14px 16px",
            cursor: "pointer",
            background: file ? "var(--primary-lt)" : "var(--bg-surface-secondary)",
            transition: "border-color 150ms",
          }}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED_RECEIPT_EXT}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Upload style={{ width: 18, height: 18, color: file ? "var(--primary)" : "var(--text-disabled)", flexShrink: 0 }} />
            <div>
              {file ? (
                <>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)" }}>{file.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{(file.size / 1024 / 1024).toFixed(2)} MB · Click to change</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>Click to select receipt file</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>PDF, JPG, PNG, WebP · Max {MAX_RECEIPT_MB} MB</div>
                </>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!file || uploading}
          className="btn btn-primary w-full justify-center"
          style={{ height: 38 }}
        >
          {uploading ? (
            <><Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> Uploading…</>
          ) : (
            <><Upload style={{ width: 14, height: 14 }} /> {hasExisting ? "Replace & Resubmit Receipt" : "Submit Payment Receipt"}</>
          )}
        </button>
      </div>
    </div>
  );
}

export default function Registration() {
  const { data: rawRegistration, isLoading: loadingReg, refetch } = useGetMyRegistration();
  const registration = rawRegistration as RegistrationWithReceipt | undefined;
  const { data: user } = useGetMe();
  const { data: categories = [] } = useGetRegistrationCategories();
  const { toast } = useToast();
  const createMutation = useCreateRegistration();

  const [selectedCategory, setSelectedCategory] = React.useState(user?.category || "");

  const handleRegister = () => {
    if (!selectedCategory) {
      toast({ title: "Please select a category", variant: "destructive" });
      return;
    }
    createMutation.mutate(
      { data: { category: selectedCategory } },
      {
        onSuccess: () => {
          toast({ title: "Registration submitted", description: "Your registration has been received." });
          refetch();
        },
        onError: () => {
          toast({ title: "Registration failed", description: "Please try again.", variant: "destructive" });
        },
      },
    );
  };

  if (loadingReg) {
    return (
      <PortalLayout title="My Registration">
        <div style={{ display: "flex", justifyContent: "center", padding: "64px 0" }}>
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--primary)" }} />
        </div>
      </PortalLayout>
    );
  }

  if (!registration) {
    return (
      <PortalLayout title="My Registration">
        <div>
          <div className="card">
            <div className="card-body">
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--primary-lt)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <ClipboardList style={{ width: 22, height: 22, color: "var(--primary)" }} />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
                Complete Registration
              </h2>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>
                Select your delegate category to register for SEAT-MSPTM 2027.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
                {categories.length === 0 ? (
                  <div style={{ fontSize: 13, textAlign: "center", padding: "16px 0", color: "var(--text-disabled)" }}>
                    Loading categories…
                  </div>
                ) : categories.map((cat) => {
                  const selected = selectedCategory === cat.slug;
                  return (
                    <label
                      key={cat.slug}
                      style={{
                        display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                        borderRadius: 8, cursor: "pointer",
                        border: selected ? `2px solid var(--primary)` : `1px solid var(--border-color)`,
                        background: selected ? "var(--primary-lt)" : "var(--bg-surface)",
                        transition: "border-color 120ms, background 120ms",
                      }}
                    >
                      <input
                        type="radio"
                        name="category"
                        value={cat.slug}
                        checked={selected}
                        onChange={() => setSelectedCategory(cat.slug)}
                        style={{ width: 16, height: 16, flexShrink: 0, accentColor: "var(--primary)" }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: selected ? "var(--primary)" : "var(--text)" }}>
                          {cat.label}
                        </div>
                        <div style={{ fontSize: 12, marginTop: 2, color: "var(--text-muted)" }}>
                          MYR {cat.priceMyr.toLocaleString("en-MY", { minimumFractionDigits: 2 })}
                          {cat.description && ` · ${cat.description}`}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>

              <button
                onClick={handleRegister}
                disabled={!selectedCategory || createMutation.isPending}
                className="btn btn-primary w-full h-10 justify-center"
              >
                {createMutation.isPending && <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" />}
                Submit Registration
              </button>
            </div>
          </div>
        </div>
      </PortalLayout>
    );
  }

  const sc = PAYMENT_STATUS_CONFIG[registration.paymentStatus] ?? PAYMENT_STATUS_CONFIG.pending;
  const canUploadReceipt = ["pending", "overdue", "pending_confirmation"].includes(registration.paymentStatus);

  return (
    <PortalLayout title="My Registration">
      <div>
        {/* Status banner */}
        <div className="card mb-5" style={{ borderLeft: "4px solid", borderLeftColor: sc.color, background: sc.bg }}>
          <div className="card-body" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ color: sc.color, flexShrink: 0 }}>{sc.icon}</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: sc.color }}>{sc.label}</div>
              <div style={{ fontSize: 13, color: sc.color, opacity: 0.8 }}>
                Registration Code: <strong>{registration.registrationCode}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="row col-2">
          {/* Attendee info */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Attendee Information</div>
            </div>
            <div className="card-body">
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { label: "Full Name", value: `${registration.firstName} ${registration.lastName}`, bold: true },
                  { label: "Email", value: registration.email },
                  ...(registration.institution ? [{ label: "Institution", value: registration.institution }] : []),
                  ...(registration.country ? [{ label: "Country", value: registration.country }] : []),
                  { label: "Category", value: categories.find(c => c.slug === registration.category)?.label || registration.category?.replace(/_/g, " ") || "—" },
                ].map(({ label, value, bold }) => (
                  <div key={label}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: "var(--text-disabled)", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.4px" }}>{label}</div>
                    <div style={{ fontSize: 14, fontWeight: bold ? 600 : 400, color: "var(--text)" }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment info */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Payment Details</div>
            </div>
            <div className="card-body">
              <div style={{ borderRadius: 6, padding: "12px 14px", background: "var(--bg-surface-secondary)", border: "1px solid var(--border-color-light)", marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Registration Fee</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>
                    MYR {registration.paymentAmount?.toLocaleString() ?? "TBD"}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Currency</span>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Malaysian Ringgit (MYR)</span>
                </div>
                {registration.paymentMethod && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Payment Method</span>
                    <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                      {{ bank_transfer: "Bank Transfer", online_banking: "Online Banking (FPX)", credit_card: "Credit / Debit Card", e_perolehan: "ePerolehan" }[registration.paymentMethod] ?? registration.paymentMethod}
                    </span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Status</span>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20, background: sc.bg, color: sc.color }}>
                    {sc.label}
                  </span>
                </div>
              </div>

              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>
                Registered:{" "}
                {new Date(registration.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </div>

              {registration.paymentStatus === "pending" && (
                <div style={{ borderRadius: 6, padding: "10px 12px", background: "var(--yellow-lt)", color: "var(--yellow-dk)", fontSize: 12 }}>
                  Payment instructions will be sent to your registered email. After making payment, upload your receipt below to notify us.
                </div>
              )}

              {registration.paymentStatus === "overdue" && (
                <div style={{ borderRadius: 6, padding: "10px 12px", background: "var(--status-danger-bg)", color: "var(--status-danger-text)", fontSize: 12 }}>
                  Your payment is overdue. Please make payment and upload your receipt immediately.
                </div>
              )}

              {/* Receipt upload section */}
              {canUploadReceipt && (
                <ReceiptUploadSection registration={registration} onSuccess={refetch} />
              )}
            </div>
          </div>
        </div>

        {/* Event details */}
        <div className="card mt-4">
          <div className="card-header">
            <div className="card-title">Event Details</div>
          </div>
          <div className="card-body">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
              {[
                { label: "Event", value: "SEAT-MSPTM 2027" },
                { label: "Date", value: "22–23 March 2027" },
                { label: "Venue", value: "Sunway Putra Hotel, Kuala Lumpur" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: 11, fontWeight: 500, color: "var(--text-disabled)", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.4px" }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
