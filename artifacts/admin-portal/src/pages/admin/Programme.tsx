import React, { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import {
  useListProgrammeSessions,
  useCreateProgrammeSession,
  useUpdateProgrammeSession,
  useDeleteProgrammeSession,
  useReorderProgrammeSessions,
} from "@workspace/api-client-react";
import type { ProgrammeSession, ProgrammeSessionInput } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, X, Loader2 } from "lucide-react";

const SESSION_TYPES = ["registration", "keynote", "plenary", "break", "industry", "social", "session"] as const;
const KIND_OPTIONS = ["single", "dual"] as const;

const SESSION_TYPE_COLORS: Record<string, string> = {
  registration: "#9ca3af",
  break:        "#9ca3af",
  keynote:      "#C89B3C",
  plenary:      "#0B2744",
  industry:     "#0E6E74",
  social:       "#C89B3C",
  session:      "#0E6E74",
};

const EMPTY_FORM: ProgrammeSessionInput = {
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
  sortOrder: 0,
};

function SessionTypeTag({ type }: { type: string }) {
  const color = SESSION_TYPE_COLORS[type] ?? "#6b7a8d";
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ background: color + "18", color }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
      {type}
    </span>
  );
}

function SessionCard({
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
    <div className="flex items-start gap-3 rounded-xl px-4 py-3.5 bg-white border border-gray-100 shadow-sm">
      <div className="flex flex-col gap-1 flex-shrink-0 mt-0.5">
        <button
          onClick={() => onMoveUp(session)}
          disabled={isFirst}
          className="p-0.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Move up"
        >
          <ChevronUp className="w-4 h-4 text-gray-500" />
        </button>
        <button
          onClick={() => onMoveDown(session)}
          disabled={isLast}
          className="p-0.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Move down"
        >
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-xs font-mono font-semibold text-gray-500">{session.timeSlot}</span>
          <SessionTypeTag type={session.sessionType} />
          <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">{session.kind}</span>
        </div>
        {session.kind === "single" ? (
          <div>
            <p className="text-sm font-semibold text-gray-800">{session.title || <span className="italic text-gray-400">No title</span>}</p>
            {session.location && <p className="text-xs text-gray-500 mt-0.5">{session.location}</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
            <div className="rounded-lg bg-gray-50 px-3 py-2">
              <p className="text-xs font-bold text-[#0B2744] mb-0.5">Track A</p>
              <p className="text-xs font-semibold text-gray-700">{session.trackATitle}</p>
              {session.trackALocation && <p className="text-xs text-gray-500">{session.trackALocation}</p>}
            </div>
            <div className="rounded-lg bg-gray-50 px-3 py-2">
              <p className="text-xs font-bold text-[#0E6E74] mb-0.5">Track B</p>
              <p className="text-xs font-semibold text-gray-700">{session.trackBTitle}</p>
              {session.trackBLocation && <p className="text-xs text-gray-500">{session.trackBLocation}</p>}
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
        <button
          onClick={() => onEdit(session)}
          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
          title="Edit"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(session)}
          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  );
}

const INPUT_CLS = "w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B2744]/30 focus:border-[#0B2744]";
const SELECT_CLS = INPUT_CLS + " bg-white";

function SessionModal({
  initial,
  onClose,
  onSave,
  saving,
}: {
  initial: ProgrammeSessionInput & { id?: number };
  onClose: () => void;
  onSave: (data: ProgrammeSessionInput) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<ProgrammeSessionInput>({
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
    sortOrder: initial.sortOrder ?? 0,
  });

  const set = (k: keyof ProgrammeSessionInput, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }));

  const isDual = form.kind === "dual";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-base text-gray-900">
            {initial.id ? "Edit Session" : "Add Session"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Day">
              <select className={SELECT_CLS} value={form.day} onChange={(e) => {
                const d = Number(e.target.value);
                set("day", d);
                set("dayLabel", d === 1 ? "22 March 2027" : "23 March 2027");
              }}>
                <option value={1}>Day 1 — 22 March 2027</option>
                <option value={2}>Day 2 — 23 March 2027</option>
              </select>
            </FormField>
            <FormField label="Day Label">
              <input className={INPUT_CLS} value={form.dayLabel} onChange={(e) => set("dayLabel", e.target.value)} placeholder="22 March 2027" />
            </FormField>
          </div>

          <FormField label="Time Slot">
            <input className={INPUT_CLS} value={form.timeSlot} onChange={(e) => set("timeSlot", e.target.value)} placeholder="08:00 – 09:00" />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Kind">
              <select className={SELECT_CLS} value={form.kind} onChange={(e) => set("kind", e.target.value)}>
                {KIND_OPTIONS.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </FormField>
            <FormField label="Session Type">
              <select className={SELECT_CLS} value={form.sessionType} onChange={(e) => set("sessionType", e.target.value)}>
                {SESSION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </FormField>
          </div>

          <FormField label="Sort Order">
            <input type="number" className={INPUT_CLS} value={form.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))} />
          </FormField>

          {!isDual && (
            <>
              <FormField label="Title">
                <input className={INPUT_CLS} value={form.title ?? ""} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Keynote Lecture" />
              </FormField>
              <FormField label="Location">
                <input className={INPUT_CLS} value={form.location ?? ""} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Main Ballroom" />
              </FormField>
            </>
          )}

          {isDual && (
            <>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
                <p className="text-xs font-bold text-[#0B2744] uppercase tracking-wide">Track A</p>
                <FormField label="Title">
                  <input className={INPUT_CLS} value={form.trackATitle ?? ""} onChange={(e) => set("trackATitle", e.target.value)} placeholder="e.g. Symposium Session" />
                </FormField>
                <FormField label="Location">
                  <input className={INPUT_CLS} value={form.trackALocation ?? ""} onChange={(e) => set("trackALocation", e.target.value)} placeholder="e.g. Main Ballroom" />
                </FormField>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
                <p className="text-xs font-bold text-[#0E6E74] uppercase tracking-wide">Track B</p>
                <FormField label="Title">
                  <input className={INPUT_CLS} value={form.trackBTitle ?? ""} onChange={(e) => set("trackBTitle", e.target.value)} placeholder="e.g. Concurrent Session" />
                </FormField>
                <FormField label="Location">
                  <input className={INPUT_CLS} value={form.trackBLocation ?? ""} onChange={(e) => set("trackBLocation", e.target.value)} placeholder="e.g. Breakout Room 1" />
                </FormField>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-lg transition-colors disabled:opacity-50"
            style={{ background: "#0B2744" }}
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {initial.id ? "Save Changes" : "Add Session"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirm({ session, onClose, onConfirm, deleting }: {
  session: ProgrammeSession;
  onClose: () => void;
  onConfirm: () => void;
  deleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h2 className="font-bold text-base text-gray-900 mb-2">Delete Session?</h2>
        <p className="text-sm text-gray-600 mb-6">
          This will permanently delete{" "}
          <span className="font-semibold text-gray-800">
            {session.kind === "dual" ? `${session.trackATitle} / ${session.trackBTitle}` : session.title}
          </span>.
        </p>
        <div className="flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-lg transition-colors disabled:opacity-50"
            style={{ background: "#dc2626" }}
          >
            {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminProgramme() {
  const qc = useQueryClient();
  const { data: sessions = [], isLoading } = useListProgrammeSessions();
  const createMut = useCreateProgrammeSession();
  const updateMut = useUpdateProgrammeSession();
  const deleteMut = useDeleteProgrammeSession();
  const reorderMut = useReorderProgrammeSessions();

  const [modal, setModal] = useState<null | { mode: "add"; day: number } | { mode: "edit"; session: ProgrammeSession }>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProgrammeSession | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["/api/programme-sessions"] });

  const day1 = sessions.filter((s) => s.day === 1);
  const day2 = sessions.filter((s) => s.day === 2);

  function handleSave(data: ProgrammeSessionInput) {
    if (modal?.mode === "edit") {
      updateMut.mutate({ id: modal.session.id, data }, {
        onSuccess: () => { invalidate(); setModal(null); },
      });
    } else if (modal?.mode === "add") {
      const dayLabel = modal.day === 1 ? "22 March 2027" : "23 March 2027";
      const sameDaySessions = sessions.filter((s) => s.day === modal.day);
      const maxSort = sameDaySessions.length > 0 ? Math.max(...sameDaySessions.map((s) => s.sortOrder)) : 0;
      createMut.mutate({ data: { ...data, day: modal.day, dayLabel, sortOrder: maxSort + 1 } }, {
        onSuccess: () => { invalidate(); setModal(null); },
      });
    }
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteMut.mutate({ id: deleteTarget.id }, {
      onSuccess: () => { invalidate(); setDeleteTarget(null); },
    });
  }

  function moveSession(s: ProgrammeSession, dir: "up" | "down") {
    const group = sessions.filter((x) => x.day === s.day).sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = group.findIndex((x) => x.id === s.id);
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= group.length) return;
    const other = group[swapIdx];
    reorderMut.mutate(
      { data: [
        { id: s.id, sortOrder: other.sortOrder },
        { id: other.id, sortOrder: s.sortOrder },
      ]},
      { onSuccess: invalidate }
    );
  }

  const isSaving = createMut.isPending || updateMut.isPending;
  const isDeleting = deleteMut.isPending;

  function renderDayGroup(label: string, dayLabel: string, items: ProgrammeSession[], day: number) {
    const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder);
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">{label}</h2>
            <p className="text-xs text-gray-500">{dayLabel} · {sorted.length} sessions</p>
          </div>
          <button
            onClick={() => setModal({ mode: "add", day })}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg text-white transition-colors"
            style={{ background: "#0B2744" }}
          >
            <Plus className="w-3.5 h-3.5" /> Add Session
          </button>
        </div>
        <div className="space-y-2">
          {sorted.length === 0 && (
            <div className="text-sm text-gray-400 italic py-4 text-center rounded-xl border border-dashed border-gray-200">
              No sessions yet. Click "Add Session" to get started.
            </div>
          )}
          {sorted.map((s, idx) => (
            <SessionCard
              key={s.id}
              session={s}
              isFirst={idx === 0}
              isLast={idx === sorted.length - 1}
              onEdit={(s) => setModal({ mode: "edit", session: s })}
              onDelete={(s) => setDeleteTarget(s)}
              onMoveUp={(s) => moveSession(s, "up")}
              onMoveDown={(s) => moveSession(s, "down")}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Programme</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage the conference schedule and session order.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-gray-400 py-10">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading sessions…
          </div>
        ) : (
          <>
            {renderDayGroup(
              "Day 1",
              day1[0]?.dayLabel ?? "22 March 2027",
              day1,
              1
            )}
            {renderDayGroup(
              "Day 2",
              day2[0]?.dayLabel ?? "23 March 2027",
              day2,
              2
            )}
          </>
        )}
      </div>

      {modal !== null && (
        <SessionModal
          initial={
            modal.mode === "edit"
              ? { ...modal.session }
              : { ...EMPTY_FORM, day: modal.day }
          }
          onClose={() => setModal(null)}
          onSave={handleSave}
          saving={isSaving}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm
          session={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          deleting={isDeleting}
        />
      )}
    </AdminLayout>
  );
}
