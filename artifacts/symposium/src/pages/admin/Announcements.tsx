import React from "react";
import AdminLayout from "@/components/AdminLayout";
import { useGetAnnouncements, useCreateAnnouncement, useUpdateAnnouncement, useDeleteAnnouncement } from "@workspace/api-client-react";
import { Plus, Pencil, Trash2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FormField, ModalShell, ConfirmDialog, INPUT_BASE, TEXTAREA_BASE, inputBorder } from "@/components/ui/form-primitives";

export default function AdminAnnouncements() {
  const { data: announcements, refetch } = useGetAnnouncements();
  const createMutation = useCreateAnnouncement();
  const updateMutation = useUpdateAnnouncement();
  const deleteMutation = useDeleteAnnouncement();
  const { toast } = useToast();

  const [showModal, setShowModal] = React.useState(false);
  const [editId, setEditId] = React.useState<number | null>(null);
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [important, setImportant] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [deleteId, setDeleteId] = React.useState<number | null>(null);

  const openCreate = () => {
    setEditId(null); setTitle(""); setBody(""); setImportant(false); setErrors({}); setShowModal(true);
  };
  const openEdit = (a: NonNullable<typeof announcements>[0]) => {
    setEditId(a.id); setTitle(a.title); setBody(a.body); setImportant(a.important ?? false); setErrors({}); setShowModal(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Title is required";
    if (!body.trim()) e.body = "Message body is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = () => {
    if (!validate()) return;
    const data = { title, body, important };
    const onSuccess = () => {
      refetch(); setShowModal(false);
      toast({ title: editId ? "Announcement updated" : "Announcement published" });
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
      onSuccess: () => { refetch(); setDeleteId(null); toast({ title: "Announcement deleted" }); },
      onError: () => toast({ title: "Delete failed", variant: "destructive" }),
    });
  };

  return (
    <AdminLayout title="Announcements">
      <div className="flex justify-between items-center mb-5">
        <div className="text-[13px]" style={{ color: "#6c757d" }}>
          {announcements?.length ?? 0} announcements
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold text-white"
          style={{ background: "#0E6E74" }}
        >
          <Plus className="w-4 h-4" /> New Announcement
        </button>
      </div>

      <div className="space-y-3">
        {(announcements ?? []).length === 0 ? (
          <div className="text-center py-12 text-[14px]" style={{ color: "#adb5bd" }}>
            No announcements yet. Create the first one.
          </div>
        ) : (
          [...(announcements ?? [])].reverse().map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-xl p-5"
              style={{
                border: `1px solid ${a.important ? "#f0d9a0" : "#e9ecef"}`,
                background: a.important ? "#fffef9" : "#fff",
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {a.important && (
                      <span
                        className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: "#FDF6E8", color: "#8a6a24" }}
                      >
                        <AlertCircle className="w-3 h-3" /> Important
                      </span>
                    )}
                    <span className="text-[11px]" style={{ color: "#adb5bd" }}>
                      {new Date(a.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </div>
                  <div className="text-[15px] font-semibold mb-1" style={{ color: "#0B2744" }}>{a.title}</div>
                  <div className="text-[13px] leading-relaxed whitespace-pre-wrap" style={{ color: "#495057" }}>{a.body}</div>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => openEdit(a)}
                    className="p-2 rounded-lg transition-colors hover:bg-gray-50"
                    style={{ border: "1px solid #e9ecef", color: "#495057" }}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(a.id)}
                    className="p-2 rounded-lg transition-colors hover:bg-red-50"
                    style={{ border: "1px solid #f8d7da", color: "#842029" }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <ModalShell
          title={editId ? "Edit Announcement" : "Compose Announcement"}
          onClose={() => setShowModal(false)}
          footer={
            <>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 rounded-lg text-[13px] font-medium transition-colors hover:bg-gray-50"
                style={{ border: "1px solid #e9ecef", color: "#6c757d" }}
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-5 py-2.5 rounded-lg text-[13px] font-semibold text-white disabled:opacity-60"
                style={{ background: "#0E6E74" }}
              >
                {editId ? "Save Changes" : "Publish to All Delegates"}
              </button>
            </>
          }
        >
          <FormField label="Title" required error={errors.title}>
            <input
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: "" })); }}
              placeholder="e.g. Abstract Submission Deadline Extended"
              className={INPUT_BASE}
              style={inputBorder(errors.title)}
            />
          </FormField>

          <FormField label="Message" required error={errors.body}>
            <textarea
              value={body}
              onChange={(e) => { setBody(e.target.value); setErrors((p) => ({ ...p, body: "" })); }}
              rows={6}
              placeholder="Write your announcement here…"
              className={TEXTAREA_BASE}
              style={{ ...inputBorder(errors.body), lineHeight: 1.7 }}
            />
          </FormField>

          <div
            className="flex items-start gap-3 p-4 rounded-xl cursor-pointer select-none transition-colors"
            style={{
              border: `1px solid ${important ? "#f0d9a0" : "#dee2e6"}`,
              background: important ? "#fffef9" : "#fff",
            }}
            onClick={() => setImportant((v) => !v)}
          >
            <input
              type="checkbox"
              checked={important}
              onChange={(e) => setImportant(e.target.checked)}
              onClick={(e) => e.stopPropagation()}
              className="mt-0.5 w-4 h-4 rounded flex-shrink-0"
              style={{ accentColor: "#C89B3C" }}
            />
            <div>
              <div className="text-[13px] font-semibold" style={{ color: "#212529" }}>Mark as Important</div>
              <div className="text-[12px] mt-0.5" style={{ color: "#6c757d" }}>
                Highlighted with a gold banner in the delegate portal
              </div>
            </div>
          </div>
        </ModalShell>
      )}

      {deleteId && (
        <ConfirmDialog
          title="Delete Announcement?"
          message="This announcement will be removed from all delegate portals immediately."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleteMutation.isPending}
        />
      )}
    </AdminLayout>
  );
}
