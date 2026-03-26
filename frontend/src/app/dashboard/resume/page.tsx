"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  FileText,
  Loader2,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InfoCallout,
  PageHeader,
  SectionEyebrow,
  SectionHeader,
  StatusBadge,
  SurfaceCard,
} from "@/components/ui/product-shell";
import { getErrorMessage } from "@/lib/error-utils";
import api from "@/services/api";

interface ResumeState {
  resumeExists: boolean;
  filename: string | null;
}

interface ProfilePreview {
  desired_role?: string | null;
  skills?: string[];
  experience_level?: string | null;
  location?: string | null;
  summary?: string | null;
}

export default function DashboardResumePage() {
  const [resume, setResume] = useState<ResumeState>({ resumeExists: false, filename: null });
  const [profilePreview, setProfilePreview] = useState<ProfilePreview | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const uploadReady = Boolean(file);
  const previewSkills = useMemo(() => profilePreview?.skills?.slice(0, 8) || [], [profilePreview?.skills]);

  const loadState = async () => {
    setLoading(true);
    try {
      const [resumeRes, profileRes] = await Promise.all([api.get("/resume"), api.get("/profile")]);
      setResume({
        resumeExists: Boolean(resumeRes.data?.resume_exists),
        filename: resumeRes.data?.filename || null,
      });
      setProfilePreview(profileRes.data?.extracted_profile || null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadState();
  }, []);

  const uploadResume = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResume({ resumeExists: true, filename: res.data?.filename || file.name });
      setProfilePreview(res.data?.extracted_profile || null);
      setFile(null);
      toast.success("Base resume uploaded and profile extracted");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const deleteResume = async () => {
    setDeleting(true);
    try {
      await api.delete("/resume");
      setResume({ resumeExists: false, filename: null });
      setProfilePreview(null);
      toast.success("Base resume deleted");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 content-fade-in">
      <PageHeader
        eyebrow={<SectionEyebrow icon={FileText} label="Onboarding step 1 of 3" />}
        title="Upload one base resume that Morphly can use as the factual source for your whole workflow."
        description="This is the document Morphly reads to build your starting profile and generate grounded drafts later. Replacing it refreshes extraction automatically."
        actions={resume.resumeExists ? <StatusBadge tone="success">Resume ready</StatusBadge> : <StatusBadge tone="attention">Resume needed</StatusBadge>}
      />

      <section className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <SurfaceCard>
          <SectionHeader
            title={resume.resumeExists ? "Manage your base resume" : "Start with one clean base resume"}
            description={
              resume.resumeExists
                ? "You can replace the current file any time. A new upload refreshes the extracted profile used across the app."
                : "Uploading your resume unlocks profile extraction, better matching, and more grounded document generation."
            }
          />

          {loading ? (
            <div className="mt-5 inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading resume status...
            </div>
          ) : (
            <div className="mt-5 space-y-5">
              {resume.resumeExists ? (
                <InfoCallout
                  title="Current base resume"
                  description={resume.filename || "Uploaded file"}
                  tone="success"
                />
              ) : (
                <InfoCallout
                  title="What to upload"
                  description="Use the resume version you trust most as your baseline. Tailoring should start from something factual and stable."
                />
              )}

              <div className="dashed-dropzone rounded-[1.5rem] px-4 py-5 sm:rounded-[1.75rem] sm:px-5 sm:py-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-2">
                    <p className="text-base font-semibold tracking-tight text-foreground">
                      {resume.resumeExists ? "Replace with a fresher version" : "Upload your resume"}
                    </p>
                    <p className="max-w-lg text-sm leading-6 text-muted-foreground">
                      Supported formats: PDF, DOC, DOCX. PDF parsing may be less precise than DOCX, but it is still supported.
                    </p>
                  </div>
                  <Input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    accept=".pdf,.doc,.docx"
                    className="w-full bg-background lg:max-w-xs"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                <Button onClick={uploadResume} disabled={!file || uploading} className="w-full sm:w-auto">
                  {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}
                  {uploadReady ? `Upload ${file?.name}` : resume.resumeExists ? "Replace resume" : "Upload base resume"}
                </Button>
                {resume.resumeExists ? (
                  <Button onClick={deleteResume} variant="outline" disabled={deleting} className="w-full sm:w-auto">
                    {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    Delete
                  </Button>
                ) : null}
                <Button asChild variant="ghost" className="w-full sm:w-auto">
                  <Link href="/dashboard/preferences">
                    Review profile
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </SurfaceCard>

        <div className="grid gap-4">
          <SurfaceCard>
            <SectionHeader
              title="Latest extraction preview"
              description="This is what Morphly currently understands from the resume you uploaded."
            />

            <div className="mt-5 space-y-4 text-sm">
              {previewSkills.length ? (
                <div className="flex flex-wrap gap-2">
                  {previewSkills.map((skill) => (
                    <StatusBadge key={skill} tone="info">{skill}</StatusBadge>
                  ))}
                </div>
              ) : null}

              <div className="space-y-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Role</p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{profilePreview?.desired_role || "Not detected yet."}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Experience level</p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{profilePreview?.experience_level || "Not detected yet."}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Location</p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{profilePreview?.location || "Not detected yet."}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Summary</p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{profilePreview?.summary || "No summary extracted yet."}</p>
                </div>
              </div>
            </div>
          </SurfaceCard>

          <InfoCallout
            title="Next step after upload"
            description="Once the extraction looks reasonable, open the profile review screen and confirm the parts that should influence matching and draft generation."
            tone="success"
          />
        </div>
      </section>
    </div>
  );
}
