"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, ClipboardCheck, FileText, RefreshCw, Settings2 } from "lucide-react";
import { toast } from "sonner";

import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/dashboard/job-card";
import { ApplicationCard } from "@/components/dashboard/application-card";
import { useJobsStore } from "@/store/jobs";
import { useApplicationsStore } from "@/store/applications";

interface PreferenceSnapshot {
  desired_role?: string | null;
  location?: string | null;
}

export default function DashboardOverviewPage() {
  const { jobs, fetchJobs, loading: jobsLoading } = useJobsStore();
  const {
    applications,
    fetchApplications,
    applyToJob,
    isApplied,
    loading: applicationsLoading,
  } = useApplicationsStore();

  const [resumeExists, setResumeExists] = useState(false);
  const [preferences, setPreferences] = useState<PreferenceSnapshot>({});
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const load = async () => {
      await Promise.allSettled([
        fetchJobs(),
        fetchApplications(),
        api.get("/resume").then((res) => setResumeExists(!!res.data?.resume_exists)),
        api.get("/preferences").then((res) => {
          setPreferences({
            desired_role: res.data?.desired_role,
            location: res.data?.location,
          });
        }),
      ]);
    };

    load();
  }, [fetchApplications, fetchJobs]);

  const profileScore = useMemo(() => {
    const checkpoints = [
      !!preferences.desired_role,
      !!preferences.location,
      resumeExists,
    ];
    const completed = checkpoints.filter(Boolean).length;
    return Math.round((completed / checkpoints.length) * 100);
  }, [preferences.desired_role, preferences.location, resumeExists]);

  const topJobs = jobs.slice(0, 3);
  const recentApplications = applications.slice(0, 3);

  const triggerRefresh = async () => {
    setRefreshing(true);
    try {
      await api.post("/jobs/fetch");
      toast.success("Job fetch started");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await Promise.all([fetchJobs(), fetchApplications()]);
    } catch {
      toast.error("Failed to trigger job fetch");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className="bg-card rounded-2xl border border-border/50 soft-shadow p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track your search health and move between key workflows quickly.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs h-8 rounded-lg" onClick={triggerRefresh} disabled={refreshing}>
              <RefreshCw className={`w-3.5 h-3.5 mr-1 ${refreshing ? "animate-spin" : ""}`} />
              Refresh Jobs
            </Button>
            <Button asChild size="sm" className="text-xs h-8 rounded-lg">
              <Link href="/dashboard/jobs">Browse Jobs</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><BriefcaseBusiness className="w-3.5 h-3.5" /> Recommended</div>
          <p className="text-2xl font-semibold mt-2">{jobs.length}</p>
        </div>
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><ClipboardCheck className="w-3.5 h-3.5" /> Applications</div>
          <p className="text-2xl font-semibold mt-2">{applications.length}</p>
        </div>
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><FileText className="w-3.5 h-3.5" /> Resume</div>
          <p className="text-2xl font-semibold mt-2">{resumeExists ? "Ready" : "Missing"}</p>
        </div>
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Settings2 className="w-3.5 h-3.5" /> Profile Health</div>
          <p className="text-2xl font-semibold mt-2">{profileScore}%</p>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl border border-border/50 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Top Recommended Jobs</h2>
            <Link href="/dashboard/jobs" className="text-xs text-primary inline-flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {topJobs.length === 0 && !jobsLoading ? (
              <p className="text-sm text-muted-foreground">No recommended jobs yet. Save preferences and fetch jobs.</p>
            ) : (
              topJobs.map((job) => (
                <JobCard key={job.id} job={job} applied={isApplied(job.id)} onApply={applyToJob} />
              ))
            )}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border/50 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Recent Applications</h2>
            <Link href="/dashboard/applied" className="text-xs text-primary inline-flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentApplications.length === 0 && !applicationsLoading ? (
              <p className="text-sm text-muted-foreground">Applied jobs will appear here once you apply.</p>
            ) : (
              recentApplications.map((application) => (
                <ApplicationCard key={application.id} application={application} />
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
