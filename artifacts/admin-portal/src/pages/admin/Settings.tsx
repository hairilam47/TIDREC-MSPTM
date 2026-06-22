import React, { useRef, useState } from "react";
import {
  useGetSettings,
  usePutSettings,
  useRequestUploadUrl,
  getGetSettingsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/AdminLayout";
import { Upload, Loader2, ImageIcon, Trash2 } from "lucide-react";

interface LogoUploaderProps {
  slug: "tidrec" | "msptm";
  label: string;
  currentPath: string;
  onSave: (objectPath: string) => Promise<void>;
  onClear: () => Promise<void>;
  saving: boolean;
}

function LogoUploader({ slug, label, currentPath, onSave, onClear, saving }: LogoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { mutateAsync: requestUploadUrl } = useRequestUploadUrl();
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file type", description: "Please upload an image file.", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const { uploadURL, objectPath } = await requestUploadUrl({
        data: { name: file.name, size: file.size, contentType: file.type },
      });

      await fetch(uploadURL, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      await onSave(objectPath);
      toast({ title: "Logo uploaded", description: `${label} logo has been updated.` });
    } catch {
      toast({ title: "Upload failed", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const hasLogo = Boolean(currentPath);
  const previewUrl = hasLogo ? `/api/co-organiser-logo/${slug}` : null;

  return (
    <div className="flex items-start gap-4 py-4 border-b last:border-0">
      <div className="w-32 h-20 rounded-lg border bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={`${label} logo`}
            className="max-w-full max-h-full object-contain p-1"
          />
        ) : (
          <ImageIcon className="w-8 h-8 text-gray-300" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-900">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {hasLogo ? "Logo uploaded" : "No logo uploaded yet"}
        </p>
        <div className="flex gap-2 mt-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || saving}
          >
            {uploading ? (
              <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Uploading…</>
            ) : (
              <><Upload className="w-3.5 h-3.5 mr-1.5" /> {hasLogo ? "Replace" : "Upload"}</>
            )}
          </Button>
          {hasLogo && (
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={onClear}
              disabled={uploading || saving}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: settings, isLoading } = useGetSettings();
  const { mutateAsync: putSettings } = usePutSettings();
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const handleSaveLogo = async (key: string, objectPath: string) => {
    setSavingKey(key);
    try {
      await putSettings({ data: { [key]: objectPath } });
      await queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
    } finally {
      setSavingKey(null);
    }
  };

  const handleClearLogo = async (key: string) => {
    setSavingKey(key);
    try {
      await putSettings({ data: { [key]: "" } });
      await queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
      toast({ title: "Logo removed" });
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Settings</h1>
          <p className="text-sm text-gray-500 mb-6">Manage event configuration and assets.</p>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Co-organiser Logos</CardTitle>
                  <p className="text-sm text-gray-500">
                    Upload logos for co-organisers shown on the marketing site. When uploaded, the logo image replaces the text name in the co-organisers strip.
                  </p>
                </CardHeader>
                <CardContent>
                  <LogoUploader
                    slug="tidrec"
                    label="TIDREC@UM"
                    currentPath={settings?.co_organiser_tidrec_logo ?? ""}
                    onSave={(path) => handleSaveLogo("co_organiser_tidrec_logo", path)}
                    onClear={() => handleClearLogo("co_organiser_tidrec_logo")}
                    saving={savingKey === "co_organiser_tidrec_logo"}
                  />
                  <LogoUploader
                    slug="msptm"
                    label="MSPTM"
                    currentPath={settings?.co_organiser_msptm_logo ?? ""}
                    onSave={(path) => handleSaveLogo("co_organiser_msptm_logo", path)}
                    onClear={() => handleClearLogo("co_organiser_msptm_logo")}
                    saving={savingKey === "co_organiser_msptm_logo"}
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
