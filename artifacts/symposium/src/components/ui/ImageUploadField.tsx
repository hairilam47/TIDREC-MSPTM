import React from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
const API = `${BASE_URL}/api`;

interface ImageUploadFieldProps {
  value: string;
  onChange: (objectPath: string) => void;
  accept?: string;
  label?: string;
  hint?: string;
}

export function ImageUploadField({ value, onChange, accept = "image/*", hint }: ImageUploadFieldProps) {
  const { toast } = useToast();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [previewSrc, setPreviewSrc] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!value) {
      setPreviewSrc(null);
      return;
    }
    // External URL or resolved API URL — use directly as src
    if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/api/")) {
      setPreviewSrc(value);
      return;
    }
    // Raw objectPath — fetch with auth and create a blob URL
    if (value.startsWith("/objects/")) {
      const token = localStorage.getItem("satbds_token");
      const stripped = value.slice("/objects/".length);
      const apiUrl = `${API}/storage/objects/${stripped}`;
      let objectUrl: string | null = null;
      fetch(apiUrl, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => {
          if (!r.ok) throw new Error("Not found");
          return r.blob();
        })
        .then((blob) => {
          objectUrl = URL.createObjectURL(blob);
          setPreviewSrc(objectUrl);
        })
        .catch(() => setPreviewSrc(null));
      return () => {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      };
    }
    setPreviewSrc(null);
  }, [value]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localPreview = URL.createObjectURL(file);
    setPreviewSrc(localPreview);
    setUploading(true);
    setError(null);

    try {
      const token = localStorage.getItem("satbds_token");
      const urlRes = await fetch(`${API}/storage/uploads/request-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
      });
      if (!urlRes.ok) throw new Error("Failed to get upload URL");
      const { uploadURL, objectPath } = await urlRes.json();

      const putRes = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!putRes.ok) throw new Error("Upload to storage failed");

      onChange(objectPath);
      toast({ title: "Image uploaded" });
    } catch (err) {
      URL.revokeObjectURL(localPreview);
      setPreviewSrc(null);
      const msg = err instanceof Error ? err.message : "Upload failed";
      setError(msg);
      toast({ title: msg, variant: "destructive" });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRemove = () => {
    onChange("");
    setPreviewSrc(null);
    setError(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
      />

      {previewSrc ? (
        <div className="flex items-center gap-3">
          <div
            className="w-16 h-16 rounded-lg border flex items-center justify-center overflow-hidden bg-gray-50 flex-shrink-0"
            style={{ borderColor: "#dee2e6" }}
          >
            <img
              src={previewSrc}
              alt="Preview"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium border disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ borderColor: "#0E6E74", color: "#0E6E74", background: "#fff" }}
            >
              {uploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              {uploading ? "Uploading…" : "Replace"}
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium border disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ borderColor: "#dee2e6", color: "#6c757d", background: "#fff" }}
            >
              <X className="w-3.5 h-3.5" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg border-2 border-dashed text-[13px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#0E6E74] hover:text-[#0E6E74]"
          style={{ borderColor: "#dee2e6", color: "#6c757d" }}
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {uploading ? "Uploading…" : "Click to upload image"}
        </button>
      )}

      {hint && !error && (
        <p className="text-[12px]" style={{ color: "#6c757d" }}>{hint}</p>
      )}
      {error && (
        <p className="text-[12px]" style={{ color: "#dc3545" }}>{error}</p>
      )}
    </div>
  );
}
