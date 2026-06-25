import React from "react";
import PortalLayout from "@/components/PortalLayout";
import { useGetMe, useUpdateMe } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle } from "lucide-react";

const COUNTRIES = [
  "Malaysia", "Singapore", "Thailand", "Indonesia", "Philippines", "Vietnam",
  "Myanmar", "Cambodia", "Laos", "Brunei", "Australia", "United Kingdom",
  "United States", "Japan", "South Korea", "China", "India", "Other",
];

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: 6, fontSize: 14,
  outline: "none", border: "1px solid var(--border-color)",
  background: "var(--bg-surface)", color: "var(--text)",
  fontFamily: "inherit", boxSizing: "border-box",
};

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
        <div style={{ display: "flex", justifyContent: "center", padding: "64px 0" }}>
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--primary)" }} />
        </div>
      ) : (
        <div style={{ maxWidth: 640 }}>
          {/* Avatar card */}
          <div className="card mb-4">
            <div className="card-body" style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg, var(--primary), var(--primary-dk))", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 20, fontWeight: 700, flexShrink: 0 }}>
                {initials}
              </div>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", margin: "0 0 2px" }}>
                  {user?.firstName} {user?.lastName}
                </h2>
                <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 6px" }}>{user?.email}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, textTransform: "capitalize",
                    background: user?.role === "admin" ? "var(--gold-lt)" : "var(--primary-lt)",
                    color: user?.role === "admin" ? "var(--gold)" : "var(--primary)",
                  }}>
                    {user?.role}
                  </span>
                  {user?.category && (
                    <span style={{ fontSize: 11, color: "var(--text-disabled)" }}>
                      · {user.category.replace(/_/g, " ")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Edit form */}
          <div className="card mb-4">
            <div className="card-header">
              <div className="card-title">Personal Information</div>
            </div>
            <div className="card-body">
              <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                      First Name <span style={{ color: "var(--red)" }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                      required
                      placeholder="e.g. Ahmad"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                      Last Name <span style={{ color: "var(--red)" }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                      required
                      placeholder="e.g. Rahman"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={user?.email ?? ""}
                    disabled
                    style={{ ...inputStyle, background: "var(--bg-surface-secondary)", color: "var(--text-disabled)" }}
                  />
                  <p style={{ fontSize: 12, marginTop: 4, color: "var(--text-disabled)" }}>Email address cannot be changed.</p>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                    Institution / Organisation
                  </label>
                  <input
                    type="text"
                    value={form.institution}
                    onChange={(e) => setForm((f) => ({ ...f, institution: e.target.value }))}
                    placeholder="e.g. University of Malaya"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                    Country
                  </label>
                  <select
                    value={form.country}
                    onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                    style={{ ...inputStyle, appearance: "auto" }}
                  >
                    <option value="">Select country…</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 4 }}>
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="btn btn-primary"
                  >
                    {updateMutation.isPending && <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" />}
                    Save Changes
                  </button>
                  {saved && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: "var(--green)" }}>
                      <CheckCircle style={{ width: 16, height: 16 }} />
                      Saved!
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Account info */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Account Information</div>
            </div>
            <div className="card-body">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  { label: "Account Type", value: user?.role === "admin" ? "Administrator" : "Delegate" },
                  {
                    label: "Member Since",
                    value: user
                      ? new Date(user.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" })
                      : "—",
                  },
                  { label: "Category", value: user?.category ? user.category.replace(/_/g, " ") : "Not set" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.4px", color: "var(--text-disabled)", marginBottom: 2 }}>
                      {label}
                    </div>
                    <div style={{ fontSize: 14, textTransform: "capitalize", color: "var(--text)" }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
