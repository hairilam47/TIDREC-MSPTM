import React from "react";
import PortalLayout from "@/components/PortalLayout";
import { useGetMe, useUpdateMe } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle } from "lucide-react";
import { INPUT_BASE, SELECT_BASE, inputBorder } from "@/components/ui/form-primitives";
import { COUNTRIES_DATA, COUNTRY_NAMES } from "@/lib/countries";

const SALUTATIONS = ["Ms.", "Mr.", "Dr.", "Assoc. Prof. Dr.", "Prof. Dr.", "Dato'", "Datuk", "Datin", "Other"];

function computeAge(dateOfBirth: string | null | undefined): number | null {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

export default function Profile() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useGetMe();
  const updateMutation = useUpdateMe();
  const { toast } = useToast();
  const [saved, setSaved] = React.useState(false);

  const [form, setForm] = React.useState({
    fullName: "",
    salutation: "",
    salutationOther: "",
    mobileCountryCode: "+60",
    mobileNumber: "",
    nationality: "",
    gender: "",
    dateOfBirth: "",
    isMmaMember: "" as "mma" | "non_mma" | "",
    mmcNumber: "",
    institution: "",
    country: "",
  });

  React.useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName ?? "",
        salutation: user.salutation ?? "",
        salutationOther: user.salutationOther ?? "",
        mobileCountryCode: user.mobileCountryCode ?? "+60",
        mobileNumber: user.mobileNumber ?? "",
        nationality: user.nationality ?? "",
        gender: user.gender ?? "",
        dateOfBirth: user.dateOfBirth ?? "",
        isMmaMember: user.isMmaMember === true ? "mma" : user.isMmaMember === false ? "non_mma" : "",
        mmcNumber: (user.mmcNumber && user.mmcNumber !== "000") ? user.mmcNumber : "",
        institution: user.institution ?? "",
        country: user.country ?? "",
      });
    }
  }, [user]);

  const setField = (field: keyof typeof form, value: string) =>
    setForm(f => ({ ...f, [field]: value }));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fullName.trim()) {
      toast({ title: "Full name is required", variant: "destructive" }); return;
    }
    if (!form.salutation) {
      toast({ title: "Salutation is required", variant: "destructive" }); return;
    }
    if (form.salutation === "Other" && !form.salutationOther.trim()) {
      toast({ title: "Please specify your salutation", variant: "destructive" }); return;
    }
    if (!form.mobileCountryCode || !form.mobileNumber.trim()) {
      toast({ title: "Mobile number is required", variant: "destructive" }); return;
    }
    if (!form.nationality) {
      toast({ title: "Nationality is required", variant: "destructive" }); return;
    }
    if (!form.gender) {
      toast({ title: "Gender is required", variant: "destructive" }); return;
    }
    if (!form.dateOfBirth) {
      toast({ title: "Date of birth is required", variant: "destructive" }); return;
    }
    if (!form.isMmaMember) {
      toast({ title: "Please indicate your MMA membership status", variant: "destructive" }); return;
    }
    if (form.isMmaMember === "mma" && !form.mmcNumber.trim()) {
      toast({ title: "MMC number is required for MMA members", variant: "destructive" }); return;
    }
    if (!form.institution.trim()) {
      toast({ title: "Institution / Organisation is required", variant: "destructive" }); return;
    }
    if (!form.country) {
      toast({ title: "Country is required", variant: "destructive" }); return;
    }

    const isMma = form.isMmaMember === "mma";
    updateMutation.mutate(
      {
        data: {
          fullName: form.fullName,
          salutation: form.salutation,
          salutationOther: form.salutation === "Other" ? form.salutationOther : "",
          mobileCountryCode: form.mobileCountryCode,
          mobileNumber: form.mobileNumber,
          nationality: form.nationality,
          gender: form.gender,
          dateOfBirth: form.dateOfBirth || undefined,
          isMmaMember: form.isMmaMember !== "" ? isMma : undefined,
          mmcNumber: isMma ? form.mmcNumber : "000",
          institution: form.institution,
          country: form.country,
        },
      },
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

  const displayName = user?.fullName || `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "?";
  const initials = displayName.split(/\s+/).map((w: string) => w[0]).slice(0, 2).join("").toUpperCase() || "?";
  const age = computeAge(form.dateOfBirth);

  const labelStyle: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 };
  const sectionTitle: React.CSSProperties = { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", color: "var(--text-disabled)", marginBottom: 14, paddingBottom: 8, borderBottom: "1px solid var(--border-color)" };

  return (
    <PortalLayout title="Profile">
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "64px 0" }}>
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--primary)" }} />
        </div>
      ) : (
        <div>
          {/* Avatar card */}
          <div className="card mb-4">
            <div className="card-body" style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg, var(--primary), var(--primary-dk))", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 20, fontWeight: 700, flexShrink: 0 }}>
                {initials}
              </div>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", margin: "0 0 2px" }}>
                  {user?.salutation ? `${user.salutation === "Other" ? (user.salutationOther ?? "") : user.salutation} ` : ""}{displayName}
                </h2>
                <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 6px" }}>{user?.email}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, textTransform: "capitalize", background: user?.role === "admin" ? "var(--gold-lt)" : "var(--primary-lt)", color: user?.role === "admin" ? "var(--gold)" : "var(--primary)" }}>
                    {user?.role}
                  </span>
                  {user?.category && <span style={{ fontSize: 11, color: "var(--text-disabled)" }}>· {user.category.replace(/_/g, " ")}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Edit form */}
          <div className="card mb-4">
            <div className="card-header"><div className="card-title">Personal Information</div></div>
            <div className="card-body">
              <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                {/* Salutation */}
                <div>
                  <p style={sectionTitle}>Salutation</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 8 }}>
                    {SALUTATIONS.map(s => (
                      <label key={s} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, cursor: "pointer", border: form.salutation === s ? "2px solid var(--primary)" : "1px solid var(--border-color)", background: form.salutation === s ? "var(--primary-lt)" : "var(--bg-surface)", fontSize: 13 }}>
                        <input type="radio" name="salutation" value={s} checked={form.salutation === s} onChange={e => setField("salutation", e.target.value)} />
                        {s}
                      </label>
                    ))}
                  </div>
                  {form.salutation === "Other" && (
                    <div style={{ marginTop: 8 }}>
                      <input type="text" value={form.salutationOther} onChange={e => setField("salutationOther", e.target.value)}
                        placeholder="Please specify" className={INPUT_BASE} style={inputBorder()} />
                    </div>
                  )}
                </div>

                {/* Full Name */}
                <div>
                  <p style={sectionTitle}>Full Name</p>
                  <label style={labelStyle}>Full Name as in IC / Passport <span style={{ color: "var(--red)" }}>*</span></label>
                  <input type="text" value={form.fullName} onChange={e => setField("fullName", e.target.value)} required
                    placeholder="e.g. Ahmad bin Abdullah" className={INPUT_BASE} style={inputBorder()} />
                  <p style={{ fontSize: 11, marginTop: 4, color: "var(--text-disabled)" }}>
                    Invoice, receipt, name badge and certificate are produced based on this name.
                  </p>
                </div>

                {/* Email (read-only) */}
                <div>
                  <label style={labelStyle}>Email Address</label>
                  <input type="email" value={user?.email ?? ""} disabled className={INPUT_BASE}
                    style={{ ...inputBorder(), background: "var(--bg-surface-secondary)", color: "var(--text-disabled)", cursor: "not-allowed" }} />
                  <p style={{ fontSize: 11, marginTop: 4, color: "var(--text-disabled)" }}>Email address cannot be changed.</p>
                </div>

                {/* Mobile */}
                <div>
                  <p style={sectionTitle}>Contact</p>
                  <label style={labelStyle}>Mobile Number <span style={{ color: "var(--red)" }}>*</span></label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <select value={form.mobileCountryCode} onChange={e => setField("mobileCountryCode", e.target.value)}
                      className={SELECT_BASE} style={{ ...inputBorder(), width: 200, flexShrink: 0, appearance: "auto" }}>
                      {COUNTRIES_DATA.map(c => (
                        <option key={c.name} value={c.dialCode}>{c.name} ({c.dialCode})</option>
                      ))}
                    </select>
                    <input type="text" value={form.mobileNumber} onChange={e => setField("mobileNumber", e.target.value)}
                      placeholder="e.g. 12-3456789" className={INPUT_BASE} style={{ ...inputBorder(), flex: 1 }} />
                  </div>
                </div>

                {/* Demographics */}
                <div>
                  <p style={sectionTitle}>Demographics</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={labelStyle}>Nationality <span style={{ color: "var(--red)" }}>*</span></label>
                      <select value={form.nationality} onChange={e => setField("nationality", e.target.value)}
                        className={SELECT_BASE} style={{ ...inputBorder(), appearance: "auto" }}>
                        <option value="">Select…</option>
                        {COUNTRY_NAMES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Gender <span style={{ color: "var(--red)" }}>*</span></label>
                      <select value={form.gender} onChange={e => setField("gender", e.target.value)}
                        className={SELECT_BASE} style={{ ...inputBorder(), appearance: "auto" }}>
                        <option value="">Select…</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <label style={labelStyle}>Date of Birth <span style={{ color: "var(--red)" }}>*</span></label>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <input type="date" value={form.dateOfBirth} onChange={e => setField("dateOfBirth", e.target.value)}
                        max={new Date().toISOString().split("T")[0]}
                        className={INPUT_BASE} style={{ ...inputBorder(), flex: 1 }} />
                      {age !== null && (
                        <span style={{ fontSize: 13, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{age} years old</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* MMA */}
                <div>
                  <p style={sectionTitle}>MMA Membership</p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>
                    Required for MMA CPD submission after the event.
                  </p>
                  <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                    {[{ value: "mma", label: "MMA Member" }, { value: "non_mma", label: "Non-MMA Member" }].map(opt => (
                      <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 8, cursor: "pointer", border: form.isMmaMember === opt.value ? "2px solid var(--primary)" : "1px solid var(--border-color)", background: form.isMmaMember === opt.value ? "var(--primary-lt)" : "var(--bg-surface)", fontSize: 13 }}>
                        <input type="radio" name="isMmaMember" value={opt.value}
                          checked={form.isMmaMember === opt.value} onChange={e => setField("isMmaMember", e.target.value as "mma" | "non_mma")} />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                  {form.isMmaMember === "mma" && (
                    <div>
                      <label style={labelStyle}>MMC Number <span style={{ color: "var(--red)" }}>*</span></label>
                      <input type="text" value={form.mmcNumber}
                        onChange={e => setField("mmcNumber", e.target.value.replace(/[^a-zA-Z0-9]/g, ""))}
                        placeholder="Alphanumeric, e.g. MMC12345" className={INPUT_BASE} style={inputBorder()} />
                      <p style={{ fontSize: 11, marginTop: 4, color: "var(--text-disabled)" }}>Alphanumeric characters only.</p>
                    </div>
                  )}
                </div>

                {/* Affiliation */}
                <div>
                  <p style={sectionTitle}>Affiliation</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={labelStyle}>Institution / Organisation</label>
                      <input type="text" value={form.institution} onChange={e => setField("institution", e.target.value)}
                        placeholder="e.g. University of Malaya" className={INPUT_BASE} style={inputBorder()} />
                    </div>
                    <div>
                      <label style={labelStyle}>Country</label>
                      <select value={form.country} onChange={e => setField("country", e.target.value)}
                        className={SELECT_BASE} style={{ ...inputBorder(), appearance: "auto" }}>
                        <option value="">Select country…</option>
                        {COUNTRY_NAMES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 4 }}>
                  <button type="submit" disabled={updateMutation.isPending} className="btn btn-primary">
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
            <div className="card-header"><div className="card-title">Account Information</div></div>
            <div className="card-body">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  { label: "Account Type", value: user?.role === "admin" ? "Administrator" : "Delegate" },
                  { label: "Member Since", value: user ? new Date(user.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : "—" },
                  { label: "Category", value: user?.category ? user.category.replace(/_/g, " ") : "Not set" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.4px", color: "var(--text-disabled)", marginBottom: 2 }}>{label}</div>
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
