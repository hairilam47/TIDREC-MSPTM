import React from "react";
import PortalLayout from "@/components/PortalLayout";
import { useGetMyRegistration, useGetMe, useCreateRegistration, useGetRegistrationCategories } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, AlertCircle, Clock, ClipboardList } from "lucide-react";

const PAYMENT_STATUS_CONFIG: Record<string, { bg: string; color: string; label: string; icon: React.ReactNode }> = {
  paid: { bg: "#d1e7dd", color: "#0a5c39", label: "Paid", icon: <CheckCircle className="w-4 h-4" /> },
  pending: { bg: "#fff3cd", color: "#856404", label: "Payment Pending", icon: <Clock className="w-4 h-4" /> },
  overdue: { bg: "#f8d7da", color: "#842029", label: "Overdue", icon: <AlertCircle className="w-4 h-4" /> },
  waived: { bg: "#e6f4f5", color: "#0E6E74", label: "Waived", icon: <CheckCircle className="w-4 h-4" /> },
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
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#0E6E74" }} />
        </div>
      </PortalLayout>
    );
  }

  if (!registration) {
    return (
      <PortalLayout title="My Registration">
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-xl p-8" style={{ border: "1px solid #e9ecef" }}>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ background: "#e6f4f5" }}
            >
              <ClipboardList className="w-6 h-6" style={{ color: "#0E6E74" }} />
            </div>
            <h2 className="text-xl font-sans font-bold mb-2" style={{ color: "#0B2744" }}>
              Complete Registration
            </h2>
            <p className="text-[13px] mb-6" style={{ color: "#6c757d" }}>
              Select your delegate category to register for SATBDS 2027.
            </p>

            <div className="space-y-2 mb-6">
              {categories.length === 0 ? (
                <div className="text-[13px] text-center py-4" style={{ color: "#adb5bd" }}>
                  Loading categories…
                </div>
              ) : categories.map((cat) => {
                const selected = selectedCategory === cat.slug;
                return (
                  <label
                    key={cat.slug}
                    className="flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all"
                    style={{
                      border: selected ? "2px solid #0E6E74" : "1px solid #e9ecef",
                      background: selected ? "#e6f4f5" : "#fff",
                    }}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={cat.slug}
                      checked={selected}
                      onChange={() => setSelectedCategory(cat.slug)}
                      className="w-4 h-4 flex-shrink-0"
                      style={{ accentColor: "#0E6E74" }}
                    />
                    <div className="flex-1">
                      <div
                        className="text-[14px] font-semibold"
                        style={{ color: selected ? "#0E6E74" : "#212529" }}
                      >
                        {cat.label}
                      </div>
                      <div className="text-[12px] mt-0.5" style={{ color: "#6c757d" }}>
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
              className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
              style={{ background: selectedCategory ? "#0E6E74" : "#adb5bd" }}
            >
              {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit Registration
            </button>
          </div>
        </div>
      </PortalLayout>
    );
  }

  const sc = PAYMENT_STATUS_CONFIG[registration.paymentStatus] ?? PAYMENT_STATUS_CONFIG.pending;

  return (
    <PortalLayout title="My Registration">
      <div className="max-w-2xl">
        {/* Status header */}
        <div
          className="rounded-xl p-5 mb-6 flex items-center gap-4"
          style={{ background: sc.bg, border: `1px solid ${sc.bg}` }}
        >
          <div style={{ color: sc.color }}>{sc.icon}</div>
          <div>
            <div className="font-semibold text-[15px]" style={{ color: sc.color }}>{sc.label}</div>
            <div className="text-[13px]" style={{ color: sc.color, opacity: 0.8 }}>
              Registration Code: <strong>{registration.registrationCode}</strong>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Attendee info */}
          <div className="bg-white rounded-xl p-5" style={{ border: "1px solid #e9ecef" }}>
            <h3 className="text-[11px] font-bold uppercase tracking-wider mb-4" style={{ color: "#6c757d" }}>
              Attendee Information
            </h3>
            <div className="space-y-3">
              <div>
                <div className="text-[12px] font-medium mb-0.5" style={{ color: "#adb5bd" }}>Full Name</div>
                <div className="text-[14px] font-semibold" style={{ color: "#212529" }}>
                  {registration.firstName} {registration.lastName}
                </div>
              </div>
              <div>
                <div className="text-[12px] font-medium mb-0.5" style={{ color: "#adb5bd" }}>Email</div>
                <div className="text-[14px]" style={{ color: "#495057" }}>{registration.email}</div>
              </div>
              {registration.institution && (
                <div>
                  <div className="text-[12px] font-medium mb-0.5" style={{ color: "#adb5bd" }}>Institution</div>
                  <div className="text-[14px]" style={{ color: "#495057" }}>{registration.institution}</div>
                </div>
              )}
              {registration.country && (
                <div>
                  <div className="text-[12px] font-medium mb-0.5" style={{ color: "#adb5bd" }}>Country</div>
                  <div className="text-[14px]" style={{ color: "#495057" }}>{registration.country}</div>
                </div>
              )}
              <div>
                <div className="text-[12px] font-medium mb-0.5" style={{ color: "#adb5bd" }}>Category</div>
                <div className="text-[14px]" style={{ color: "#495057" }}>
                  {categories.find(c => c.slug === registration.category)?.label || registration.category?.replace(/_/g, " ")}
                </div>
              </div>
            </div>
          </div>

          {/* Payment info */}
          <div className="bg-white rounded-xl p-5" style={{ border: "1px solid #e9ecef" }}>
            <h3 className="text-[11px] font-bold uppercase tracking-wider mb-4" style={{ color: "#6c757d" }}>
              Payment Details
            </h3>
            <div className="rounded-xl p-4 mb-4" style={{ background: "#f8f9fa" }}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[13px]" style={{ color: "#6c757d" }}>Registration Fee</span>
                <span className="text-[16px] font-bold" style={{ color: "#212529" }}>
                  MYR {registration.paymentAmount?.toLocaleString() ?? "TBD"}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[13px]" style={{ color: "#6c757d" }}>Currency</span>
                <span className="text-[13px]" style={{ color: "#495057" }}>Malaysian Ringgit (MYR)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[13px]" style={{ color: "#6c757d" }}>Status</span>
                <span
                  className="text-[12px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: sc.bg, color: sc.color }}
                >
                  {sc.label}
                </span>
              </div>
            </div>
            <div className="text-[12px] mb-2" style={{ color: "#6c757d" }}>
              Registered:{" "}
              {new Date(registration.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
            {registration.paymentStatus === "pending" && (
              <div className="rounded-lg p-3 text-[12px]" style={{ background: "#fff3cd", color: "#664d03" }}>
                Payment instructions will be sent to your registered email. Please complete payment within 48 hours to secure your spot.
              </div>
            )}
          </div>
        </div>

        {/* Event details */}
        <div className="bg-white rounded-xl p-5 mt-5" style={{ border: "1px solid #e9ecef" }}>
          <h3 className="text-[11px] font-bold uppercase tracking-wider mb-4" style={{ color: "#6c757d" }}>
            Event Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Event", value: "3rd SATBDS 2027" },
              { label: "Date", value: "22–23 March 2027" },
              { label: "Venue", value: "Sunway Putra Hotel, Kuala Lumpur" },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="text-[12px] font-medium mb-0.5" style={{ color: "#adb5bd" }}>{label}</div>
                <div className="text-[13px] font-medium" style={{ color: "#212529" }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
