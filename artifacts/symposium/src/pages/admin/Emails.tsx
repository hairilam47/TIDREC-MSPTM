import React from "react";
import AdminLayout from "@/components/AdminLayout";
import { useGetAnnouncements, useCreateAnnouncement, useUpdateAnnouncement, useDeleteAnnouncement } from "@workspace/api-client-react";
import { Plus, Pencil, Trash2, X, AlertCircle, Mail, Send, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FormField, ConfirmDialog, INPUT_BASE, TEXTAREA_BASE, inputBorder } from "@/components/ui/form-primitives";

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
          <div className="text-[13px]" style={{ color: "var(--text-muted)" }}>{announcements?.length ?? 0} emails / announcements</div>
        </div>
        <button onClick={openCreate} className="btn btn-primary">
          <Plus className="w-4 h-4" /> Compose Email
        </button>
      </div>

      {/* Compose / Edit form */}
      {showForm && (
        <div className="card mb-5">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold flex items-center gap-2" style={{ color: "var(--navy)" }}>
                <Mail className="w-4 h-4" />
                {editId ? "Edit Email / Announcement" : "Compose Email"}
              </h3>
              <button onClick={() => setShowForm(false)} className="btn btn-ghost btn-sm" style={{ padding: "4px" }}>
                <X className="w-5 h-5" style={{ color: "var(--text-muted)" }} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Audience selector */}
              {!editId && (
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    <Users className="w-3.5 h-3.5 inline mr-1" /> Send to
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {AUDIENCE_OPTIONS.map((opt) => (
                      <label
                        key={opt.value}
                        className="flex items-start gap-2.5 p-3 rounded-lg cursor-pointer"
                        style={{
                          border: `2px solid ${audience === opt.value ? "var(--primary)" : "var(--border-color)"}`,
                          background: audience === opt.value ? "var(--primary-lt)" : "var(--bg-surface)",
                        }}
                      >
                        <input type="radio" name="audience" value={opt.value} checked={audience === opt.value} onChange={() => setAudience(opt.value)} className="mt-0.5 w-3.5 h-3.5 flex-shrink-0" style={{ accentColor: "var(--primary)" }} />
                        <div>
                          <div className="text-[12px] font-semibold" style={{ color: "var(--text)" }}>{opt.label}</div>
                          <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>{opt.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <FormField label="Subject / Title" required error={errors.title}>
                <input
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: "" })); }}
                  placeholder="e.g. Abstract Acceptance Notification"
                  className={INPUT_BASE}
                  style={inputBorder(errors.title)}
                />
              </FormField>

              <FormField label="Message" required error={errors.body}>
                <textarea
                  value={body}
                  onChange={(e) => { setBody(e.target.value); setErrors((p) => ({ ...p, body: "" })); }}
                  rows={7}
                  placeholder="Write your message here…"
                  className={TEXTAREA_BASE}
                  style={{ ...inputBorder(errors.body), lineHeight: 1.7 }}
                />
              </FormField>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={important} onChange={(e) => setImportant(e.target.checked)} className="w-4 h-4 rounded" style={{ accentColor: "var(--primary)" }} />
                <span className="text-[13px]" style={{ color: "var(--text-secondary)" }}>Mark as important (shown prominently on delegate portals)</span>
              </label>
            </div>
            <div className="flex justify-end gap-2 mt-5 pt-4" style={{ borderTop: "1px solid var(--border-color-light)" }}>
              <button onClick={() => setShowForm(false)} className="btn btn-outline btn-sm">Cancel</button>
              <button
                onClick={save}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="btn btn-primary btn-sm disabled:opacity-60"
              >
                <Send className="w-4 h-4" />
                {editId ? "Save Changes" : `Send to ${AUDIENCE_OPTIONS.find((o) => o.value === audience)?.label ?? "all"}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {(announcements ?? []).length === 0 ? (
          <div className="text-center py-16">
            <Mail className="w-12 h-12 mx-auto mb-3" style={{ color: "var(--border-color)" }} />
            <div className="text-[14px] mb-1 font-medium" style={{ color: "var(--text-muted)" }}>No emails sent yet</div>
            <div className="text-[12px] mb-4" style={{ color: "var(--text-disabled)" }}>Compose your first announcement to delegates</div>
            <button onClick={openCreate} className="btn btn-primary btn-sm">Compose Email</button>
          </div>
        ) : [...(announcements ?? [])].reverse().map((a) => (
          <div
            key={a.id}
            className="card"
            style={{
              borderColor: a.important ? "rgba(200,155,60,0.35)" : "var(--border-color)",
              background: a.important ? "var(--gold-lt)" : "var(--bg-surface)",
            }}
          >
            <div className="card-body">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full" style={{ background: "var(--status-success-bg)", color: "var(--status-success-text)" }}>
                      <Send className="w-3 h-3" /> Sent
                    </span>
                    {a.important && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "var(--gold-lt)", color: "var(--gold-dk)" }}>
                        <AlertCircle className="w-3 h-3" /> Important
                      </span>
                    )}
                    <span className="text-[11px]" style={{ color: "var(--text-disabled)" }}>
                      {new Date(a.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </div>
                  <div className="text-[15px] font-semibold mb-1" style={{ color: "var(--navy)" }}>{a.title}</div>
                  <div className="text-[13px] leading-relaxed whitespace-pre-wrap line-clamp-3" style={{ color: "var(--text-secondary)" }}>{a.body}</div>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => openEdit(a)} className="btn btn-outline btn-sm"><Pencil className="w-4 h-4" /></button>
                  <button
                    onClick={() => setDeleteId(a.id)}
                    className="btn btn-sm"
                    style={{ background: "var(--status-danger-bg)", color: "var(--status-danger-text)", borderColor: "var(--status-danger-border)" }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {deleteId && (
        <ConfirmDialog
          title="Delete Email?"
          message="This will be removed from all delegate portals."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleteMutation.isPending}
        />
      )}
    </AdminLayout>
  );
}
