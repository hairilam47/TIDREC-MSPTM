import React from "react";
import AdminLayout from "@/components/AdminLayout";
import { useGetUsers, useUpdateUser } from "@workspace/api-client-react";
import { Search, Shield, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminUsers() {
  const { data: users, refetch } = useGetUsers();
  const updateMutation = useUpdateUser();
  const { toast } = useToast();
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("all");

  const filtered = (users ?? []).filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = !q || `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.institution ?? "").toLowerCase().includes(q);
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const toggleRole = (id: number, currentRole: string) => {
    const newRole = currentRole === "admin" ? "attendee" : "admin";
    updateMutation.mutate(
      { id, data: { role: newRole as "admin" | "attendee" } },
      {
        onSuccess: () => { refetch(); toast({ title: `Role updated to ${newRole}` }); },
        onError: () => toast({ title: "Update failed", variant: "destructive" }),
      }
    );
  };

  return (
    <AdminLayout title="Users">
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-disabled)" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, or institution…" className="w-full pl-9 pr-3 py-2.5 rounded-lg text-[13px] outline-none" style={{ border: "1px solid var(--border-color)" }} />
        </div>
        <div className="flex gap-2">
          {["all", "attendee", "admin"].map((r) => (
            <button key={r} onClick={() => setRoleFilter(r)} className="px-3 py-2.5 rounded-lg text-[12px] font-medium capitalize" style={{ background: roleFilter === r ? "var(--text)" : "var(--border-color)", color: roleFilter === r ? "#fff" : "var(--text-secondary)" }}>
              {r === "all" ? "All" : r}
            </button>
          ))}
        </div>
      </div>

      <div className="text-[12px] mb-3" style={{ color: "var(--text-muted)" }}>
        {filtered.length} of {users?.length ?? 0} users · {users?.filter((u) => u.role === "admin").length ?? 0} admins
      </div>

      <div className="card">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  {["User", "Institution", "Country", "Category", "Role", "Joined", "Actions"].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-10 text-[13px]" style={{ color: "var(--text-disabled)" }}>No users found</td></tr>
                ) : filtered.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                          style={{ background: u.role === "admin" ? "var(--primary)" : "#0E6E74" }}
                        >
                          {u.firstName[0]}{u.lastName[0]}
                        </div>
                        <div>
                          <div className="text-[13px] font-medium" style={{ color: "var(--text)" }}>{u.firstName} {u.lastName}</div>
                          <div className="text-[11px]" style={{ color: "var(--text-disabled)" }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-[13px]" style={{ color: "var(--text-secondary)" }}>{u.institution ?? "—"}</td>
                    <td className="text-[13px]" style={{ color: "var(--text-secondary)" }}>{u.country ?? "—"}</td>
                    <td className="text-[12px] capitalize" style={{ color: "var(--text-secondary)" }}>{u.category?.replace(/_/g, " ") ?? "—"}</td>
                    <td>
                      <span
                        className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize"
                        style={u.role === "admin"
                          ? { background: "var(--primary-lt)", color: "var(--primary)" }
                          : { background: "var(--border-color)", color: "var(--text-muted)" }
                        }
                      >
                        {u.role === "admin" ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        {u.role}
                      </span>
                    </td>
                    <td className="text-[12px]" style={{ color: "var(--text-disabled)" }}>{new Date(u.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                    <td>
                      <button
                        onClick={() => toggleRole(u.id, u.role)}
                        disabled={updateMutation.isPending}
                        className="px-3 py-1.5 rounded-lg text-[11px] font-medium"
                        style={u.role === "admin"
                          ? { border: "1px solid #f8d7da", color: "#842029" }
                          : { border: "1px solid var(--primary-lt)", color: "var(--primary)" }
                        }
                      >
                        {u.role === "admin" ? "Remove Admin" : "Make Admin"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
