"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FileCheck2,
  FileSignature,
  FileText,
  Loader2,
  Save,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  EmptyState,
  InfoCallout,
  PageHeader,
  SectionEyebrow,
  SectionHeader,
  StatusBadge,
  SurfaceCard,
  WorkspacePane,
} from "@/components/ui/product-shell";
import { getErrorMessage } from "@/lib/error-utils";
import api from "@/services/api";
import { useApplicationsStore } from "@/store/applications";
import { type Job, useJobsStore } from "@/store/jobs";

type WorkspaceTab = "resume" | "cover-letter";

interface GeneratedResume {
  job_id: string;
  title: string;
  grounding: string[];
  sections: Array<{
    id: string;
    title: string;
    content: string;
  }>;
}

interface GeneratedCoverLetter {
  job_id: string;
  content: string;
  grounding: string[];
}

const editorClassName =
  "min-h-[180px] w-full rounded-[1.5rem] border border-border/70 bg-background/92 px-4 py-3 text-sm leading-7 text-foreground outline-none transition-[border-color,box-shadow] focus:ring-4 focus:ring-ring/12";

function formatStatusLabel(status?: string) {
  if (status === "applied") return "Applied";
  if (status === "ready") return "Ready";
  return "Saved";
}

function formatStatusTone(status?: string) {
  if (status === "applied") return "success" as const;
  if (status === "ready") return "info" as const;
  return "attention" as const;
}

function formatDateTime(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function JobWorkspacePage() {
  const params = useParams<{ jobId: string }>();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") === "cover-letter" ? "cover-letter" : "resume";
  const [activeTab, setActiveTab] = useState<WorkspaceTab>(defaultTab);
  const [job, setJob] = useState<Job | null>(null);
  const [jobLoading, setJobLoading] = useState(true);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [coverLoading, setCoverLoading] = useState(false);
  const [resumeDraft, setResumeDraft] = useState<GeneratedResume | null>(null);
  const [coverLetterDraft, setCoverLetterDraft] = useState<GeneratedCoverLetter | null>(null);
  const [resumeDirty, setResumeDirty] = useState(false);
  const [coverDirty, setCoverDirty] = useState(false);
  const [autosaving, setAutosaving] = useState(false);
  const hydratedApplicationId = useRef<string | null>(null);

  const { getJobById } = useJobsStore();
  const { applications, fetchApplications, saveApplication, updateApplication, updateStatus } = useApplicationsStore();
  const application = applications.find((item) => item.job_id === params.jobId);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    const load = async () => {
      setJobLoading(true);
      try {
        const [jobData] = await Promise.all([getJobById(params.jobId), fetchApplications()]);
        setJob(jobData);
      } finally {
        setJobLoading(false);
      }
    };

    void load();
  }, [fetchApplications, getJobById, params.jobId]);

  useEffect(() => {
    if (!application || hydratedApplicationId.current === application.id) return;

    if (application.resume_sections?.length) {
      setResumeDraft({
        job_id: application.job_id,
        title: "Tailored Resume",
        sections: application.resume_sections,
        grounding: application.resume_grounding || [],
      });
    }

    if (application.cover_letter_content) {
      setCoverLetterDraft({
        job_id: application.job_id,
        content: application.cover_letter_content,
        grounding: application.cover_letter_grounding || [],
      });
    }

    hydratedApplicationId.current = application.id;
  }, [application]);

  const saveDraftState = useCallback(
    async (payload: {
      status?: "saved" | "ready" | "applied";
      resume_sections?: GeneratedResume["sections"];
      resume_grounding?: string[];
      cover_letter_content?: string;
      cover_letter_grounding?: string[];
    }) => {
      if (application) {
        return updateApplication(application.id, payload);
      }

      return saveApplication({
        job_id: params.jobId,
        status: payload.status ?? "ready",
        resume_sections: payload.resume_sections,
        resume_grounding: payload.resume_grounding,
        cover_letter_content: payload.cover_letter_content,
        cover_letter_grounding: payload.cover_letter_grounding,
      });
    },
    [application, params.jobId, saveApplication, updateApplication]
  );

  const generateResume = async () => {
    setActiveTab("resume");
    setResumeLoading(true);
    try {
      const res = await api.post("/ai/generate-resume", { job_id: params.jobId });
      const draft = res.data as GeneratedResume;
      setResumeDraft(draft);
      setResumeDirty(false);
      await saveDraftState({
        status: "ready",
        resume_sections: draft.sections,
        resume_grounding: draft.grounding,
      });
      toast.success("Tailored resume draft is ready");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setResumeLoading(false);
    }
  };

  const generateCoverLetter = async () => {
    setActiveTab("cover-letter");
    setCoverLoading(true);
    try {
      const res = await api.post("/ai/generate-cover-letter", { job_id: params.jobId });
      const draft = res.data as GeneratedCoverLetter;
      setCoverLetterDraft(draft);
      setCoverDirty(false);
      await saveDraftState({
        status: "ready",
        cover_letter_content: draft.content,
        cover_letter_grounding: draft.grounding,
      });
      toast.success("Cover letter draft is ready");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setCoverLoading(false);
    }
  };

  useEffect(() => {
    if (!resumeDirty || !resumeDraft?.sections?.length) return;

    const timeout = window.setTimeout(async () => {
      setAutosaving(true);
      const saved = await saveDraftState({
        status: application?.status === "applied" ? "applied" : "ready",
        resume_sections: resumeDraft.sections,
        resume_grounding: resumeDraft.grounding,
      });
      if (saved) {
        setResumeDirty(false);
      }
      setAutosaving(false);
    }, 800);

    return () => window.clearTimeout(timeout);
  }, [application?.status, resumeDirty, resumeDraft, saveDraftState]);

  useEffect(() => {
    if (!coverDirty || !coverLetterDraft?.content) return;

    const timeout = window.setTimeout(async () => {
      setAutosaving(true);
      const saved = await saveDraftState({
        status: application?.status === "applied" ? "applied" : "ready",
        cover_letter_content: coverLetterDraft.content,
        cover_letter_grounding: coverLetterDraft.grounding,
      });
      if (saved) {
        setCoverDirty(false);
      }
      setAutosaving(false);
    }, 800);

    return () => window.clearTimeout(timeout);
  }, [application?.status, coverDirty, coverLetterDraft, saveDraftState]);

  const markApplied = async () => {
    if (!application) {
      const created = await saveDraftState({
        status: "applied",
        resume_sections: resumeDraft?.sections,
        resume_grounding: resumeDraft?.grounding,
        cover_letter_content: coverLetterDraft?.content,
        cover_letter_grounding: coverLetterDraft?.grounding,
      });
      if (created) toast.success("Application marked as applied");
      return;
    }

    const updated = await updateStatus(application.id, "applied");
    if (updated) {
      toast.success("Application marked as applied");
    } else {
      toast.error("Failed to update application status");
    }
  };

  if (jobLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (!job) {
    return <div className="text-sm text-muted-foreground">This job could not be loaded.</div>;
  }

  const applyHref = job.apply_url || job.url;
  const grounding = activeTab === "resume" ? resumeDraft?.grounding : coverLetterDraft?.grounding;
  const lastSavedLabel = formatDateTime(application?.updated_at);
  const hasResumeDraft = Boolean(resumeDraft?.sections?.length);
  const hasCoverDraft = Boolean(coverLetterDraft?.content);
  const activeDraftDescription =
    activeTab === "resume"
      ? "Shape the section order and phrasing before you apply."
      : "Keep the note concise, specific, and truthful to your real experience.";

  return (
    <div className="space-y-6 content-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <Button asChild variant="ghost" className="w-full sm:w-auto">
          <Link href="/dashboard/jobs">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to jobs
          </Link>
        </Button>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          {autosaving ? <StatusBadge tone="info" icon={Save}>Saving draft</StatusBadge> : null}
          {lastSavedLabel ? <StatusBadge>Saved {lastSavedLabel}</StatusBadge> : null}
          <Button variant="outline" onClick={markApplied} className="w-full sm:w-auto">
            <FileCheck2 className="h-3.5 w-3.5" />
            Mark applied
          </Button>
          {applyHref ? (
            <Button asChild className="w-full sm:w-auto">
              <a href={applyHref} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
                Apply on source
              </a>
            </Button>
          ) : (
            <Button disabled className="w-full sm:w-auto">
              <ExternalLink className="h-3.5 w-3.5" />
              Apply on source
            </Button>
          )}
        </div>
      </div>

      <PageHeader
        eyebrow={<SectionEyebrow icon={Sparkles} label={job.source || "Job workspace"} />}
        title={job.title}
        description={`${job.company} · ${job.location || "Remote"}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone={formatStatusTone(application?.status)}>
              {formatStatusLabel(application?.status)}
            </StatusBadge>
            {hasResumeDraft ? <StatusBadge tone="info">Resume draft saved</StatusBadge> : null}
            {hasCoverDraft ? <StatusBadge tone="success">Cover letter saved</StatusBadge> : null}
          </div>
        }
      />

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <WorkspacePane
          title="Draft workspace"
          description={activeDraftDescription}
          headerAction={
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
              <Button variant={activeTab === "resume" ? "default" : "outline"} onClick={() => setActiveTab("resume")} className="w-full sm:w-auto">
                Resume draft
              </Button>
              <Button variant={activeTab === "cover-letter" ? "default" : "outline"} onClick={() => setActiveTab("cover-letter")} className="w-full sm:w-auto">
                Cover letter
              </Button>
            </div>
          }
        >
          <InfoCallout
            title="Drafts persist with tracking now"
            description="Generate once, then keep refining. Your edits are saved back into tracking so you can leave this page and return without losing the work."
          />

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <Button onClick={generateResume} disabled={resumeLoading} className="w-full sm:w-auto">
              {resumeLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
              {hasResumeDraft ? "Refresh resume draft" : "Generate resume"}
            </Button>
            <Button onClick={generateCoverLetter} variant="outline" disabled={coverLoading} className="w-full sm:w-auto">
              {coverLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileSignature className="h-3.5 w-3.5" />}
              {hasCoverDraft ? "Refresh cover letter" : "Generate cover letter"}
            </Button>
          </div>

          <div className="mt-6 space-y-4">
            {activeTab === "resume" ? (
              hasResumeDraft && resumeDraft ? (
                resumeDraft.sections.map((section) => (
                  <div key={section.id} className="space-y-2.5">
                    <label className="text-sm font-semibold text-foreground">{section.title}</label>
                    <textarea
                      value={section.content}
                      onChange={(event) => {
                        setResumeDraft((current) =>
                          current
                            ? {
                                ...current,
                                sections: current.sections.map((item) =>
                                  item.id === section.id ? { ...item, content: event.target.value } : item
                                ),
                              }
                            : current
                        );
                        setResumeDirty(true);
                      }}
                      className={editorClassName}
                    />
                  </div>
                ))
              ) : (
                <EmptyState
                  icon={WandSparkles}
                  title="Generate a tailored resume draft"
                  description="Morphly will build sections grounded in your uploaded resume and shaped around this role's signals."
                  action={<Button onClick={generateResume}>Generate resume</Button>}
                />
              )
            ) : hasCoverDraft && coverLetterDraft ? (
              <textarea
                value={coverLetterDraft.content}
                onChange={(event) => {
                  setCoverLetterDraft((current) => (current ? { ...current, content: event.target.value } : current));
                  setCoverDirty(true);
                }}
                className={`${editorClassName} min-h-[360px] sm:min-h-[460px]`}
              />
            ) : (
              <EmptyState
                icon={FileSignature}
                title="Generate a focused cover letter"
                description="Use this when you want a concise first draft aligned to the role, company context, and your strongest evidence."
                action={<Button onClick={generateCoverLetter}>Generate cover letter</Button>}
              />
            )}
          </div>
        </WorkspacePane>

        <div className="grid gap-4">
          <SurfaceCard>
            <SectionHeader
              title="Grounding notes"
              description="Signals Morphly used to shape the current draft."
            />
            <div className="mt-5 space-y-4">
              {grounding?.length ? (
                <div className="flex flex-wrap gap-2">
                  {grounding.map((item) => (
                    <StatusBadge key={item} tone="info">{item}</StatusBadge>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-6 text-muted-foreground">Generate a draft to see the grounding signals here.</p>
              )}
              {job.match_reasons?.length ? (
                <div className="surface-subtle rounded-[1.35rem] border border-border/70 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Why this role fits</p>
                  <div className="mt-3 space-y-2.5">
                    {job.match_reasons.map((reason) => (
                      <div key={reason} className="flex items-start gap-2.5 text-sm leading-6 text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </SurfaceCard>

          <SurfaceCard>
            <SectionHeader
              title="Tracking snapshot"
              description="Keep the external apply step and your internal prep status aligned."
            />
            <div className="mt-5 space-y-3">
              <div className="surface-subtle rounded-[1.35rem] border border-border/70 p-4 text-sm text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">Current status:</span>{" "}
                  {formatStatusLabel(application?.status)}
                </p>
                <p className="mt-2">
                  <span className="font-medium text-foreground">Resume draft:</span>{" "}
                  {hasResumeDraft ? "Saved to tracking" : "Not generated yet"}
                </p>
                <p className="mt-2">
                  <span className="font-medium text-foreground">Cover letter:</span>{" "}
                  {hasCoverDraft ? "Saved to tracking" : "Not generated yet"}
                </p>
                <p className="mt-2">
                  <span className="font-medium text-foreground">Last activity:</span>{" "}
                  {lastSavedLabel || "Nothing saved yet"}
                </p>
              </div>
              <InfoCallout
                title="Apply stays manual by design"
                description="Morphly prepares the materials and keeps your workflow organized. Final submission still happens on the original source so you stay in control."
                tone="success"
              />
            </div>
          </SurfaceCard>

          <SurfaceCard>
            <SectionHeader
              title="Job description"
              description="Keep the original source context visible while editing."
            />
            {job.description ? (
              <div className="mt-5 max-h-[420px] overflow-auto rounded-[1.35rem] border border-border/70 bg-background/88 px-4 py-4 text-sm leading-7 text-muted-foreground">
                {job.description}
              </div>
            ) : (
              <div className="mt-5 rounded-[1.35rem] border border-dashed border-border/70 px-4 py-6 text-sm text-muted-foreground">
                This listing does not include a detailed description yet.
              </div>
            )}
          </SurfaceCard>
        </div>
      </section>
    </div>
  );
}
