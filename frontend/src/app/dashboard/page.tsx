"use client";

import { useEffect, useMemo, useState } from "react";
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

import { ApplicationCard } from "@/components/dashboard/application-card";
import { JobCard } from "@/components/dashboard/job-card";
import { Button } from "@/components/ui/button";
import {
  EmptyState,
  InfoCallout,
  MetricTile,
  PageHeader,
  SectionEyebrow,
  SectionHeader,
  StatusBadge,
  SurfaceCard,
} from "@/components/ui/product-shell";
import api from "@/services/api";
import { useApplicationsStore } from "@/store/applications";
import { useJobsStore } from "@/store/jobs";

interface MergedProfile {
  desired_role?: string | null;
  location?: string | null;
  skills?: string[];
}

export default function DashboardOverviewPage() {
  const { jobs, fetchJobs, loading: jobsLoading } = useJobsStore();
  const { applications, fetchApplications, loading: applicationsLoading } = useApplicationsStore();
  const [resumeExists, setResumeExists] = useState(false);
  const [profile, setProfile] = useState<MergedProfile>({});
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const load = async () => {
      await Promise.allSettled([
        fetchJobs(),
        fetchApplications(),
        api.get("/resume").then((res) => setResumeExists(!!res.data?.resume_exists)),
        api.get("/profile").then((res) => {
          setProfile(res.data?.merged_profile || {});
        }),
      ]);
    };

    load();
  }, [fetchApplications, fetchJobs]);

  const profileScore = useMemo(() => {
    const checkpoints = [!!profile.desired_role, !!profile.location, !!profile.skills?.length, resumeExists];
    const completed = checkpoints.filter(Boolean).length;
    return Math.round((completed / checkpoints.length) * 100);
  }, [profile.desired_role, profile.location, profile.skills, resumeExists]);

  const topJobs = jobs.slice(0, 2);
  const recentApplications = applications.slice(0, 2);
  const savedCount = applications.filter((item) => item.status === "saved").length;
  const readyCount = applications.filter((item) => item.status === "ready").length;
  const appliedCount = applications.filter((item) => item.status === "applied").length;
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
      await api.post("/jobs/fetch");
      toast.success("Fresh job collection started");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await Promise.all([fetchJobs(), fetchApplications()]);
    } catch {
      toast.error("Failed to trigger job fetch");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="space-y-6 content-fade-in">
      <PageHeader
        eyebrow={<SectionEyebrow icon={Sparkles} label="Overview" />}
        title="A calmer view of what matters right now."
        description="See your setup status, strongest next move, and the jobs or applications that deserve attention first."
        actions={
          <>
            <Button variant="outline" onClick={triggerRefresh} disabled={refreshing}>
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh jobs
            </Button>
            <Button asChild>
              <Link href="/dashboard/jobs">Browse jobs</Link>
            </Button>
          </>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
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
        <SurfaceCard className="p-6 sm:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <StatusBadge tone={focusState.tone}>{focusState.badge}</StatusBadge>
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.9rem]">
                  {focusState.title}
                </h2>
                <p className="max-w-xl text-sm leading-7 text-muted-foreground sm:text-[15px]">
                  {focusState.description}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button asChild>
                  <Link href={focusState.primaryHref}>{focusState.primaryLabel}</Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link href={focusState.secondaryHref}>
                    {focusState.secondaryLabel}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid w-full gap-3 md:grid-cols-3 lg:w-[320px] lg:grid-cols-1">
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

      <section className="grid gap-4 xl:grid-cols-2">
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
              topJobs.map((job) => <JobCard key={job.id} job={job} />)
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
              recentApplications.map((application) => (
                <ApplicationCard key={application.id} application={application} />
              ))
            )}
          </div>
        </SurfaceCard>
      </section>
    </div>
  );
}
