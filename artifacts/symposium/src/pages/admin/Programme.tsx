import React from "react";
import AdminLayout from "@/components/AdminLayout";
import { useGetSessions, useCreateSession, useUpdateSession, useDeleteSession, useGetSpeakers } from "@workspace/api-client-react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SessionInput, SessionInputSessionType } from "@workspace/api-client-react";

const BLANK: SessionInput = { title: "", day: 1, startTime: "09:00", endTime: "", room: "", sessionType: "keynote", description: "", speakerId: undefined };

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  keynote: { bg: "#FDF6E8", color: "#8a6a24" },
  panel: { bg: "#e6f4f5", color: "#0E6E74" },
  workshop: { bg: "rgba(11,39,68,0.06)", color: "#0B2744" },
  oral: { bg: "#d1e7dd", color: "#0a5c39" },
  poster: { bg: "#f8d7da", color: "#842029" },
  opening: { bg: "#e9ecef", color: "#495057" },
  closing: { bg: "#e9ecef", color: "#495057" },
};

export default function AdminProgramme() {
  const { data: sessions, refetch } = useGetSessions();
  const { data: speakers } = useGetSpeakers();
  const createMutation = useCreateSession();
  const updateMutation = useUpdateSession();
  const deleteMutation = useDeleteSession();
  const { toast } = useToast();
  const [showModal, setShowModal] = React.useState(false);
  const [editId, setEditId] = React.useState<number | null>(null);
  const [form, setForm] = React.useState<SessionInput>({ ...BLANK });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [deleteId, setDeleteId] = React.useState<number | null>(null);
  const [dayFilter, setDayFilter] = React.useState<number | "all">("all");

  const set = <K extends keyof SessionInput>(k: K, v: SessionInput[K]) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: "" })); };

  const filtered = (sessions ?? []).filter((s) => dayFilter === "all" || s.day === dayFilter).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const openCreate = () => { setEditId(null); setForm({ ...BLANK }); setErrors({}); setShowModal(true); };
  const openEdit = (s: NonNullable<typeof sessions>[0]) => {
    setEditId(s.id);
    setForm({ title: s.title, day: s.day, startTime: s.startTime, endTime: s.endTime ?? "", room: s.room ?? "", sessionType: s.sessionType, description: s.description ?? "", speakerId: s.speakerId ?? undefined });
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Required";
    if (!form.startTime) e.startTime = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = () => {
    if (!validate()) return;
    const data: SessionInput = { ...form, endTime: form.endTime || undefined, room: form.room || undefined, description: form.description || undefined, speakerId: form.speakerId ?? undefined };
    const onSuccess = () => { refetch(); setShowModal(false); toast({ title: editId ? "Session updated" : "Session created" }); };
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
      onSuccess: () => { refetch(); setDeleteId(null); toast({ title: "Session deleted" }); },
      onError: () => toast({ title: "Delete failed", variant: "destructive" }),
    });
  };

  const days = [...new Set((sessions ?? []).map((s) => s.day))].sort();

  return (
    <AdminLayout title="Programme">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex gap-2">
          <button onClick={() => setDayFilter("all")} className="px-3 py-1.5 rounded-lg text-[12px] font-medium" style={{ background: dayFilter === "all" ? "#0E6E74" : "#e9ecef", color: dayFilter === "all" ? "#fff" : "#495057" }}>All Days</button>
          {days.map((d) => (
            <button key={d} onClick={() => setDayFilter(d)} className="px-3 py-1.5 rounded-lg text-[12px] font-medium" style={{ background: dayFilter === d ? "#0E6E74" : "#e9ecef", color: dayFilter === d ? "#fff" : "#495057" }}>Day {d}</button>
          ))}
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold text-white" style={{ background: "#0E6E74" }}>
          <Plus className="w-4 h-4" /> Add Session
        </button>
      </div>

      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #e9ecef" }}>
        <table className="w-full">
          <thead style={{ background: "#f8f9fa" }}>
            <tr>
              {["Day", "Time", "Title", "Type", "Room", "Speaker", "Actions"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "#6c757d", borderBottom: "1px solid #e9ecef" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-[13px]" style={{ color: "#adb5bd" }}>No sessions yet</td></tr>
            ) : filtered.map((s) => {
              const tc = TYPE_COLORS[s.sessionType] ?? TYPE_COLORS.opening;
              return (
                <tr key={s.id} style={{ borderBottom: "1px solid #f1f3f5" }}>
                  <td className="px-4 py-3 text-[13px] font-medium" style={{ color: "#495057" }}>Day {s.day}</td>
                  <td className="px-4 py-3 text-[12px]" style={{ color: "#6c757d" }}>{s.startTime}{s.endTime ? `–${s.endTime}` : ""}</td>
                  <td className="px-4 py-3 text-[13px] font-medium max-w-xs" style={{ color: "#212529" }}>{s.title}</td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize" style={{ background: tc.bg, color: tc.color }}>{s.sessionType}</span>
                  </td>
                  <td className="px-4 py-3 text-[12px]" style={{ color: "#6c757d" }}>{s.room ?? "—"}</td>
                  <td className="px-4 py-3 text-[12px]" style={{ color: "#6c757d" }}>{s.speakerName ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => openEdit(s)} className="p-1.5 rounded" style={{ border: "1px solid #e9ecef", color: "#495057" }}><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setDeleteId(s.id)} className="p-1.5 rounded" style={{ border: "1px solid #f8d7da", color: "#842029" }}><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 sticky top-0 bg-white" style={{ borderBottom: "1px solid #e9ecef" }}>
              <h3 className="text-[16px] font-semibold" style={{ color: "#0B2744" }}>{editId ? "Edit Session" : "Add Session"}</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5" style={{ color: "#6c757d" }} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-[12px] font-medium mb-1" style={{ color: "#495057" }}>Title *</label>
                <input value={form.title} onChange={(e) => set("title", e.target.value)} className="w-full px-3 py-2 rounded-lg text-[13px] outline-none" style={{ border: `1px solid ${errors.title ? "#dc3545" : "#dee2e6"}` }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium mb-1" style={{ color: "#495057" }}>Day *</label>
                  <select value={form.day} onChange={(e) => set("day", parseInt(e.target.value))} className="w-full px-3 py-2 rounded-lg text-[13px] outline-none" style={{ border: "1px solid #dee2e6" }}>
                    <option value={1}>Day 1</option>
                    <option value={2}>Day 2</option>
                    <option value={3}>Day 3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-1" style={{ color: "#495057" }}>Type *</label>
                  <select value={form.sessionType} onChange={(e) => set("sessionType", e.target.value as SessionInputSessionType)} className="w-full px-3 py-2 rounded-lg text-[13px] outline-none" style={{ border: "1px solid #dee2e6" }}>
                    {["keynote", "panel", "workshop", "oral", "poster", "opening", "closing"].map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium mb-1" style={{ color: "#495057" }}>Start Time *</label>
                  <input type="time" value={form.startTime} onChange={(e) => set("startTime", e.target.value)} className="w-full px-3 py-2 rounded-lg text-[13px] outline-none" style={{ border: `1px solid ${errors.startTime ? "#dc3545" : "#dee2e6"}` }} />
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-1" style={{ color: "#495057" }}>End Time</label>
                  <input type="time" value={form.endTime ?? ""} onChange={(e) => set("endTime", e.target.value)} className="w-full px-3 py-2 rounded-lg text-[13px] outline-none" style={{ border: "1px solid #dee2e6" }} />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-medium mb-1" style={{ color: "#495057" }}>Room</label>
                <input value={form.room ?? ""} onChange={(e) => set("room", e.target.value)} placeholder="e.g. Grand Ballroom A" className="w-full px-3 py-2 rounded-lg text-[13px] outline-none" style={{ border: "1px solid #dee2e6" }} />
              </div>
              <div>
                <label className="block text-[12px] font-medium mb-1" style={{ color: "#495057" }}>Speaker</label>
                <select value={form.speakerId ?? ""} onChange={(e) => set("speakerId", e.target.value ? parseInt(e.target.value) : undefined)} className="w-full px-3 py-2 rounded-lg text-[13px] outline-none" style={{ border: "1px solid #dee2e6" }}>
                  <option value="">— No speaker —</option>
                  {(speakers ?? []).map((sp) => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium mb-1" style={{ color: "#495057" }}>Description</label>
                <textarea value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg text-[13px] outline-none resize-none" style={{ border: "1px solid #dee2e6" }} />
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4" style={{ borderTop: "1px solid #e9ecef" }}>
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-[13px]" style={{ border: "1px solid #e9ecef", color: "#6c757d" }}>Cancel</button>
              <button onClick={save} disabled={createMutation.isPending || updateMutation.isPending} className="px-5 py-2 rounded-lg text-[13px] font-semibold text-white" style={{ background: "#0E6E74" }}>
                {editId ? "Save Changes" : "Add Session"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl p-6">
            <h3 className="text-[16px] font-semibold mb-2" style={{ color: "#0B2744" }}>Delete Session?</h3>
            <p className="text-[13px] mb-5" style={{ color: "#6c757d" }}>This action cannot be undone.</p>
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
