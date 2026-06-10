import React from "react";
import PortalLayout from "@/components/PortalLayout";
import { useGetMe, useUpdateMe } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, UserCircle } from "lucide-react";

const COUNTRIES = [
  "Malaysia", "Singapore", "Thailand", "Indonesia", "Philippines", "Vietnam",
  "Myanmar", "Cambodia", "Laos", "Brunei", "Australia", "United Kingdom",
  "United States", "Japan", "South Korea", "China", "India", "Other",
];

export default function Profile() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useGetMe();
  const updateMutation = useUpdateMe();
  const { toast } = useToast();
  const [saved, setSaved] = React.useState(false);

  const [form, setForm] = React.useState({
    firstName: "",
    lastName: "",
    institution: "",
    country: "",
  });

  React.useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        institution: user.institution ?? "",
        country: user.country ?? "",
      });
    }
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(
      { data: { ...form } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          setSaved(true);
          setTimeout(() => setSaved(false), 3000);
          toast({ title: "Profile updated", description: "Your changes have been saved." });
        },
        onError: () => {
          toast({ title: "Update failed", description: "Please try again.", variant: "destructive" });
        },
      },
    );
  };

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "?";

  return (
    <PortalLayout title="Profile">
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#0E6E74" }} />
        </div>
      ) : (
        <div className="max-w-2xl">
          {/* Avatar area */}
          <div className="bg-white rounded-xl p-6 mb-5 flex items-center gap-5" style={{ border: "1px solid #e9ecef" }}>
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold font-serif flex-shrink-0"
              style={{ background: "#0E6E74" }}
            >
              {initials}
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold" style={{ color: "#0B2744" }}>
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-[13px]" style={{ color: "#6c757d" }}>{user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize"
                  style={{ background: user?.role === "admin" ? "rgba(200,155,60,0.12)" : "#e6f4f5", color: user?.role === "admin" ? "#C89B3C" : "#0E6E74" }}
                >
                  {user?.role}
                </span>
                {user?.category && (
                  <span className="text-[11px]" style={{ color: "#adb5bd" }}>· {user.category.replace(/_/g, " ")}</span>
                )}
              </div>
            </div>
          </div>

          {/* Edit form */}
          <div className="bg-white rounded-xl p-6" style={{ border: "1px solid #e9ecef" }}>
            <h3 className="text-[15px] font-semibold mb-5" style={{ color: "#212529" }}>
              Personal Information
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#495057" }}>
                    First Name <span style={{ color: "#dc3545" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                    required
                    className="w-full px-3 py-2.5 rounded-lg text-[14px] outline-none focus:ring-2 ring-teal-200"
                    style={{ border: "1px solid #dee2e6", fontFamily: "Inter, sans-serif" }}
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#495057" }}>
                    Last Name <span style={{ color: "#dc3545" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                    required
                    className="w-full px-3 py-2.5 rounded-lg text-[14px] outline-none focus:ring-2 ring-teal-200"
                    style={{ border: "1px solid #dee2e6", fontFamily: "Inter, sans-serif" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#495057" }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email ?? ""}
                  disabled
                  className="w-full px-3 py-2.5 rounded-lg text-[14px]"
                  style={{ border: "1px solid #dee2e6", background: "#f8f9fa", color: "#adb5bd", fontFamily: "Inter, sans-serif" }}
                />
                <p className="text-[12px] mt-1" style={{ color: "#adb5bd" }}>Email address cannot be changed.</p>
              </div>

              <div>
                <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#495057" }}>
                  Institution / Organisation
                </label>
                <input
                  type="text"
                  value={form.institution}
                  onChange={(e) => setForm((f) => ({ ...f, institution: e.target.value }))}
                  placeholder="e.g. University of Malaya"
                  className="w-full px-3 py-2.5 rounded-lg text-[14px] outline-none focus:ring-2 ring-teal-200"
                  style={{ border: "1px solid #dee2e6", fontFamily: "Inter, sans-serif" }}
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#495057" }}>
                  Country
                </label>
                <select
                  value={form.country}
                  onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg text-[14px] outline-none focus:ring-2 ring-teal-200"
                  style={{ border: "1px solid #dee2e6", fontFamily: "Inter, sans-serif" }}
                >
                  <option value="">Select country…</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-[14px] font-semibold text-white"
                  style={{ background: "#0E6E74" }}
                >
                  {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
                {saved && (
                  <div className="flex items-center gap-1.5 text-[13px] font-medium" style={{ color: "#198754" }}>
                    <CheckCircle className="w-4 h-4" />
                    Saved!
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Account info */}
          <div className="bg-white rounded-xl p-6 mt-5" style={{ border: "1px solid #e9ecef" }}>
            <h3 className="text-[15px] font-semibold mb-4" style={{ color: "#212529" }}>Account Information</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Account Type", value: user?.role === "admin" ? "Administrator" : "Delegate" },
                { label: "Member Since", value: user ? new Date(user.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : "—" },
                { label: "Category", value: user?.category ? user.category.replace(/_/g, " ") : "Not set" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-[11px] font-bold uppercase tracking-wider mb-0.5" style={{ color: "#adb5bd" }}>{label}</div>
                  <div className="text-[14px] capitalize" style={{ color: "#212529" }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
