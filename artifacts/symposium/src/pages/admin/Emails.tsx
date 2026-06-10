import React from "react";
import AdminLayout from "@/components/AdminLayout";
import { useGetAnnouncements, useCreateAnnouncement, useUpdateAnnouncement, useDeleteAnnouncement } from "@workspace/api-client-react";
import { Plus, Pencil, Trash2, X, AlertCircle, Mail, Send, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AUDIENCE_OPTIONS = [
  { value: "all", label: "All delegates", desc: "Everyone registered" },
  { value: "paid", label: "Paid only", desc: "Delegates with confirmed payment" },
  { value: "pending", label: "Payment pending", desc: "Delegates awaiting payment" },
  { value: "abstract_submitters", label: "Abstract submitters", desc: "Delegates who submitted abstracts" },
];

export default function AdminEmails() {
  const { data: announcements, refetch } = useGetAnnouncements();
  const createMutation = useCreateAnnouncement();
  const updateMutation = useUpdateAnnouncement();
  const deleteMutation = useDeleteAnnouncement();
  const { toast } = useToast();

  const [showForm, setShowForm] = React.useState(false);
  const [editId, setEditId] = React.useState<number | null>(null);
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [important, setImportant] = React.useState(false);
  const [audience, setAudience] = React.useState("all");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [deleteId, setDeleteId] = React.useState<number | null>(null);

  const openCreate = () => { setEditId(null); setTitle(""); setBody(""); setImportant(false); setAudience("all"); setErrors({}); setShowForm(true); };
  const openEdit = (a: NonNullable<typeof announcements>[0]) => {
    setEditId(a.id); setTitle(a.title); setBody(a.body); setImportant(a.important ?? false); setAudience("all"); setErrors({}); setShowForm(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Required";
    if (!body.trim()) e.body = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = () => {
    if (!validate()) return;
    const data = { title, body, important, audience };
    const audienceLabel = AUDIENCE_OPTIONS.find((o) => o.value === audience)?.label ?? "all delegates";
    const onSuccess = () => {
      refetch();
      setShowForm(false);
      toast({ title: editId ? "Announcement updated" : `Email sent to ${audienceLabel}` });
    };
    const onError = () => toast({ title: "Save failed", variant: "destructive" });
    if (editId) {
      updateMutation.mutate({ id: editId, data }, { onSuccess, onError });
    } else {
      createMutation.mutate({ data }, { onSuccess, onError });
    }
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate({ id: deleteId }, {
      onSuccess: () => { refetch(); setDeleteId(null); toast({ title: "Email deleted" }); },
      onError: () => toast({ title: "Delete failed", variant: "destructive" }),
    });
  };

  return (
    <AdminLayout title="Emails">
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-3">
          <div className="text-[13px]" style={{ color: "#6c757d" }}>{announcements?.length ?? 0} emails / announcements</div>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold text-white" style={{ background: "#0E6E74" }}>
          <Plus className="w-4 h-4" /> Compose Email
        </button>
      </div>

      {/* Compose / Edit form */}
      {showForm && (
        <div className="bg-white rounded-xl p-6 mb-5" style={{ border: "1px solid #e9ecef" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-semibold flex items-center gap-2" style={{ color: "#0B2744" }}>
              <Mail className="w-4 h-4" />
              {editId ? "Edit Email / Announcement" : "Compose Email"}
            </h3>
            <button onClick={() => setShowForm(false)}><X className="w-5 h-5" style={{ color: "#6c757d" }} /></button>
          </div>
          <div className="space-y-4">
            {/* Audience selector */}
            {!editId && (
              <div>
                <label className="block text-[12px] font-medium mb-2" style={{ color: "#495057" }}>
                  <Users className="w-3.5 h-3.5 inline mr-1" /> Send to
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {AUDIENCE_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-start gap-2.5 p-3 rounded-lg cursor-pointer"
                      style={{ border: `2px solid ${audience === opt.value ? "#0E6E74" : "#dee2e6"}`, background: audience === opt.value ? "#f0fafb" : "#fff" }}
                    >
                      <input type="radio" name="audience" value={opt.value} checked={audience === opt.value} onChange={() => setAudience(opt.value)} className="mt-0.5 w-3.5 h-3.5 flex-shrink-0" style={{ accentColor: "#0E6E74" }} />
                      <div>
                        <div className="text-[12px] font-semibold" style={{ color: "#212529" }}>{opt.label}</div>
                        <div className="text-[11px]" style={{ color: "#6c757d" }}>{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-[12px] font-medium mb-1" style={{ color: "#495057" }}>Subject / Title *</label>
              <input value={title} onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: "" })); }} placeholder="e.g. Abstract Acceptance Notification" className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none" style={{ border: `1px solid ${errors.title ? "#dc3545" : "#dee2e6"}` }} />
              {errors.title && <p className="text-[11px] mt-0.5" style={{ color: "#dc3545" }}>{errors.title}</p>}
            </div>
            <div>
              <label className="block text-[12px] font-medium mb-1" style={{ color: "#495057" }}>Message *</label>
              <textarea value={body} onChange={(e) => { setBody(e.target.value); setErrors((p) => ({ ...p, body: "" })); }} rows={7} placeholder="Write your message here…" className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none resize-none" style={{ border: `1px solid ${errors.body ? "#dc3545" : "#dee2e6"}`, lineHeight: 1.7 }} />
              {errors.body && <p className="text-[11px] mt-0.5" style={{ color: "#dc3545" }}>{errors.body}</p>}
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={important} onChange={(e) => setImportant(e.target.checked)} className="w-4 h-4 rounded" style={{ accentColor: "#C89B3C" }} />
              <span className="text-[13px]" style={{ color: "#495057" }}>Mark as important (shown prominently on delegate portals)</span>
            </label>
          </div>
          <div className="flex justify-end gap-2 mt-5 pt-4" style={{ borderTop: "1px solid #f1f3f5" }}>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-[13px]" style={{ border: "1px solid #e9ecef", color: "#6c757d" }}>Cancel</button>
            <button onClick={save} disabled={createMutation.isPending || updateMutation.isPending} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold text-white" style={{ background: "#0E6E74" }}>
              <Send className="w-4 h-4" />
              {editId ? "Save Changes" : `Send to ${AUDIENCE_OPTIONS.find((o) => o.value === audience)?.label ?? "all"}`}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {(announcements ?? []).length === 0 ? (
          <div className="text-center py-16">
            <Mail className="w-12 h-12 mx-auto mb-3" style={{ color: "#dee2e6" }} />
            <div className="text-[14px] mb-1 font-medium" style={{ color: "#6c757d" }}>No emails sent yet</div>
            <div className="text-[12px] mb-4" style={{ color: "#adb5bd" }}>Compose your first announcement to delegates</div>
            <button onClick={openCreate} className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white" style={{ background: "#0E6E74" }}>Compose Email</button>
          </div>
        ) : [...(announcements ?? [])].reverse().map((a) => (
          <div key={a.id} className="bg-white rounded-xl p-5" style={{ border: `1px solid ${a.important ? "#f0d9a0" : "#e9ecef"}`, background: a.important ? "#fffef9" : "#fff" }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full" style={{ background: "#e6f4f5", color: "#0E6E74" }}>
                    <Send className="w-3 h-3" /> Sent
                  </span>
                  {a.important && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#FDF6E8", color: "#8a6a24" }}>
                      <AlertCircle className="w-3 h-3" /> Important
                    </span>
                  )}
                  <span className="text-[11px]" style={{ color: "#adb5bd" }}>
                    {new Date(a.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </div>
                <div className="text-[15px] font-semibold mb-1" style={{ color: "#0B2744" }}>{a.title}</div>
                <div className="text-[13px] leading-relaxed whitespace-pre-wrap line-clamp-3" style={{ color: "#495057" }}>{a.body}</div>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <button onClick={() => openEdit(a)} className="p-2 rounded-lg" style={{ border: "1px solid #e9ecef", color: "#495057" }}><Pencil className="w-4 h-4" /></button>
                <button onClick={() => setDeleteId(a.id)} className="p-2 rounded-lg" style={{ border: "1px solid #f8d7da", color: "#842029" }}><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl p-6">
            <h3 className="text-[16px] font-semibold mb-2" style={{ color: "#0B2744" }}>Delete Email?</h3>
            <p className="text-[13px] mb-5" style={{ color: "#6c757d" }}>This will be removed from all delegate portals.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-lg text-[13px]" style={{ border: "1px solid #e9ecef", color: "#6c757d" }}>Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white" style={{ background: "#dc3545" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
