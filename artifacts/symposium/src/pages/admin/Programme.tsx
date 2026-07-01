import React from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  useListProgrammeSessions,
  useCreateProgrammeSession,
  useUpdateProgrammeSession,
  useDeleteProgrammeSession,
  useReorderProgrammeSessions,
  getListProgrammeSessionsQueryKey,
  useGetSpeakers,
} from "@workspace/api-client-react";
import type { ProgrammeSession, ProgrammeSessionInput } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FormField, ModalShell, ConfirmDialog, INPUT_BASE, SELECT_BASE, inputBorder } from "@/components/ui/form-primitives";

const SESSION_TYPES = ["registration", "keynote", "plenary", "break", "industry", "social", "session"] as const;
type SessionType = typeof SESSION_TYPES[number];

const SESSION_TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  registration: { bg: "var(--bg-surface-secondary)", color: "var(--text-secondary)" },
  break:        { bg: "var(--bg-surface-secondary)", color: "var(--text-secondary)" },
  keynote:      { bg: "var(--gold-lt, rgba(200,155,60,0.15))", color: "var(--gold-dk, #a07820)" },
  plenary:      { bg: "var(--navy-lt, rgba(11,39,68,0.10))", color: "var(--navy, #0B2744)" },
  industry:     { bg: "var(--teal-lt, rgba(14,110,116,0.12))", color: "var(--teal, #0E6E74)" },
  social:       { bg: "var(--gold-lt, rgba(200,155,60,0.15))", color: "var(--gold-dk, #a07820)" },
  session:      { bg: "var(--teal-lt, rgba(14,110,116,0.12))", color: "var(--teal, #0E6E74)" },
};

type SessionFormData = ProgrammeSessionInput & { speakerId?: number | null };

const EMPTY_FORM: SessionFormData = {
  day: 1,
  dayLabel: "22 March 2027",
  timeSlot: "",
  kind: "single",
  sessionType: "session",
  title: "",
  location: "",
  trackATitle: "",
  trackALocation: "",
  trackBTitle: "",
  trackBLocation: "",
  speakerId: null,
  sortOrder: 0,
};

function TypeBadge({ type }: { type: string }) {
  const style = SESSION_TYPE_COLORS[type] ?? SESSION_TYPE_COLORS.session;
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, textTransform: "capitalize", background: style.bg, color: style.color }}>
      {type}
    </span>
  );
}

function SessionRow({
  session,
  isFirst,
  isLast,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  session: ProgrammeSession;
  isFirst: boolean;
  isLast: boolean;
  onEdit: (s: ProgrammeSession) => void;
  onDelete: (s: ProgrammeSession) => void;
  onMoveUp: (s: ProgrammeSession) => void;
  onMoveDown: (s: ProgrammeSession) => void;
}) {
  return (
    <tr>
      <td>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <button
            onClick={() => onMoveUp(session)}
            disabled={isFirst}
            className="btn btn-ghost btn-sm"
            style={{ padding: "2px 4px", opacity: isFirst ? 0.3 : 1 }}
            title="Move up"
          >
            <ChevronUp style={{ width: 13, height: 13 }} />
          </button>
          <button
            onClick={() => onMoveDown(session)}
            disabled={isLast}
            className="btn btn-ghost btn-sm"
            style={{ padding: "2px 4px", opacity: isLast ? 0.3 : 1 }}
            title="Move down"
          >
            <ChevronDown style={{ width: 13, height: 13 }} />
          </button>
        </div>
      </td>
      <td><span className="cell-mono">{session.timeSlot || "—"}</span></td>
      <td><TypeBadge type={session.sessionType} /></td>
      <td>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", padding: "1px 6px", borderRadius: 10, background: "var(--bg-surface-secondary)" }}>
          {session.kind}
        </span>
      </td>
      <td>
        {session.kind === "single" ? (
          <>
            <div className="cell-strong">{session.title || <span style={{ color: "var(--text-disabled)", fontStyle: "italic" }}>No title</span>}</div>
            {session.location && <div style={{ fontSize: 11, color: "var(--text-disabled)", marginTop: 2 }}>{session.location}</div>}
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ fontSize: 12 }}>
              <span style={{ fontWeight: 700, color: "var(--navy, #0B2744)", marginRight: 4 }}>A:</span>
              <span style={{ color: "var(--text)" }}>{session.trackATitle}</span>
            </div>
            <div style={{ fontSize: 12 }}>
              <span style={{ fontWeight: 700, color: "var(--teal, #0E6E74)", marginRight: 4 }}>B:</span>
              <span style={{ color: "var(--text)" }}>{session.trackBTitle}</span>
            </div>
          </div>
        )}
      </td>
      <td>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn btn-outline btn-sm" onClick={() => onEdit(session)} title="Edit">
            <Pencil style={{ width: 13, height: 13 }} />
          </button>
          <button
            className="btn btn-sm"
            style={{ background: "var(--status-danger-bg)", color: "var(--status-danger-text)", borderColor: "var(--status-danger-border)" }}
            onClick={() => onDelete(session)}
            title="Delete"
          >
            <Trash2 style={{ width: 13, height: 13 }} />
          </button>
        </div>
      </td>
    </tr>
  );
}

interface SessionFormProps {
  initial: SessionFormData & { id?: number };
  onClose: () => void;
  onSave: (data: SessionFormData) => void;
  saving: boolean;
}

function SessionForm({ initial, onClose, onSave, saving }: SessionFormProps) {
  const { data: speakers = [] } = useGetSpeakers();
  const [form, setForm] = React.useState<SessionFormData>({
    day: initial.day,
    dayLabel: initial.dayLabel,
    timeSlot: initial.timeSlot,
    kind: initial.kind,
    sessionType: initial.sessionType,
    title: initial.title ?? "",
    location: initial.location ?? "",
    trackATitle: initial.trackATitle ?? "",
    trackALocation: initial.trackALocation ?? "",
    trackBTitle: initial.trackBTitle ?? "",
    trackBLocation: initial.trackBLocation ?? "",
    speakerId: initial.speakerId ?? null,
    sortOrder: initial.sortOrder ?? 0,
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const set = (k: keyof SessionFormData, v: string | number | null) =>
    setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.timeSlot.trim()) e.timeSlot = "Time slot is required (e.g. 09:00 – 10:00)";
    if (form.kind === "single" && !form.title?.trim()) e.title = "Title is required for single sessions";
    if (form.kind === "dual" && !form.trackATitle?.trim()) e.trackATitle = "Track A title is required";
    if (form.kind === "dual" && !form.trackBTitle?.trim()) e.trackBTitle = "Track B title is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const isDual = form.kind === "dual";

  return (
    <ModalShell
      title={initial.id ? "Edit Session" : "Add Session"}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={() => { if (validate()) onSave(form); }}
            disabled={saving}
            style={{ opacity: saving ? 0.6 : 1 }}
          >
            {saving && <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" />}
            {initial.id ? "Save Changes" : "Add Session"}
          </button>
        </>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <FormField label="Day" required>
          <select
            className={SELECT_BASE}
            style={inputBorder()}
            value={form.day}
            onChange={(e) => {
              const d = Number(e.target.value);
              set("day", d);
              set("dayLabel", d === 1 ? "22 March 2027" : "23 March 2027");
            }}
          >
            <option value={1}>Day 1 — 22 March 2027</option>
            <option value={2}>Day 2 — 23 March 2027</option>
          </select>
        </FormField>
        <FormField label="Day Label" hint="Auto-filled from Day selection">
          <input
            className={INPUT_BASE}
            style={inputBorder()}
            value={form.dayLabel}
            onChange={(e) => set("dayLabel", e.target.value)}
            placeholder="22 March 2027"
          />
        </FormField>
      </div>

      <FormField label="Time Slot" required error={errors.timeSlot} hint='Use en-dash format: "09:00 – 10:00"'>
        <input
          className={INPUT_BASE}
          style={inputBorder(errors.timeSlot)}
          value={form.timeSlot}
          onChange={(e) => { set("timeSlot", e.target.value); setErrors((ev) => ({ ...ev, timeSlot: "" })); }}
          placeholder="08:00 – 09:00"
        />
      </FormField>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <FormField label="Kind" required>
          <select
            className={SELECT_BASE}
            style={inputBorder()}
            value={form.kind}
            onChange={(e) => set("kind", e.target.value)}
          >
            <option value="single">Single (one track)</option>
            <option value="dual">Dual (Track A + Track B)</option>
          </select>
        </FormField>
        <FormField label="Session Type" required>
          <select
            className={SELECT_BASE}
            style={inputBorder()}
            value={form.sessionType}
            onChange={(e) => set("sessionType", e.target.value as SessionType)}
          >
            {SESSION_TYPES.map((t) => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField label="Sort Order" hint="Lower numbers appear first within a day">
        <input
          type="number"
          className={INPUT_BASE}
          style={inputBorder()}
          value={form.sortOrder}
          onChange={(e) => set("sortOrder", Number(e.target.value))}
        />
      </FormField>

      <FormField label="Speaker" hint="Optional — assign a speaker to this session">
        <select
          className={SELECT_BASE}
          style={inputBorder()}
          value={form.speakerId ?? ""}
          onChange={(e) => set("speakerId", e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">— No speaker assigned —</option>
          {speakers.map((sp) => (
            <option key={sp.id} value={sp.id}>
              {sp.name}{sp.title ? ` — ${sp.title}` : ""}
            </option>
          ))}
        </select>
      </FormField>

      {!isDual && (
        <>
          <FormField label="Title" required={form.sessionType !== "break" && form.sessionType !== "registration"} error={errors.title}>
            <input
              className={INPUT_BASE}
              style={inputBorder(errors.title)}
              value={form.title ?? ""}
              onChange={(e) => { set("title", e.target.value); setErrors((ev) => ({ ...ev, title: "" })); }}
              placeholder="e.g. Keynote Lecture"
            />
          </FormField>
          <FormField label="Location / Venue" hint="Optional">
            <input
              className={INPUT_BASE}
              style={inputBorder()}
              value={form.location ?? ""}
              onChange={(e) => set("location", e.target.value)}
              placeholder="e.g. Main Ballroom"
            />
          </FormField>
        </>
      )}

      {isDual && (
        <>
          <div style={{ padding: "12px 14px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-surface-secondary)" }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--navy, #0B2744)", marginBottom: 12 }}>Track A</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <FormField label="Title" required error={errors.trackATitle}>
                <input
                  className={INPUT_BASE}
                  style={inputBorder(errors.trackATitle)}
                  value={form.trackATitle ?? ""}
                  onChange={(e) => { set("trackATitle", e.target.value); setErrors((ev) => ({ ...ev, trackATitle: "" })); }}
                  placeholder="e.g. Symposium Session"
                />
              </FormField>
              <FormField label="Location" hint="Optional">
                <input
                  className={INPUT_BASE}
                  style={inputBorder()}
                  value={form.trackALocation ?? ""}
                  onChange={(e) => set("trackALocation", e.target.value)}
                  placeholder="e.g. Main Ballroom"
                />
              </FormField>
            </div>
          </div>
          <div style={{ padding: "12px 14px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-surface-secondary)" }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--teal, #0E6E74)", marginBottom: 12 }}>Track B</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <FormField label="Title" required error={errors.trackBTitle}>
                <input
                  className={INPUT_BASE}
                  style={inputBorder(errors.trackBTitle)}
                  value={form.trackBTitle ?? ""}
                  onChange={(e) => { set("trackBTitle", e.target.value); setErrors((ev) => ({ ...ev, trackBTitle: "" })); }}
                  placeholder="e.g. Concurrent Session"
                />
              </FormField>
              <FormField label="Location" hint="Optional">
                <input
                  className={INPUT_BASE}
                  style={inputBorder()}
                  value={form.trackBLocation ?? ""}
                  onChange={(e) => set("trackBLocation", e.target.value)}
                  placeholder="e.g. Breakout Room 1"
                />
              </FormField>
            </div>
          </div>
        </>
      )}
    </ModalShell>
  );
}

export default function AdminProgramme() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: sessions = [], isLoading } = useListProgrammeSessions();
  const createMut = useCreateProgrammeSession();
  const updateMut = useUpdateProgrammeSession();
  const deleteMut = useDeleteProgrammeSession();
  const reorderMut = useReorderProgrammeSessions();

  const [modal, setModal] = React.useState<null | { mode: "add"; day: number } | { mode: "edit"; session: ProgrammeSession }>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<ProgrammeSession | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: getListProgrammeSessionsQueryKey() });

  const day1 = sessions.filter((s) => s.day === 1).sort((a, b) => a.sortOrder - b.sortOrder);
  const day2 = sessions.filter((s) => s.day === 2).sort((a, b) => a.sortOrder - b.sortOrder);

  function handleSave(data: SessionFormData) {
    if (modal?.mode === "edit") {
      updateMut.mutate({ id: modal.session.id, data: data as ProgrammeSessionInput }, {
        onSuccess: () => {
          invalidate();
          setModal(null);
          toast({ title: "Session updated" });
        },
        onError: () => toast({ title: "Update failed", variant: "destructive" }),
      });
    } else if (modal?.mode === "add") {
      const dayLabel = modal.day === 1 ? "22 March 2027" : "23 March 2027";
      const sameDaySessions = sessions.filter((s) => s.day === modal.day);
      const maxSort = sameDaySessions.length > 0 ? Math.max(...sameDaySessions.map((s) => s.sortOrder)) : 0;
      createMut.mutate({ data: { ...data, day: modal.day, dayLabel, sortOrder: maxSort + 1 } as ProgrammeSessionInput }, {
        onSuccess: () => {
          invalidate();
          setModal(null);
          toast({ title: "Session added" });
        },
        onError: () => toast({ title: "Add failed", variant: "destructive" }),
      });
    }
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteMut.mutate({ id: deleteTarget.id }, {
      onSuccess: () => {
        invalidate();
        setDeleteTarget(null);
        toast({ title: "Session deleted" });
      },
      onError: () => toast({ title: "Delete failed", variant: "destructive" }),
    });
  }

  function moveSession(s: ProgrammeSession, dir: "up" | "down") {
    const group = sessions.filter((x) => x.day === s.day).sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = group.findIndex((x) => x.id === s.id);
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= group.length) return;
    const other = group[swapIdx];
    reorderMut.mutate(
      { data: [{ id: s.id, sortOrder: other.sortOrder }, { id: other.id, sortOrder: s.sortOrder }] },
      { onSuccess: invalidate }
    );
  }

  const isSaving = createMut.isPending || updateMut.isPending;

  function renderDayGroup(label: string, dayLabel: string, items: ProgrammeSession[], day: number) {
    return (
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: 0 }}>{label}</h2>
            <p style={{ fontSize: 12, color: "var(--text-disabled)", margin: "2px 0 0" }}>{dayLabel} · {items.length} sessions</p>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setModal({ mode: "add", day })}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <Plus style={{ width: 13, height: 13 }} /> Add Session
          </button>
        </div>
        <div className="card">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: 36 }}></th>
                    <th>Time</th>
                    <th>Type</th>
                    <th>Kind</th>
                    <th>Title / Tracks</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "32px 16px", color: "var(--text-disabled)", fontSize: 13 }}>
                        No sessions yet. Click "Add Session" to build the schedule.
                      </td>
                    </tr>
                  ) : items.map((s, idx) => (
                    <SessionRow
                      key={s.id}
                      session={s}
                      isFirst={idx === 0}
                      isLast={idx === items.length - 1}
                      onEdit={(s) => setModal({ mode: "edit", session: s })}
                      onDelete={(s) => setDeleteTarget(s)}
                      onMoveUp={(s) => moveSession(s, "up")}
                      onMoveDown={(s) => moveSession(s, "down")}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout title="Programme">
      {isLoading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "64px 0", color: "var(--text-disabled)", fontSize: 13 }}>
          <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> Loading sessions…
        </div>
      ) : (
        <>
          {renderDayGroup("Day 1", day1[0]?.dayLabel ?? "22 March 2027", day1, 1)}
          {renderDayGroup("Day 2", day2[0]?.dayLabel ?? "23 March 2027", day2, 2)}
        </>
      )}

      {modal !== null && (
        <SessionForm
          initial={modal.mode === "edit" ? { ...modal.session, speakerId: (modal.session as SessionFormData).speakerId ?? null } : { ...EMPTY_FORM, day: modal.day }}
          onClose={() => setModal(null)}
          onSave={handleSave}
          saving={isSaving}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Session?"
          message={`This will permanently remove "${deleteTarget.kind === "dual" ? `${deleteTarget.trackATitle} / ${deleteTarget.trackBTitle}` : deleteTarget.title}" from the programme.`}
          confirmLabel="Delete Session"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteMut.isPending}
        />
      )}
    </AdminLayout>
  );
}
