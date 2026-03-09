"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import { getErrorMessage } from "@/lib/error-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Trash2, UploadCloud, Check } from "lucide-react";
import { toast } from "sonner";

export function ResumeCard() {
  const [resumeExists, setResumeExists] = useState(false);
  const [filename, setFilename] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/resume").then((res) => {
      setResumeExists(res.data.resume_exists);
      setFilename(res.data.filename);
    }).catch((err) => {
      toast.error(getErrorMessage(err));
    });
  }, []);

  const upload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.post("/resume/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setResumeExists(true);
      setFilename(res.data.filename);
      setFile(null);
      toast.success("Resume uploaded successfully");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    try {
      await api.delete("/resume");
      setResumeExists(false);
      setFilename(null);
      toast.success("Resume deleted");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="bg-card rounded-2xl soft-shadow border border-border/40 p-5 space-y-4 flex flex-col">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center">
          <FileText className="w-4.5 h-4.5 text-violet-600" />
        </div>
        <div>
          <h2 className="font-semibold text-base">Resume</h2>
          <p className="text-sm text-muted-foreground">Your base resume for AI tailoring</p>
        </div>
      </div>

      {resumeExists ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 py-3">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
            <Check className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-medium">Uploaded</p>
            <p className="text-sm text-muted-foreground truncate max-w-[200px]">{filename}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={remove} className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-1.5 text-xs rounded-lg">
            <Trash2 className="w-3.5 h-3.5" /> Remove
          </Button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between gap-3">
          <div className="space-y-1.5">
            <Input type="file" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} accept=".pdf,.doc,.docx" className="text-xs rounded-lg" />
            <p className="text-[10px] text-muted-foreground">PDF, DOC, or DOCX</p>
          </div>
          <Button onClick={upload} disabled={!file || loading} size="sm" className="w-full gap-1.5 rounded-lg">
            <UploadCloud className="w-3.5 h-3.5" />
            {loading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      )}
    </div>
  );
}
