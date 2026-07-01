import React from "react";
import AdminLayout from "@/components/AdminLayout";
import { useGetUsers, useFullUpdateUser } from "@workspace/api-client-react";
import { Search, Shield, ShieldCheck, User, Pencil, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { INPUT_BASE, SELECT_BASE, TEXTAREA_BASE, inputBorder, FormField, ModalShell } from "@/components/ui/form-primitives";

type AnyUser = Record<string, unknown>;

const ROLE_STYLES: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
  super_admin: { bg: "var(--gold-lt, rgba(200,155,60,0.15))", color: "var(--gold-dk, #a07820)", icon: <ShieldCheck className="w-3 h-3" /> },
  admin: { bg: "var(--primary-lt)", color: "var(--primary)", icon: <Shield className="w-3 h-3" /> },
  attendee: { bg: "var(--border-color)", color: "var(--text-muted)", icon: <User className="w-3 h-3" /> },
};

interface EditUserForm {
  salutation: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  dateOfBirth: string;
  nationality: string;
  mobileCountryCode: string;
  mobileNumber: string;
  institution: string;
  country: string;
  category: string;
  isMmaMember: string;
  mmcNumber: string;
  role: string;
}

function toEditForm(u: AnyUser): EditUserForm {
  return {
    salutation: String(u.salutation ?? ""),
    firstName: String(u.firstName ?? ""),
    lastName: String(u.lastName ?? ""),
    email: String(u.email ?? ""),
    gender: String(u.gender ?? ""),
    dateOfBirth: u.dateOfBirth ? String(u.dateOfBirth).slice(0, 10) : "",
    nationality: String(u.nationality ?? ""),
    mobileCountryCode: String(u.mobileCountryCode ?? ""),
    mobileNumber: String(u.mobileNumber ?? ""),
    institution: String(u.institution ?? ""),
    country: String(u.country ?? ""),
    category: String(u.category ?? ""),
    isMmaMember: u.isMmaMember === true ? "true" : u.isMmaMember === false ? "false" : "",
    mmcNumber: String(u.mmcNumber ?? ""),
    role: String(u.role ?? "attendee"),
  };
}

function EditUserModal({ user, onClose, onSaved }: { user: AnyUser; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = React.useState<EditUserForm>(() => toEditForm(user));
  const mutation = useFullUpdateUser();
  const { toast } = useToast();

  const set = (k: keyof EditUserForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      toast({ title: "First name, last name and email are required", variant: "destructive" });
      return;
    }
    mutation.mutate(
      {
        id: user.id as number,
        data: {
          salutation: form.salutation || null,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          gender: form.gender || null,
          dateOfBirth: form.dateOfBirth || null,
          nationality: form.nationality || null,
          mobileCountryCode: form.mobileCountryCode || null,
          mobileNumber: form.mobileNumber || null,
          institution: form.institution || null,
          country: form.country || null,
          category: form.category || null,
          isMmaMember: form.isMmaMember === "true" ? true : form.isMmaMember === "false" ? false : null,
          mmcNumber: form.mmcNumber || null,
          role: form.role,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "User updated" });
          onSaved();
          onClose();
        },
        onError: () => toast({ title: "Update failed", variant: "destructive" }),
      }
    );
  };

  return (
    <ModalShell
      title={`Edit User — ${form.firstName} ${form.lastName}`}
      onClose={onClose}
      size="xl"
      footer={
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
          <button
            type="submit"
            form="edit-user-form"
            disabled={mutation.isPending}
            className="btn btn-primary flex items-center gap-2 disabled:opacity-60"
          >
            {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      }
    >
      <form id="edit-user-form" onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>Identity</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Salutation">
              <select value={form.salutation} onChange={set("salutation")} className={SELECT_BASE} style={inputBorder()}>
                <option value="">— Select —</option>
                {["Dr.", "Prof.", "Assoc. Prof.", "Mr.", "Mrs.", "Ms.", "Other"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Gender">
              <select value={form.gender} onChange={set("gender")} className={SELECT_BASE} style={inputBorder()}>
                <option value="">— Select —</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <FormField label="First Name" required>
              <input value={form.firstName} onChange={set("firstName")} className={INPUT_BASE} style={inputBorder()} />
            </FormField>
            <FormField label="Last Name" required>
              <input value={form.lastName} onChange={set("lastName")} className={INPUT_BASE} style={inputBorder()} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <FormField label="Email Address" required>
              <input type="email" value={form.email} onChange={set("email")} className={INPUT_BASE} style={inputBorder()} />
            </FormField>
            <FormField label="Date of Birth">
              <input type="date" value={form.dateOfBirth} onChange={set("dateOfBirth")} className={INPUT_BASE} style={inputBorder()} />
            </FormField>
          </div>
          <div className="mt-4">
            <FormField label="Nationality">
              <input value={form.nationality} onChange={set("nationality")} placeholder="e.g. Malaysian" className={INPUT_BASE} style={inputBorder()} />
            </FormField>
          </div>
        </div>

        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>Contact & Affiliation</h3>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Mobile Country Code">
              <input value={form.mobileCountryCode} onChange={set("mobileCountryCode")} placeholder="+60" className={INPUT_BASE} style={inputBorder()} />
            </FormField>
            <div className="col-span-2">
              <FormField label="Mobile Number">
                <input value={form.mobileNumber} onChange={set("mobileNumber")} placeholder="12-345 6789" className={INPUT_BASE} style={inputBorder()} />
              </FormField>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <FormField label="Institution">
              <input value={form.institution} onChange={set("institution")} placeholder="e.g. University of Malaya" className={INPUT_BASE} style={inputBorder()} />
            </FormField>
            <FormField label="Country">
              <input value={form.country} onChange={set("country")} placeholder="e.g. Malaysia" className={INPUT_BASE} style={inputBorder()} />
            </FormField>
          </div>
          <div className="mt-4">
            <FormField label="Category" hint="Registration category slug">
              <input value={form.category} onChange={set("category")} placeholder="e.g. specialist_member" className={INPUT_BASE} style={inputBorder()} />
            </FormField>
          </div>
        </div>

        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>Membership</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="MMA Member">
              <select value={form.isMmaMember} onChange={set("isMmaMember")} className={SELECT_BASE} style={inputBorder()}>
                <option value="">— Not specified —</option>
                <option value="true">Yes — MMA Member</option>
                <option value="false">No</option>
              </select>
            </FormField>
            {form.isMmaMember === "true" && (
              <FormField label="MMC Number">
                <input value={form.mmcNumber} onChange={set("mmcNumber")} placeholder="e.g. 12345" className={INPUT_BASE} style={inputBorder()} />
              </FormField>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>System Role</h3>
          <FormField label="Role" hint="Controls access level in the admin portal">
            <select value={form.role} onChange={set("role")} className={SELECT_BASE} style={inputBorder()}>
              <option value="attendee">Attendee — no admin access</option>
              <option value="admin">Admin — manage content &amp; registrations</option>
              <option value="super_admin">Super Admin — full access including user management</option>
            </select>
          </FormField>
        </div>
      </form>
    </ModalShell>
  );
}

export default function AdminUsers() {
  const { data: usersRaw, refetch } = useGetUsers();
  const users = (usersRaw ?? []) as AnyUser[];
  const { toast } = useToast();
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("all");
  const [editingUser, setEditingUser] = React.useState<AnyUser | null>(null);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
      String(u.email ?? "").toLowerCase().includes(q) ||
      String(u.institution ?? "").toLowerCase().includes(q);
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <AdminLayout title="Users">
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-disabled)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or institution…"
            className={`${INPUT_BASE} pl-9`}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "attendee", "admin", "super_admin"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`btn btn-sm capitalize ${roleFilter === r ? "btn-primary" : "btn-outline"}`}
            >
              {r === "all" ? "All" : r.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="text-[12px] mb-3" style={{ color: "var(--text-muted)" }}>
        {filtered.length} of {users.length} users
        {" · "}
        {users.filter((u) => u.role === "super_admin").length} super admins
        {" · "}
        {users.filter((u) => u.role === "admin").length} admins
        {" · "}
        {users.filter((u) => u.role === "attendee").length} attendees
      </div>

      <div className="card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  {["User", "Institution", "Country", "Category", "Mobile", "MMA", "Role", "Joined", "Actions"].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-[13px]" style={{ color: "var(--text-disabled)" }}>
                      No users found
                    </td>
                  </tr>
                ) : filtered.map((u) => {
                  const roleStyle = ROLE_STYLES[String(u.role)] ?? ROLE_STYLES.attendee;
                  const initials = `${String(u.firstName ?? " ")[0]}${String(u.lastName ?? " ")[0]}`.toUpperCase();
                  const isMma = u.isMmaMember as boolean | null | undefined;
                  return (
                    <tr key={u.id as number}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                            style={{
                              background: u.role === "super_admin"
                                ? "var(--gold-dk, #a07820)"
                                : u.role === "admin"
                                ? "var(--primary)"
                                : "var(--teal)",
                            }}
                          >
                            {initials}
                          </div>
                          <div>
                            <div className="cell-strong">{String(u.firstName ?? "")} {String(u.lastName ?? "")}</div>
                            <div className="text-[11px]" style={{ color: "var(--text-disabled)" }}>{String(u.email ?? "")}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: "var(--text-secondary)" }}>{String(u.institution ?? "") || "—"}</td>
                      <td style={{ color: "var(--text-secondary)" }}>{String(u.country ?? "") || "—"}</td>
                      <td className="text-[12px] capitalize" style={{ color: "var(--text-secondary)" }}>
                        {String(u.category ?? "").replace(/_/g, " ") || "—"}
                      </td>
                      <td className="text-[12px]" style={{ color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                        {u.mobileCountryCode && u.mobileNumber
                          ? `${u.mobileCountryCode} ${u.mobileNumber}`
                          : "—"}
                      </td>
                      <td className="text-[12px]">
                        {isMma === true ? (
                          <span style={{ color: "var(--green, #16a34a)", fontWeight: 600 }}>Yes</span>
                        ) : isMma === false ? (
                          <span style={{ color: "var(--text-muted)" }}>No</span>
                        ) : (
                          <span style={{ color: "var(--text-disabled)" }}>—</span>
                        )}
                      </td>
                      <td>
                        <span
                          className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize"
                          style={{ background: roleStyle.bg, color: roleStyle.color }}
                        >
                          {roleStyle.icon}
                          {String(u.role ?? "").replace("_", " ")}
                        </span>
                      </td>
                      <td className="cell-mono">
                        {new Date(String(u.createdAt ?? "")).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td>
                        <button
                          onClick={() => setEditingUser(u)}
                          className="btn btn-outline btn-sm flex items-center gap-1.5 text-[12px]"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={() => { refetch(); setEditingUser(null); }}
        />
      )}
    </AdminLayout>
  );
}
