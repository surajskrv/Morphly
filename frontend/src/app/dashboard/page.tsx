"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  RefreshCw,
  Settings2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { useQueryClient } from "@tanstack/react-query";

import { ApplicationCard } from "@/components/dashboard/application-card";
import { JobCard } from "@/components/dashboard/job-card";
import { Button } from "@/components/ui/button";
import {
  EmptyState,
  InfoCallout,
  MetricTile,
  SectionEyebrow,
  SectionHeader,
  StatusBadge,
  SurfaceCard,
} from "@/components/ui/product-shell";
import { 
  useRecommendedJobs, 
  useApplications, 
  useProfile, 
  useResumeStatus, 
  useTriggerJobFetch 
} from "@/hooks/queries";
import { Job } from "@/store/jobs";
import { ApplicationRecord } from "@/store/applications";

export default function DashboardOverviewPage() {
  const queryClient = useQueryClient();
  const { data: jobs = [], isLoading: jobsLoading } = useRecommendedJobs();
  const { data: applications = [], isLoading: applicationsLoading } = useApplications();
  const { data: resumeData } = useResumeStatus();
  const { data: profileData } = useProfile();
  const { mutateAsync: triggerJobFetch } = useTriggerJobFetch();

  const [refreshing, setRefreshing] = useState(false);

  const resumeExists = !!resumeData?.resume_exists;
  const profile = profileData?.merged_profile || {};

  const profileScore = useMemo(() => {
    const checkpoints = [!!profile.desired_role, !!profile.location, !!profile.skills?.length, resumeExists];
    const completed = checkpoints.filter(Boolean).length;
    return Math.round((completed / checkpoints.length) * 100);
  }, [profile.desired_role, profile.location, profile.skills, resumeExists]);

  const topJobs = jobs.slice(0, 2);
  const recentApplications = applications.slice(0, 2);
  const savedCount = applications.filter((item: ApplicationRecord) => item.status === "saved").length;
  const readyCount = applications.filter((item: ApplicationRecord) => item.status === "ready").length;
  const appliedCount = applications.filter((item: ApplicationRecord) => item.status === "applied").length;
  const readinessTone = profileScore >= 75 ? "success" : profileScore >= 50 ? "default" : "attention";

  const setupItems = [
    {
      label: "Base resume",
      detail: resumeExists ? "Ready for extraction" : "Still needed",
      done: resumeExists,
      href: "/dashboard/resume",
    },
    {
      label: "Profile review",
      detail: profileScore >= 50 ? "Enough signal captured" : "Needs confirmation",
      done: profileScore >= 50,
      href: "/dashboard/preferences",
    },
    {
      label: "First draft",
      detail: applications.length > 0 ? "Tracking started" : "Not started yet",
      done: applications.length > 0,
      href: "/dashboard/jobs",
    },
  ];

  const focusState = !resumeExists
    ? {
        badge: "Start here",
        tone: "attention" as const,
        title: "Upload your base resume to unlock the rest of the workspace.",
        description:
          "Everything gets better once Morphly has your source material. We can extract your profile, rank jobs more cleanly, and ground tailored drafts in real experience.",
        primaryHref: "/dashboard/resume",
        primaryLabel: "Upload resume",
        secondaryHref: "/dashboard/preferences",
        secondaryLabel: "Preview profile",
      }
    : profileScore < 75
      ? {
          badge: "Needs review",
          tone: "info" as const,
          title: "Tighten your profile before you spend time on weaker matches.",
          description:
            "A quick review of role, location, and skills makes job ranking sharper and gives the draft generator better grounding.",
          primaryHref: "/dashboard/preferences",
          primaryLabel: "Review profile",
          secondaryHref: "/dashboard/jobs",
          secondaryLabel: "Browse jobs",
        }
      : applications.length === 0
        ? {
            badge: "Ready to move",
            tone: "success" as const,
            title: "Your setup is in good shape. Prepare the first tailored draft next.",
            description:
              "Pick a strong-fit role, generate a resume and cover letter draft, then apply on the original listing with more confidence.",
            primaryHref: "/dashboard/jobs",
            primaryLabel: "Browse matched jobs",
            secondaryHref: "/dashboard/applied",
            secondaryLabel: "Open tracking",
          }
        : {
            badge: "In motion",
            tone: "success" as const,
            title: "Your search is already moving. Keep the momentum tidy.",
            description:
              "Use the workspace for fresh matches, and keep tracking up to date so you always know which roles are worth revisiting.",
            primaryHref: "/dashboard/applied",
            primaryLabel: "Open tracking",
            secondaryHref: "/dashboard/jobs",
            secondaryLabel: "Review more jobs",
          };

  const triggerRefresh = async () => {
    setRefreshing(true);
    try {
      await triggerJobFetch();
      toast.success("Fresh job collection started");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    } catch {
      toast.error("Failed to trigger job fetch");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="space-y-6 content-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1 my-2">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">A calmer view of what matters right now.</h1>
          <p className="text-sm text-muted-foreground mt-1">See your setup status, strongest next move, and the jobs or applications that deserve attention first.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={triggerRefresh} disabled={refreshing}>
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh jobs
          </Button>
          <Button asChild>
            <Link href="/dashboard/jobs">Browse jobs</Link>
          </Button>
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 stagger-fade-in">
        <MetricTile
          icon={BriefcaseBusiness}
          label="Matched roles"
          value={jobs.length}
          detail="Recommended roles already ranked against your current profile and preferences."
        />
        <MetricTile
          icon={ClipboardCheck}
          label="Active tracking"
          value={applications.length}
          detail={
            applications.length > 0
              ? `${readyCount} ready, ${appliedCount} applied, ${savedCount} saved for later.`
              : "Saved roles and prepared applications will appear here once you start." 
          }
        />
        <MetricTile
          icon={Settings2}
          label="Search readiness"
          value={`${profileScore}%`}
          tone={readinessTone}
          detail="Resume, profile, and skills quality combined into one quick readiness signal."
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <SurfaceCard className="p-5 sm:p-6 md:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <StatusBadge tone={focusState.tone}>{focusState.badge}</StatusBadge>
              <div className="space-y-3">
                <h2 className="text-xl sm:text-2xl md:text-[1.9rem] font-semibold tracking-tight text-foreground leading-snug">
                  {focusState.title}
                </h2>
                <p className="max-w-xl text-xs sm:text-sm leading-6 text-muted-foreground md:text-[15px] sm:leading-7">
                  {focusState.description}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2">
                <Button asChild className="w-full sm:w-auto">
                  <Link href={focusState.primaryHref}>{focusState.primaryLabel}</Link>
                </Button>
                <Button asChild variant="ghost" className="w-full sm:w-auto">
                  <Link href={focusState.secondaryHref}>
                    {focusState.secondaryLabel}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid w-full gap-2 sm:gap-3 sm:grid-cols-3 lg:w-[320px] lg:grid-cols-1">
              {setupItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="surface-subtle soft-shadow-hover flex items-center gap-3 rounded-[1.35rem] border border-border/70 px-4 py-3 transition-colors"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${item.done ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-primary/10 bg-primary/10 text-primary"}`}
                  >
                    {item.done ? <CheckCircle2 className="h-4.5 w-4.5" /> : <FileText className="h-4.5 w-4.5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="text-xs leading-5 text-muted-foreground">{item.detail}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </SurfaceCard>

        <div className="grid gap-4">
          <SurfaceCard>
            <SectionHeader
              title="Workspace snapshot"
              description="A quick read on the signals shaping your recommendations and drafts."
            />
            <div className="mt-5 space-y-3">
              <InfoCallout
                tone={resumeExists ? "success" : "attention"}
                title={resumeExists ? "Base resume is ready" : "Base resume is still missing"}
                description={
                  resumeExists
                    ? "Your resume is available as the factual source for extraction and tailored document generation."
                    : "Upload one source resume before relying on extracted profile details or generated drafts."
                }
              />
              <div className="surface-subtle rounded-[1.35rem] border border-border/70 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Current targeting
                </p>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">Role:</span>{" "}
                    {profile.desired_role || "Not confirmed yet"}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Location:</span>{" "}
                    {profile.location || "Still open"}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Skills captured:</span>{" "}
                    {profile.skills?.length ? `${profile.skills.length} core skills` : "Needs review"}
                  </p>
                </div>
              </div>
              <Button asChild variant="subtle" className="w-full justify-between">
                <Link href="/dashboard/preferences">
                  Refine profile and preferences
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </SurfaceCard>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2 stagger-fade-in">
        <SurfaceCard>
          <SectionHeader
            title="Recommended to review"
            description="Start with the strongest current matches instead of scanning the whole feed."
            action={
              <Button asChild variant="ghost">
                <Link href="/dashboard/jobs">View all</Link>
              </Button>
            }
          />
          <div className="mt-5 space-y-3">
            {topJobs.length === 0 && !jobsLoading ? (
              <EmptyState
                icon={BriefcaseBusiness}
                title="No recommendations yet"
                description="Upload your resume and confirm your profile so Morphly has enough context to rank the right roles first."
                action={
                  <>
                    <Button asChild>
                      <Link href="/dashboard/resume">Upload resume</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/dashboard/preferences">Review profile</Link>
                    </Button>
                  </>
                }
              />
            ) : (
              topJobs.map((job: Job) => <JobCard key={job.id} job={job} />)
            )}
          </div>
        </SurfaceCard>

        <SurfaceCard>
          <SectionHeader
            title="Tracking right now"
            description="Keep only the active roles in view so your application flow stays manageable."
            action={
              <Button asChild variant="ghost">
                <Link href="/dashboard/applied">View all</Link>
              </Button>
            }
          />
          <div className="mt-5 space-y-3">
            {recentApplications.length === 0 && !applicationsLoading ? (
              <EmptyState
                icon={ClipboardCheck}
                title="Nothing tracked yet"
                description="Once you save a role or prepare a draft, it will appear here so you can keep the search organized."
                action={
                  <Button asChild>
                    <Link href="/dashboard/jobs">Start with a job</Link>
                  </Button>
                }
              />
            ) : (
              recentApplications.map((application: ApplicationRecord) => (
                <ApplicationCard key={application.id} application={application} />
              ))
            )}
          </div>
        </SurfaceCard>
      </section>
    </div>
  );
}
