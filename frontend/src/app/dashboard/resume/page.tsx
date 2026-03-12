"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Loader2, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/error-utils";

export default function DashboardResumePage() {
  const [resumeExists, setResumeExists] = useState(false);
  const [filename, setFilename] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadResume = async () => {
    setLoading(true);
    try {
      const res = await api.get("/resume");
      setResumeExists(Boolean(res.data?.resume_exists));
      setFilename(res.data?.filename || null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResume();
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
      setResumeExists(true);
      setFilename(res.data?.filename || file.name);
      setFile(null);
      toast.success("Resume uploaded");
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
      setResumeExists(false);
      setFilename(null);
      toast.success("Resume deleted");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <section className="bg-card rounded-2xl border border-border/50 p-5 sm:p-6">
        <h1 className="text-xl font-semibold">Resume</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload your base resume once. Morphly will use it for tailored applications.
        </p>
      </section>

      <section className="bg-card rounded-2xl border border-border/50 p-5 sm:p-6 space-y-4">
        {loading ? (
          <div className="text-sm text-muted-foreground inline-flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading resume status...
          </div>
        ) : resumeExists ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 text-sm">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <FileText className="w-4.5 h-4.5 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium">Current resume</p>
                <p className="text-muted-foreground">{filename || "Uploaded file"}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Replace Resume</label>
              <Input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                accept=".pdf,.doc,.docx"
                className="rounded-lg"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={uploadResume}
                size="sm"
                className="text-xs h-8 rounded-lg gap-1.5"
                disabled={!file || uploading}
              >
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                Replace
              </Button>
              <Button
                onClick={deleteResume}
                variant="outline"
                size="sm"
                className="text-xs h-8 rounded-lg gap-1.5"
                disabled={deleting}
              >
                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Delete
              </Button>
              <Button asChild variant="ghost" size="sm" className="text-xs h-8 rounded-lg">
                <Link href="/dashboard/jobs">Go to Jobs</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">No resume uploaded yet. Add one to improve applications.</p>
            <Input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept=".pdf,.doc,.docx"
              className="rounded-lg"
            />
            <Button
              onClick={uploadResume}
              size="sm"
              className="text-xs h-8 rounded-lg gap-1.5"
              disabled={!file || uploading}
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
              Upload Resume
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
