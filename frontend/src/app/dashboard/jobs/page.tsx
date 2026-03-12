"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";

import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { JobCard } from "@/components/dashboard/job-card";
import { useJobsStore } from "@/store/jobs";
import { useApplicationsStore } from "@/store/applications";

export default function DashboardJobsPage() {
  const { jobs, loading, fetchJobs } = useJobsStore();
  const { fetchApplications, applyToJob, isApplied } = useApplicationsStore();
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchJobs(), fetchApplications()]);
    };
    load();
  }, [fetchApplications, fetchJobs]);

  const filteredJobs = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return jobs;
    return jobs.filter((job) =>
      [job.title, job.company, job.location, job.description]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle))
    );
  }, [jobs, query]);

  const triggerRefresh = async () => {
    setRefreshing(true);
    try {
      await api.post("/jobs/fetch");
      toast.success("Background fetch started");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await fetchJobs();
    } catch {
      toast.error("Failed to trigger job fetch");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="space-y-4">
      <section className="bg-card rounded-2xl border border-border/50 p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Recommended Jobs</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Explore all matched opportunities and apply with one click.
            </p>
          </div>
          <Button variant="outline" size="sm" className="text-xs h-8 rounded-lg" onClick={triggerRefresh} disabled={refreshing}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${refreshing ? "animate-spin" : ""}`} />
            Fetch Latest
          </Button>
        </div>

        <div className="mt-4 relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, company, location, or keyword"
            className="pl-9 h-10 rounded-lg"
          />
        </div>
      </section>

      <section className="space-y-3">
        {filteredJobs.length === 0 && !loading ? (
          <div className="bg-card rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
            No jobs found for this filter. Try clearing search or fetch new jobs.
          </div>
        ) : (
          filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              applied={isApplied(job.id)}
              onApply={applyToJob}
              showDescription
            />
          ))
        )}
      </section>
    </div>
  );
}
