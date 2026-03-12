"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { useJobsStore } from "@/store/jobs";
import type { Job } from "@/store/jobs";
import { Navbar } from "@/components/layout/navbar";
import { PreferencesCard } from "@/components/dashboard/preferences-card";
import { ResumeCard } from "@/components/dashboard/resume-card";
import { JobCard } from "@/components/dashboard/job-card";
import { Button } from "@/components/ui/button";
import { Briefcase, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function DashboardPage() {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const { jobs, loading, fetchJobs } = useJobsStore();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const initializeDashboard = async () => {
      await checkAuth();

      if (cancelled) return;

      if (!useAuthStore.getState().isAuthenticated) {
        router.push("/login");
        return;
      }

      await fetchJobs();
    };

    initializeDashboard();

    return () => {
      cancelled = true;
    };
  }, [checkAuth, router, fetchJobs]);

  const handleRefresh = async () => {
    try {
      await fetchJobs();
      toast.success("Jobs refreshed");
    } catch {
      toast.error("Failed to refresh jobs");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-5 h-5 animate-spin text-primary/50" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-section-cream">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="font-semibold text-2xl">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage your job search from one place.</p>
        </div>

        {/* Settings Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PreferencesCard />
          <ResumeCard />
        </div>

        {/* Jobs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-base">Recommended Jobs</h2>
            <Button onClick={handleRefresh} variant="outline" size="sm" disabled={loading} className="gap-1.5 text-xs rounded-lg h-8">
              <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {jobs.length === 0 && !loading ? (
            <div className="bg-card rounded-2xl soft-shadow border border-dashed border-border/60 flex flex-col items-center justify-center py-14 text-center">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
                <Briefcase className="w-5 h-5 text-muted-foreground/50" />
              </div>
              <p className="font-medium text-muted-foreground">No jobs found yet</p>
              <p className="text-sm text-muted-foreground/60 mt-0.5">Save your preferences and we&apos;ll find matching jobs</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {jobs.map((job: Job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
