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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#adb5bd" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, or institution…" className="w-full pl-9 pr-3 py-2.5 rounded-lg text-[13px] outline-none" style={{ border: "1px solid #dee2e6" }} />
        </div>
        <div className="flex gap-2">
          {["all", "attendee", "admin"].map((r) => (
            <button key={r} onClick={() => setRoleFilter(r)} className="px-3 py-2.5 rounded-lg text-[12px] font-medium capitalize" style={{ background: roleFilter === r ? "#0B2744" : "#e9ecef", color: roleFilter === r ? "#fff" : "#495057" }}>
              {r === "all" ? "All" : r}
            </button>
          ))}
        </div>
      </div>

      <div className="text-[12px] mb-3" style={{ color: "#6c757d" }}>
        {filtered.length} of {users?.length ?? 0} users · {users?.filter((u) => u.role === "admin").length ?? 0} admins
      </div>

      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #e9ecef" }}>
        <table className="w-full">
          <thead style={{ background: "#f8f9fa" }}>
            <tr>
              {["User", "Institution", "Country", "Category", "Role", "Joined", "Actions"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "#6c757d", borderBottom: "1px solid #e9ecef" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-[13px]" style={{ color: "#adb5bd" }}>No users found</td></tr>
            ) : filtered.map((u) => (
              <tr key={u.id} style={{ borderBottom: "1px solid #f1f3f5" }}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                      style={{ background: u.role === "admin" ? "#C89B3C" : "#0E6E74" }}
                    >
                      {u.firstName[0]}{u.lastName[0]}
                    </div>
                    <div>
                      <div className="text-[13px] font-medium" style={{ color: "#212529" }}>{u.firstName} {u.lastName}</div>
                      <div className="text-[11px]" style={{ color: "#adb5bd" }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-[13px]" style={{ color: "#495057" }}>{u.institution ?? "—"}</td>
                <td className="px-4 py-3 text-[13px]" style={{ color: "#495057" }}>{u.country ?? "—"}</td>
                <td className="px-4 py-3 text-[12px] capitalize" style={{ color: "#495057" }}>{u.category?.replace(/_/g, " ") ?? "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize"
                    style={u.role === "admin"
                      ? { background: "rgba(200,155,60,0.15)", color: "#C89B3C" }
                      : { background: "#e9ecef", color: "#6c757d" }
                    }
                  >
                    {u.role === "admin" ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-[12px]" style={{ color: "#adb5bd" }}>{new Date(u.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleRole(u.id, u.role)}
                    disabled={updateMutation.isPending}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-medium"
                    style={u.role === "admin"
                      ? { border: "1px solid #f8d7da", color: "#842029" }
                      : { border: "1px solid rgba(200,155,60,0.4)", color: "#8a6a24" }
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
    </AdminLayout>
  );
}
