import React from "react";
import PortalLayout from "@/components/PortalLayout";
import { useGetMyRegistration, useGetMe, useCreateRegistration, useGetRegistrationCategories } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, AlertCircle, Clock, ClipboardList } from "lucide-react";

const PAYMENT_STATUS_CONFIG: Record<string, { bg: string; color: string; label: string; icon: React.ReactNode }> = {
  paid:    { bg: "var(--status-success-bg)", color: "var(--status-success-text)", label: "Paid",            icon: <CheckCircle style={{ width: 16, height: 16 }} /> },
  pending: { bg: "var(--status-warning-bg)", color: "var(--status-warning-text)", label: "Payment Pending", icon: <Clock style={{ width: 16, height: 16 }} /> },
  overdue: { bg: "var(--status-danger-bg)",  color: "var(--status-danger-text)",  label: "Overdue",         icon: <AlertCircle style={{ width: 16, height: 16 }} /> },
  waived:  { bg: "var(--primary-lt)",        color: "var(--primary)",             label: "Waived",          icon: <CheckCircle style={{ width: 16, height: 16 }} /> },
};

export default function Registration() {
  const { data: registration, isLoading: loadingReg, refetch } = useGetMyRegistration();
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
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
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
                className="btn btn-primary"
                style={{ width: "100%", height: 40, justifyContent: "center" }}
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

  return (
    <PortalLayout title="My Registration">
      <div style={{ maxWidth: 720 }}>
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
                  Payment instructions will be sent to your registered email. Please complete payment within 48 hours to secure your spot.
                </div>
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 16 }}>
              {[
                { label: "Event", value: "3rd SEAT-MSPTM 2027" },
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
