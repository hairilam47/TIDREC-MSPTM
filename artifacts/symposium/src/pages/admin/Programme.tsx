import React from "react";
import AdminLayout from "@/components/AdminLayout";
import { useGetSessions, useCreateSession, useUpdateSession, useDeleteSession, useGetSpeakers } from "@workspace/api-client-react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SessionInput, SessionInputSessionType } from "@workspace/api-client-react";
import { FormField, ModalShell, ConfirmDialog, INPUT_BASE, SELECT_BASE, TEXTAREA_BASE, inputBorder } from "@/components/ui/form-primitives";

const BLANK: SessionInput = { title: "", day: 1, startTime: "09:00", endTime: "", room: "", sessionType: "keynote", description: "", speakerId: undefined };

const TYPE_BADGE: Record<string, { bg: string; color: string }> = {
  keynote:  { bg: "var(--gold-lt)",    color: "var(--gold-dk)" },
  panel:    { bg: "var(--teal-lt)",    color: "var(--teal)" },
  workshop: { bg: "var(--navy-lt)",    color: "var(--navy)" },
  oral:     { bg: "var(--green-lt)",   color: "var(--green)" },
  poster:   { bg: "var(--red-lt)",     color: "var(--red)" },
  opening:  { bg: "var(--border-color)", color: "var(--text-secondary)" },
  closing:  { bg: "var(--border-color)", color: "var(--text-secondary)" },
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

  const set = <K extends keyof SessionInput>(k: K, v: SessionInput[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const filtered = (sessions ?? [])
    .filter((s) => dayFilter === "all" || s.day === dayFilter)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const openCreate = () => { setEditId(null); setForm({ ...BLANK }); setErrors({}); setShowModal(true); };
  const openEdit = (s: NonNullable<typeof sessions>[0]) => {
    setEditId(s.id);
    setForm({
      title: s.title,
      day: s.day,
      startTime: s.startTime,
      endTime: s.endTime ?? "",
      room: s.room ?? "",
      sessionType: s.sessionType,
      description: s.description ?? "",
      speakerId: s.speakerId ?? undefined,
    });
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Session title is required";
    if (!form.startTime) e.startTime = "Start time is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = () => {
    if (!validate()) return;
    const data: SessionInput = {
      ...form,
      endTime: form.endTime || undefined,
      room: form.room || undefined,
      description: form.description || undefined,
      speakerId: form.speakerId ?? undefined,
    };
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
      {/* Toolbar */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            className={`btn btn-sm ${dayFilter === "all" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setDayFilter("all")}
          >
            All Days
          </button>
          {days.map((d) => (
            <button
              key={d}
              className={`btn btn-sm ${dayFilter === d ? "btn-primary" : "btn-outline"}`}
              onClick={() => setDayFilter(d)}
            >
              Day {d}
            </button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus style={{ width: 14, height: 14 }} /> Add Session
        </button>
      </div>
      {/* Sessions table */}
      <div className="card">
        <div className="card-body p-0">
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Time</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Room</th>
                  <th>Speaker</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "40px 16px", color: "var(--text-muted)", fontSize: 13 }}>
                      No sessions yet
                    </td>
                  </tr>
                ) : filtered.map((s) => {
                  const tc = TYPE_BADGE[s.sessionType] ?? TYPE_BADGE.opening;
                  return (
                    <tr key={s.id}>
                      <td><span className="cell-mono">Day {s.day}</span></td>
                      <td><span className="cell-mono">{s.startTime}{s.endTime ? `–${s.endTime}` : ""}</span></td>
                      <td><span className="cell-strong">{s.title}</span></td>
                      <td>
                        <span
                          style={{
                            fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, textTransform: "capitalize",
                            background: tc.bg, color: tc.color,
                          }}
                        >
                          {s.sessionType}
                        </span>
                      </td>
                      <td style={{ color: "var(--text-secondary)", fontSize: 12 }}>{s.room ?? "—"}</td>
                      <td style={{ color: "var(--text-secondary)", fontSize: 12 }}>{s.speakerName ?? "—"}</td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn btn-outline btn-sm" onClick={() => openEdit(s)} title="Edit">
                            <Pencil style={{ width: 13, height: 13 }} />
                          </button>
                          <button
                            className="btn btn-sm"
                            style={{ background: "var(--status-danger-bg)", color: "var(--status-danger-text)", borderColor: "var(--status-danger-border)" }}
                            onClick={() => setDeleteId(s.id)}
                            title="Delete"
                          >
                            <Trash2 style={{ width: 13, height: 13 }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {showModal && (
        <ModalShell
          title={editId ? "Edit Session" : "Add Session"}
          onClose={() => setShowModal(false)}
          footer={
            <>
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={save}
                disabled={createMutation.isPending || updateMutation.isPending}
                style={{ opacity: (createMutation.isPending || updateMutation.isPending) ? 0.6 : 1 }}
              >
                {editId ? "Save Changes" : "Add Session"}
              </button>
            </>
          }
        >
          <FormField label="Session Title" required error={errors.title}>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Tick Surveillance in Southeast Asian Wildlife"
              className={INPUT_BASE}
              style={inputBorder(errors.title)}
            />
          </FormField>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FormField label="Day" required>
              <select
                value={form.day}
                onChange={(e) => set("day", parseInt(e.target.value))}
                className={SELECT_BASE}
                style={inputBorder()}
              >
                <option value={1}>Day 1 — 22 March</option>
                <option value={2}>Day 2 — 23 March</option>
                <option value={3}>Day 3</option>
              </select>
            </FormField>
            <FormField label="Session Type" required>
              <select
                value={form.sessionType}
                onChange={(e) => set("sessionType", e.target.value as SessionInputSessionType)}
                className={SELECT_BASE}
                style={inputBorder()}
              >
                {["keynote", "panel", "workshop", "oral", "poster", "opening", "closing"].map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FormField label="Start Time" required error={errors.startTime}>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => set("startTime", e.target.value)}
                className={INPUT_BASE}
                style={inputBorder(errors.startTime)}
              />
            </FormField>
            <FormField label="End Time" hint="Optional">
              <input
                type="time"
                value={form.endTime ?? ""}
                onChange={(e) => set("endTime", e.target.value)}
                className={INPUT_BASE}
                style={inputBorder()}
              />
            </FormField>
          </div>

          <FormField label="Room / Venue" hint="Optional">
            <input
              value={form.room ?? ""}
              onChange={(e) => set("room", e.target.value)}
              placeholder="e.g. Grand Ballroom A"
              className={INPUT_BASE}
              style={inputBorder()}
            />
          </FormField>

          <FormField label="Assigned Speaker" hint="Optional">
            <select
              value={form.speakerId ?? ""}
              onChange={(e) => set("speakerId", e.target.value ? parseInt(e.target.value) : undefined)}
              className={SELECT_BASE}
              style={inputBorder()}
            >
              <option value="">— No speaker assigned —</option>
              {(speakers ?? []).map((sp) => (
                <option key={sp.id} value={sp.id}>{sp.name}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Description" hint="Optional — brief overview shown on the programme page">
            <textarea
              value={form.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              placeholder="Brief session overview…"
              className={TEXTAREA_BASE}
              style={inputBorder()}
            />
          </FormField>
        </ModalShell>
      )}
      {deleteId && (
        <ConfirmDialog
          title="Delete Session?"
          message="This session will be permanently removed from the programme."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleteMutation.isPending}
        />
      )}
    </AdminLayout>
  );
}
