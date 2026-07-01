import React from "react";
import PortalLayout from "@/components/PortalLayout";
import { useCreateAbstract, useGetMyRegistration } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Loader2, CheckCircle, Upload, FileText, X, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { INPUT_BASE } from "@/components/ui/form-primitives";

const STEPS = ["Details", "File Upload", "Preview", "Submit"];

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ALLOWED_EXT = ".pdf, .doc, .docx";
const MAX_SIZE_MB = 5;


async function requestUploadUrl(file: File): Promise<{ uploadURL: string; objectPath: string }> {
  const token = localStorage.getItem("satbds_token");
  const res = await fetch("/api/storage/uploads/request-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
  });
  if (!res.ok) throw new Error("Failed to request upload URL");
  return res.json();
}

async function uploadToGCS(presignedUrl: string, file: File): Promise<void> {
  const res = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!res.ok) throw new Error("Failed to upload file");
}

const STUDENT_CATEGORY_SLUGS = ["student", "student_senior"];

const ABSTRACT_TYPE_LABELS: Record<string, string> = {
  oral: "Oral Presentation",
  poster: "Poster Presentation",
  rapid_oral: "Rapid Oral Presentation",
};

export default function NewAbstract() {
  const [, setLocation] = useLocation();
  const createMutation = useCreateAbstract();
  const { toast } = useToast();
  const { data: registration } = useGetMyRegistration();
  const [step, setStep] = React.useState(0);
  const [submitted, setSubmitted] = React.useState<{ abstractCode: string } | null>(null);

  const isStudent = STUDENT_CATEGORY_SLUGS.includes(registration?.category ?? "");

  const [form, setForm] = React.useState({
    title: "",
    abstractType: "oral" as "oral" | "poster" | "rapid_oral",
    keywords: "",
    coAuthors: "",
    body: "",
  });

  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [fileError, setFileError] = React.useState("");
  const [uploading, setUploading] = React.useState(false);
  const [uploadedObjectPath, setUploadedObjectPath] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const set = (key: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const validateStep = () => {
    const errs: Record<string, string> = {};
    if (step === 0) {
      if (!form.title.trim() || form.title.length < 5) errs.title = "Title must be at least 5 characters.";
      if (!form.body.trim() || form.body.length < 50) errs.body = "Abstract body must be at least 50 characters.";
      if (form.body.length > 3000) errs.body = "Abstract body must be under 3000 characters.";
      if (!form.keywords.trim()) errs.keywords = "At least one keyword is required.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError("");
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError("Only PDF, DOC, and DOCX files are accepted.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setFileError(`File must be under ${MAX_SIZE_MB} MB.`);
      return;
    }
    setSelectedFile(file);
    setUploadedObjectPath(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const { uploadURL, objectPath } = await requestUploadUrl(selectedFile);
      await uploadToGCS(uploadURL, selectedFile);
      setUploadedObjectPath(objectPath);
      toast({ title: "File uploaded", description: selectedFile.name });
    } catch {
      toast({ title: "Upload failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep((s) => s + 1);
  };

  const handleSubmit = () => {
    createMutation.mutate(
      {
        data: {
          title: form.title,
          body: form.body,
          abstractType: form.abstractType,
          keywords: form.keywords || undefined,
          coAuthors: form.coAuthors || undefined,
          fileUrl: uploadedObjectPath || undefined,
        },
      },
      {
        onSuccess: (data) => {
          setSubmitted({ abstractCode: data.abstractCode ?? "ABS-XXXX" });
        },
        onError: () => {
          toast({ title: "Submission failed", description: "Please try again.", variant: "destructive" });
        },
      },
    );
  };

  if (submitted) {
    return (
      <PortalLayout title="Submit Abstract">
        <div className="max-w-md mx-auto text-center py-12">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "var(--status-success-bg)" }}>
            <CheckCircle className="w-8 h-8" style={{ color: "var(--green)" }} />
          </div>
          <h2 className="text-2xl font-sans font-bold mb-2" style={{ color: "var(--navy)" }}>Abstract Submitted!</h2>
          <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>
            Your abstract has been received and is now under review. You will be notified of the outcome.
          </p>
          <div className="rounded-xl px-6 py-3 mb-6 inline-block" style={{ background: "var(--primary-lt)" }}>
            <div className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--primary)" }}>Abstract Code</div>
            <div className="text-[18px] font-mono font-bold" style={{ color: "var(--navy)" }}>{submitted.abstractCode}</div>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setLocation("/portal/abstracts")}
              className="btn btn-primary"
            >
              View All Abstracts
            </button>
            <button
              onClick={() => {
                setSubmitted(null);
                setStep(0);
                setForm({ title: "", abstractType: "oral", keywords: "", coAuthors: "", body: "" });
                setSelectedFile(null);
                setUploadedObjectPath(null);
              }}
              className="btn btn-outline"
            >
              Submit Another
            </button>
          </div>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout title="Submit Abstract">
      <div className="w-full">
        <Link href="/portal/abstracts" className="flex items-center gap-1.5 text-[13px] mb-5 no-underline" style={{ color: "var(--text-muted)" }}>
          <ArrowLeft className="w-4 h-4" /> Back to Abstracts
        </Link>

        {/* Step indicator */}
        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold mb-1"
                  style={{
                    background: i < step ? "var(--green)" : i === step ? "var(--primary)" : "var(--border-color)",
                    color: i <= step ? "#fff" : "var(--text-disabled)",
                    boxShadow: i === step ? "0 0 0 3px var(--primary-lt)" : "none",
                  }}
                >
                  {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <div
                  className="text-[11px] font-medium text-center"
                  style={{ color: i === step ? "var(--primary)" : i < step ? "var(--green)" : "var(--text-disabled)" }}
                >
                  {s}
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 mx-2 mb-5" style={{ height: 2, background: i < step ? "var(--green)" : "var(--border-color)" }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 0: Details & Content */}
        {step === 0 && (
          <div className="card p-6">
            <h2 className="text-[15px] font-sans font-bold mb-5" style={{ color: "var(--navy)" }}>
              Abstract Details & Content
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-[13px] font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  Title <span style={{ color: "var(--red)" }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="Enter the full title of your presentation"
                  className={INPUT_BASE}
                  style={{ border: `1px solid ${errors.title ? "var(--red)" : "var(--border-color)"}` }}
                />
                {errors.title && <p className="text-[12px] mt-1" style={{ color: "var(--red)" }}>{errors.title}</p>}
              </div>

              <div>
                <label className="block text-[13px] font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  Presentation Type <span style={{ color: "var(--red)" }}>*</span>
                </label>
                <div className="flex gap-3 flex-wrap">
                  {(["oral", "poster", ...(isStudent ? ["rapid_oral"] : [])] as const).map((t) => (
                    <label
                      key={t}
                      className="flex items-center gap-2 px-4 py-3 rounded-lg cursor-pointer flex-1 justify-center transition-colors"
                      style={{
                        border: form.abstractType === t ? "2px solid var(--primary)" : "1px solid var(--border-color)",
                        background: form.abstractType === t ? "var(--primary-lt)" : "var(--bg-surface)",
                        minWidth: "9rem",
                      }}
                    >
                      <input
                        type="radio"
                        name="type"
                        value={t}
                        checked={form.abstractType === t}
                        onChange={() => set("abstractType", t)}
                        className="sr-only"
                      />
                      <span
                        className="text-[13px] font-medium text-center"
                        style={{ color: form.abstractType === t ? "var(--primary)" : "var(--text-secondary)" }}
                      >
                        {ABSTRACT_TYPE_LABELS[t]}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  Keywords <span style={{ color: "var(--red)" }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.keywords}
                  onChange={(e) => set("keywords", e.target.value)}
                  placeholder="e.g. tick-borne diseases, vector control, epidemiology"
                  className={INPUT_BASE}
                  style={{ border: `1px solid ${errors.keywords ? "var(--red)" : "var(--border-color)"}` }}
                />
                {errors.keywords && (
                  <p className="text-[12px] mt-1" style={{ color: "var(--red)" }}>{errors.keywords}</p>
                )}
              </div>

              <div>
                <label className="block text-[13px] font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  Co-Authors{" "}
                  <span className="text-[12px] font-normal" style={{ color: "var(--text-disabled)" }}>(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.coAuthors}
                  onChange={(e) => set("coAuthors", e.target.value)}
                  placeholder="e.g. Dr. Jane Smith (UM), Prof. Ali Hassan (USM)"
                  className={INPUT_BASE}
                  style={{ border: "1px solid var(--border-color)" }}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[13px] font-semibold" style={{ color: "var(--text-secondary)" }}>
                    Abstract Body <span style={{ color: "var(--red)" }}>*</span>
                  </label>
                  <span className="text-[12px]" style={{ color: form.body.length > 2800 ? "var(--red)" : "var(--text-disabled)" }}>
                    {form.body.length}/3000
                  </span>
                </div>
                <textarea
                  value={form.body}
                  onChange={(e) => set("body", e.target.value)}
                  placeholder={"Background: …\nMethods: …\nResults: …\nConclusion: …"}
                  rows={10}
                  className={`${INPUT_BASE} resize-y`}
                  style={{
                    border: `1px solid ${errors.body ? "var(--red)" : "var(--border-color)"}`,
                    lineHeight: 1.7,
                  }}
                />
                {errors.body && <p className="text-[12px] mt-1" style={{ color: "var(--red)" }}>{errors.body}</p>}
              </div>
            </div>
            <div className="flex justify-end mt-6 pt-4" style={{ borderTop: "1px solid var(--border-color-light)" }}>
              <button onClick={handleNext} className="btn btn-primary">
                Next: File Upload →
              </button>
            </div>
          </div>
        )}

        {/* Step 1: File Upload */}
        {step === 1 && (
          <div className="card p-6">
            <h2 className="text-[15px] font-sans font-bold mb-2" style={{ color: "var(--navy)" }}>
              Upload Abstract Document
            </h2>
            <p className="text-[13px] mb-6" style={{ color: "var(--text-muted)" }}>
              Upload a formatted copy of your abstract in PDF or Word format. Maximum file size: {MAX_SIZE_MB} MB.
              <span className="ml-1" style={{ color: "var(--text-disabled)" }}>(Optional — you may skip this step)</span>
            </p>

            {!selectedFile ? (
              <label
                className="flex flex-col items-center justify-center w-full rounded-xl cursor-pointer transition-all"
                style={{ border: "2px dashed var(--border-color)", background: "var(--bg-surface-secondary)", minHeight: 180 }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) {
                    const fakeEvent = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
                    handleFileSelect(fakeEvent);
                  }
                }}
              >
                <input type="file" className="sr-only" accept=".pdf,.doc,.docx" onChange={handleFileSelect} />
                <Upload className="w-10 h-10 mb-3" style={{ color: "var(--text-disabled)" }} />
                <div className="text-[14px] font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                  Click or drag to upload your abstract
                </div>
                <div className="text-[12px]" style={{ color: "var(--text-disabled)" }}>
                  Accepted: {ALLOWED_EXT} · Max: {MAX_SIZE_MB} MB
                </div>
              </label>
            ) : (
              <div className="rounded-xl p-4" style={{ background: "var(--bg-surface-secondary)", border: "1px solid var(--border-color)" }}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--primary-lt)" }}
                  >
                    <FileText className="w-5 h-5" style={{ color: "var(--primary)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium truncate" style={{ color: "var(--text)" }}>{selectedFile.name}</div>
                    <div className="text-[12px]" style={{ color: "var(--text-muted)" }}>
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      {uploadedObjectPath && (
                        <span className="ml-2 font-semibold" style={{ color: "var(--status-success-text)" }}>✓ Uploaded successfully</span>
                      )}
                    </div>
                  </div>
                  {!uploadedObjectPath && (
                    <button
                      onClick={() => { setSelectedFile(null); setFileError(""); }}
                      className="p-1.5 rounded-lg transition-colors hover:bg-gray-200"
                      style={{ color: "var(--text-muted)", background: "none" }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {!uploadedObjectPath && (
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="btn btn-primary w-full mt-3 disabled:opacity-60"
                  >
                    {uploading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
                    ) : (
                      <><Upload className="w-4 h-4" /> Upload to Server</>
                    )}
                  </button>
                )}
              </div>
            )}

            {fileError && (
              <div className="flex items-center gap-2 mt-3 text-[13px]" style={{ color: "var(--red)" }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {fileError}
              </div>
            )}

            <div className="flex justify-between mt-6 pt-4" style={{ borderTop: "1px solid var(--border-color-light)" }}>
              <button onClick={() => setStep(0)} className="btn btn-outline">← Back</button>
              <button
                onClick={() => setStep(2)}
                disabled={!!selectedFile && !uploadedObjectPath}
                className="btn btn-primary disabled:opacity-60"
                style={{ cursor: selectedFile && !uploadedObjectPath ? "not-allowed" : "pointer" }}
              >
                {selectedFile && !uploadedObjectPath ? "Please upload first" : "Next: Preview →"}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Preview */}
        {step === 2 && (
          <div className="card p-6">
            <h2 className="text-[15px] font-sans font-bold mb-5" style={{ color: "var(--navy)" }}>Review Your Abstract</h2>
            <div className="space-y-4">
              {[
                { label: "Title", value: form.title },
                { label: "Type", value: ABSTRACT_TYPE_LABELS[form.abstractType] ?? form.abstractType },
                { label: "Keywords", value: form.keywords },
                { label: "Co-Authors", value: form.coAuthors || "—" },
                {
                  label: "Document",
                  value: selectedFile
                    ? selectedFile.name + (uploadedObjectPath ? " ✓" : " (not uploaded)")
                    : "No file attached",
                },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-4">
                  <div
                    className="w-28 flex-shrink-0 text-[12px] font-semibold uppercase tracking-wide pt-0.5"
                    style={{ color: "var(--text-disabled)" }}
                  >
                    {label}
                  </div>
                  <div className="text-[14px]" style={{ color: "var(--text)" }}>{value}</div>
                </div>
              ))}
              <div className="flex gap-4">
                <div
                  className="w-28 flex-shrink-0 text-[12px] font-semibold uppercase tracking-wide pt-0.5"
                  style={{ color: "var(--text-disabled)" }}
                >
                  Abstract
                </div>
                <div
                  className="text-[13px] rounded-lg p-4 flex-1"
                  style={{ background: "var(--bg-surface-secondary)", color: "var(--text-secondary)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}
                >
                  {form.body}
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-6 pt-4" style={{ borderTop: "1px solid var(--border-color-light)" }}>
              <button onClick={() => setStep(1)} className="btn btn-outline">← Back</button>
              <button onClick={() => setStep(3)} className="btn btn-primary">Looks Good →</button>
            </div>
          </div>
        )}

        {/* Step 3: Submit */}
        {step === 3 && (
          <div className="card p-6">
            <h2 className="text-[15px] font-sans font-bold mb-3" style={{ color: "var(--navy)" }}>Confirm Submission</h2>
            <div className="rounded-xl p-5 mb-5" style={{ background: "var(--primary-lt)", border: "1px solid var(--border-color)" }}>
              <div className="text-[13px] mb-1 font-semibold" style={{ color: "var(--primary)" }}>You are about to submit:</div>
              <div className="text-[15px] font-sans font-bold" style={{ color: "var(--navy)" }}>{form.title}</div>
              <div className="text-[13px] mt-1" style={{ color: "var(--text-secondary)" }}>
                {ABSTRACT_TYPE_LABELS[form.abstractType] ?? form.abstractType} · {form.keywords}
              </div>
              {uploadedObjectPath && (
                <div className="flex items-center gap-1.5 mt-2 text-[12px]" style={{ color: "var(--status-success-text)" }}>
                  <FileText className="w-3.5 h-3.5" />
                  Document attached: {selectedFile?.name}
                </div>
              )}
            </div>
            <p className="text-[13px] mb-6" style={{ color: "var(--text-muted)" }}>
              Once submitted, your abstract cannot be edited. The organising committee will review it and contact you with the outcome.
            </p>
            <div className="flex justify-between">
              <button onClick={() => setStep(2)} className="btn btn-outline">← Back</button>
              <button
                onClick={handleSubmit}
                disabled={createMutation.isPending}
                className="btn btn-primary disabled:opacity-60"
              >
                {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit Abstract
              </button>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
