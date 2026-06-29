import React, { useRef, useState, useEffect } from "react";
import {
  useGetSettings,
  usePutSettings,
  useRequestUploadUrl,
  getGetSettingsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/AdminLayout";
import { Upload, Loader2, ImageIcon, Trash2, FileText, ExternalLink, CalendarDays, Save, Info, BookOpen, Mail } from "lucide-react";

interface LogoUploaderProps {
  slug: "tidrec" | "msptm" | "uitm" | "venue";
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

interface ProspectusUploaderProps {
  currentPath: string;
  onSave: (objectPath: string) => Promise<void>;
  onClear: () => Promise<void>;
  saving: boolean;
}

function ProspectusUploader({ currentPath, onSave, onClear, saving }: ProspectusUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { mutateAsync: requestUploadUrl } = useRequestUploadUrl();
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({ title: "Invalid file type", description: "Please upload a PDF file.", variant: "destructive" });
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
      toast({ title: "Prospectus uploaded", description: "Sponsor prospectus has been updated." });
    } catch {
      toast({ title: "Upload failed", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const hasFile = Boolean(currentPath);
  const fileName = hasFile ? currentPath.split("/").pop() ?? "sponsor-prospectus.pdf" : null;

  return (
    <div className="flex items-start gap-4 py-4">
      <div className="w-16 h-20 rounded-lg border bg-gray-50 flex items-center justify-center flex-shrink-0">
        <FileText className={`w-8 h-8 ${hasFile ? "text-amber-500" : "text-gray-300"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-900">Sponsor Prospectus PDF</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {hasFile ? (
            <span className="truncate block max-w-sm" title={fileName ?? undefined}>{fileName}</span>
          ) : (
            "No file uploaded yet"
          )}
        </p>
        <div className="flex gap-2 mt-2 flex-wrap">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
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
              <><Upload className="w-3.5 h-3.5 mr-1.5" /> {hasFile ? "Replace" : "Upload PDF"}</>
            )}
          </Button>
          {hasFile && (
            <>
              <Button
                size="sm"
                variant="outline"
                asChild
              >
                <a href="/api/sponsor-prospectus" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Preview
                </a>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={onClear}
                disabled={uploading || saving}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Remove
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const CONTACT_FIELDS = [
  { key: "contact_email", label: "Secretariat Email", placeholder: "e.g. events@msptm.network", type: "email" },
  { key: "event_venue", label: "Venue Name", placeholder: "e.g. Sunway Putra Hotel", type: "text" },
  { key: "event_city", label: "City / Country", placeholder: "e.g. Kuala Lumpur, Malaysia", type: "text" },
  { key: "contact_maps_url", label: "Google Maps URL", placeholder: "https://maps.google.com/?q=…", type: "url" },
  { key: "venue_website_url", label: "Venue Website URL", placeholder: "https://www.sunwayhotels.com/sunway-putra", type: "url" },
  { key: "organiser_full_primary", label: "Organiser (Primary)", placeholder: "e.g. Malaysian Society of Parasitology…", type: "text" },
  { key: "organiser_full_secondary", label: "Organiser (Secondary)", placeholder: "e.g. TIDREC…", type: "text" },
  { key: "co_organiser_uitm_website_url", label: "UiTM Website URL", placeholder: "https://www.uitm.edu.my", type: "url" },
] as const;

const GUIDELINE_FIELDS = [
  { key: "guideline_submission", label: "Abstract Submission Guidelines" },
  { key: "guideline_mode", label: "Mode of Presentation & Presentation Guidelines" },
  { key: "guideline_oral", label: "Oral Presentation Guidelines" },
  { key: "guideline_poster", label: "Poster Display Guidelines" },
  { key: "guideline_competition", label: "MSPTM Student Competition – Rapid Oral Presentation" },
  { key: "guideline_consent", label: "Consent, Permission & Copyright" },
] as const;

const DATE_FIELDS = [
  { key: "date_registration_opens", label: "Registration Opens" },
  { key: "date_early_bird_closes", label: "Early Bird Registration Closes" },
  { key: "date_abstract_submission_closes", label: "Abstract Submission Closes" },
  { key: "date_regular_submission_closes", label: "Regular Submission Closes" },
  { key: "date_conference", label: "Conference Dates" },
] as const;

const EVENT_DETAIL_FIELDS = [
  { key: "event_name", label: "Event Name", placeholder: "e.g. 3rd Southeast Asia Ticks and Tick-borne Diseases Symposium", multiline: false },
  { key: "event_short_name", label: "Short Name / Acronym", placeholder: "e.g. SEAT-MSPTM 2027", multiline: false },
  { key: "event_dates", label: "Event Dates (display)", placeholder: "e.g. 22–23 March 2027", multiline: false },
  { key: "event_venue", label: "Venue", placeholder: "e.g. Sunway Putra Hotel", multiline: false },
  { key: "event_city", label: "City / Country", placeholder: "e.g. Kuala Lumpur, Malaysia", multiline: false },
  { key: "hero_subtitle", label: "Hero Subtitle", placeholder: "One-sentence tagline shown on the home page hero", multiline: true },
  { key: "about_text", label: "About Text", placeholder: "Paragraph shown in the About section on the home page", multiline: true },
  { key: "registration_target", label: "Registration Target", placeholder: "e.g. 300", multiline: false },
] as const;

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: settings, isLoading } = useGetSettings();
  const { mutateAsync: putSettings } = usePutSettings();
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [dateValues, setDateValues] = useState<Record<string, string>>({});
  const [savingDates, setSavingDates] = useState(false);
  const [eventDetailValues, setEventDetailValues] = useState<Record<string, string>>({});
  const [savingEventDetails, setSavingEventDetails] = useState(false);
  const [guidelineValues, setGuidelineValues] = useState<Record<string, string>>({});
  const [savingGuidelines, setSavingGuidelines] = useState(false);
  const [contactValues, setContactValues] = useState<Record<string, string>>({});
  const [savingContact, setSavingContact] = useState(false);

  useEffect(() => {
    if (settings) {
      const vals: Record<string, string> = {};
      for (const { key } of DATE_FIELDS) {
        vals[key] = (settings as Record<string, string>)[key] ?? "";
      }
      setDateValues(vals);

      const edVals: Record<string, string> = {};
      for (const { key } of EVENT_DETAIL_FIELDS) {
        edVals[key] = (settings as Record<string, string>)[key] ?? "";
      }
      setEventDetailValues(edVals);

      const gVals: Record<string, string> = {};
      for (const { key } of GUIDELINE_FIELDS) {
        gVals[key] = (settings as Record<string, string>)[key] ?? "";
      }
      setGuidelineValues(gVals);

      const cVals: Record<string, string> = {};
      for (const { key } of CONTACT_FIELDS) {
        cVals[key] = (settings as Record<string, string>)[key] ?? "";
      }
      setContactValues(cVals);
    }
  }, [settings]);

  const handleSaveEventDetails = async () => {
    setSavingEventDetails(true);
    try {
      await putSettings({ data: eventDetailValues });
      await queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
      toast({ title: "Event details saved", description: "The marketing site will now show the updated content." });
    } catch {
      toast({ title: "Save failed", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setSavingEventDetails(false);
    }
  };

  const handleSaveDates = async () => {
    setSavingDates(true);
    try {
      await putSettings({ data: dateValues });
      await queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
      toast({ title: "Important dates saved", description: "The marketing site will now show the updated dates." });
    } catch {
      toast({ title: "Save failed", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setSavingDates(false);
    }
  };

  const handleSaveGuidelines = async () => {
    setSavingGuidelines(true);
    try {
      await putSettings({ data: guidelineValues });
      await queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
      toast({ title: "Abstract guidelines saved", description: "The public abstract page will now show the updated text." });
    } catch {
      toast({ title: "Save failed", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setSavingGuidelines(false);
    }
  };

  const handleSaveContact = async () => {
    setSavingContact(true);
    try {
      await putSettings({ data: contactValues });
      await queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
      toast({ title: "Contact details saved", description: "The public contact page will now show the updated information." });
    } catch {
      toast({ title: "Save failed", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setSavingContact(false);
    }
  };

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

  const handleSaveProspectus = async (objectPath: string) => {
    setSavingKey("sponsor_prospectus_url");
    try {
      await putSettings({ data: { sponsor_prospectus_url: objectPath } });
      await queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
    } finally {
      setSavingKey(null);
    }
  };

  const handleClearProspectus = async () => {
    setSavingKey("sponsor_prospectus_url");
    try {
      await putSettings({ data: { sponsor_prospectus_url: "" } });
      await queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
      toast({ title: "Sponsor prospectus removed" });
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
                  <CardTitle className="text-base flex items-center gap-2">
                    <Info className="w-4 h-4 text-amber-500" />
                    Event Details
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    Core content shown on the marketing site — name, venue, tagline, and about text.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {EVENT_DETAIL_FIELDS.map(({ key, label, placeholder, multiline }) => (
                      <div key={key} className="space-y-1.5">
                        <Label htmlFor={key} className="text-sm font-medium text-gray-700">{label}</Label>
                        {multiline ? (
                          <Textarea
                            id={key}
                            value={eventDetailValues[key] ?? ""}
                            onChange={(e) => setEventDetailValues(prev => ({ ...prev, [key]: e.target.value }))}
                            placeholder={placeholder}
                            disabled={savingEventDetails}
                            rows={key === "about_text" ? 4 : 2}
                            className="resize-y"
                          />
                        ) : (
                          <Input
                            id={key}
                            value={eventDetailValues[key] ?? ""}
                            onChange={(e) => setEventDetailValues(prev => ({ ...prev, [key]: e.target.value }))}
                            placeholder={placeholder}
                            disabled={savingEventDetails}
                          />
                        )}
                      </div>
                    ))}
                    <div className="pt-2 flex justify-end">
                      <Button onClick={handleSaveEventDetails} disabled={savingEventDetails}>
                        {savingEventDetails ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…</>
                        ) : (
                          <><Save className="w-4 h-4 mr-2" /> Save Event Details</>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-amber-500" />
                    Important Dates
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    Set the key dates shown on the marketing site. Use any readable format, e.g. <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">15 Jan 2027</code> or <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">22–23 Mar 2027</code>.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {DATE_FIELDS.map(({ key, label }) => (
                      <div key={key} className="grid grid-cols-[1fr_auto] gap-3 items-end">
                        <div className="space-y-1.5">
                          <Label htmlFor={key} className="text-sm font-medium text-gray-700">{label}</Label>
                          <Input
                            id={key}
                            value={dateValues[key] ?? ""}
                            onChange={(e) => setDateValues(prev => ({ ...prev, [key]: e.target.value }))}
                            placeholder={`e.g. 10 Aug 2026`}
                            disabled={savingDates}
                          />
                        </div>
                      </div>
                    ))}
                    <div className="pt-2 flex justify-end">
                      <Button onClick={handleSaveDates} disabled={savingDates}>
                        {savingDates ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…</>
                        ) : (
                          <><Save className="w-4 h-4 mr-2" /> Save Dates</>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-500" />
                    Abstract Guidelines
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    Edit the body text for each guideline accordion item shown on the public abstract page.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {GUIDELINE_FIELDS.map(({ key, label }) => (
                      <div key={key} className="space-y-1.5">
                        <Label htmlFor={key} className="text-sm font-medium text-gray-700">{label}</Label>
                        <Textarea
                          id={key}
                          value={guidelineValues[key] ?? ""}
                          onChange={(e) => setGuidelineValues(prev => ({ ...prev, [key]: e.target.value }))}
                          placeholder={`Enter text for "${label}"…`}
                          disabled={savingGuidelines}
                          rows={4}
                          className="resize-y"
                        />
                      </div>
                    ))}
                    <div className="pt-2 flex justify-end">
                      <Button onClick={handleSaveGuidelines} disabled={savingGuidelines}>
                        {savingGuidelines ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…</>
                        ) : (
                          <><Save className="w-4 h-4 mr-2" /> Save Guidelines</>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Mail className="w-4 h-4 text-amber-500" />
                    Contact Details
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    Information shown on the public Contact page — secretariat email, venue, and organiser names.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {CONTACT_FIELDS.map(({ key, label, placeholder }) => (
                      <div key={key} className="space-y-1.5">
                        <Label htmlFor={`contact-${key}`} className="text-sm font-medium text-gray-700">{label}</Label>
                        <Input
                          id={`contact-${key}`}
                          value={contactValues[key] ?? ""}
                          onChange={(e) => setContactValues(prev => ({ ...prev, [key]: e.target.value }))}
                          placeholder={placeholder}
                          disabled={savingContact}
                        />
                      </div>
                    ))}
                    <div className="pt-2 flex justify-end">
                      <Button onClick={handleSaveContact} disabled={savingContact}>
                        {savingContact ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…</>
                        ) : (
                          <><Save className="w-4 h-4 mr-2" /> Save Contact Details</>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Co-organiser &amp; Venue Logos</CardTitle>
                  <p className="text-sm text-gray-500">
                    Upload logos shown on the marketing site co-organisers strip. When uploaded, the image replaces the text name.
                  </p>
                </CardHeader>
                <CardContent>
                  <LogoUploader
                    slug="tidrec"
                    label="TIDREC"
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
                  <LogoUploader
                    slug="uitm"
                    label="UiTM"
                    currentPath={(settings as Record<string, string> | undefined)?.co_organiser_uitm_logo ?? ""}
                    onSave={(path) => handleSaveLogo("co_organiser_uitm_logo", path)}
                    onClear={() => handleClearLogo("co_organiser_uitm_logo")}
                    saving={savingKey === "co_organiser_uitm_logo"}
                  />
                  <LogoUploader
                    slug="venue"
                    label="Venue (Sunway Putra Hotel)"
                    currentPath={settings?.venue_logo ?? ""}
                    onSave={(path) => handleSaveLogo("venue_logo", path)}
                    onClear={() => handleClearLogo("venue_logo")}
                    saving={savingKey === "venue_logo"}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Sponsor Prospectus</CardTitle>
                  <p className="text-sm text-gray-500">
                    Upload the sponsor prospectus PDF. When set, it is available for download on the marketing site and via the <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">/api/sponsor-prospectus</code> endpoint.
                  </p>
                </CardHeader>
                <CardContent>
                  <ProspectusUploader
                    currentPath={settings?.sponsor_prospectus_url ?? ""}
                    onSave={handleSaveProspectus}
                    onClear={handleClearProspectus}
                    saving={savingKey === "sponsor_prospectus_url"}
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
