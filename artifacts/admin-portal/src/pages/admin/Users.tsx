import React, { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import {
  useListAdminUsers,
  useUpdateAdminName,
  getListAdminUsersQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil, Check, X, Shield, ShieldCheck } from "lucide-react";

function RoleBadge({ role }: { role: string }) {
  if (role === "super_admin") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#C89B3C]/15 text-[#a07820]">
        <ShieldCheck className="w-3 h-3" />
        Super Admin
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#0E6E74]/10 text-[#0E6E74]">
      <Shield className="w-3 h-3" />
      Admin
    </span>
  );
}

interface EditState {
  id: number;
  firstName: string;
  lastName: string;
}

export default function AdminUsers() {
  const { data: users, isLoading, isError } = useListAdminUsers();
  const updateName = useUpdateAdminName();
  const queryClient = useQueryClient();

  const [editing, setEditing] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function startEdit(user: { id: number; firstName: string; lastName: string }) {
    setEditing({ id: user.id, firstName: user.firstName, lastName: user.lastName });
    setErrorMsg(null);
  }

  function cancelEdit() {
    setEditing(null);
    setErrorMsg(null);
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    setErrorMsg(null);
    try {
      await updateName.mutateAsync({
        id: editing.id,
        data: { firstName: editing.firstName, lastName: editing.lastName },
      });
      await queryClient.invalidateQueries({ queryKey: getListAdminUsersQueryKey() });
      setEditing(null);
    } catch {
      setErrorMsg("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout>
      <div className="p-8 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin Accounts</h1>
          <p className="text-sm text-gray-500">
            View all admin and super admin accounts. You can edit any admin's display name.
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
            Loading accounts…
          </div>
        )}

        {isError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Failed to load admin accounts. Please refresh the page.
          </div>
        )}

        {users && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 w-8">#</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Name</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Email</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Role</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Joined</th>
                  <th className="px-5 py-3 w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user, idx) => {
                  const isEditingThis = editing?.id === user.id;
                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 text-gray-400">{idx + 1}</td>
                      <td className="px-5 py-3.5">
                        {isEditingThis ? (
                          <div className="flex items-center gap-2">
                            <input
                              className="border border-gray-300 rounded px-2 py-1 text-sm w-28 focus:outline-none focus:ring-1 focus:ring-[#0B2744]"
                              value={editing.firstName}
                              onChange={(e) =>
                                setEditing((prev) => prev ? { ...prev, firstName: e.target.value } : prev)
                              }
                              placeholder="First name"
                              disabled={saving}
                            />
                            <input
                              className="border border-gray-300 rounded px-2 py-1 text-sm w-28 focus:outline-none focus:ring-1 focus:ring-[#0B2744]"
                              value={editing.lastName}
                              onChange={(e) =>
                                setEditing((prev) => prev ? { ...prev, lastName: e.target.value } : prev)
                              }
                              placeholder="Last name"
                              disabled={saving}
                            />
                          </div>
                        ) : (
                          <span className="font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </span>
                        )}
                        {isEditingThis && errorMsg && (
                          <p className="text-xs text-red-600 mt-1">{errorMsg}</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">{user.email}</td>
                      <td className="px-5 py-3.5">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-5 py-3.5 text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString("en-MY", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-3.5">
                        {isEditingThis ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={saveEdit}
                              disabled={saving}
                              className="p-1.5 rounded hover:bg-green-50 text-green-600 hover:text-green-700 transition-colors disabled:opacity-50"
                              title="Save"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              disabled={saving}
                              className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEdit(user)}
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-[#0B2744] transition-colors"
                            title="Edit name"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-400">
              {users.length} account{users.length !== 1 ? "s" : ""}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
