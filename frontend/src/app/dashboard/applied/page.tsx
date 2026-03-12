"use client";

import { useEffect, useMemo, useState } from "react";

import { ApplicationCard } from "@/components/dashboard/application-card";
import { Button } from "@/components/ui/button";
import { useApplicationsStore } from "@/store/applications";

const STATUS_FILTERS = ["all", "pending", "applied"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

export default function DashboardAppliedPage() {
  const { applications, fetchApplications, loading } = useApplicationsStore();
  const [filter, setFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const filteredApplications = useMemo(() => {
    if (filter === "all") return applications;
    return applications.filter((item) => (item.status || "pending").toLowerCase() === filter);
  }, [applications, filter]);

  return (
    <div className="space-y-4">
      <section className="bg-card rounded-2xl border border-border/50 p-5 sm:p-6">
        <h1 className="text-xl font-semibold">Applied Jobs</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track every application and monitor whether it is still in progress or completed.
        </p>

        <div className="flex items-center gap-2 mt-4">
          {STATUS_FILTERS.map((status) => (
            <Button
              key={status}
              type="button"
              variant={filter === status ? "default" : "outline"}
              size="sm"
              className="text-xs h-8 rounded-lg capitalize"
              onClick={() => setFilter(status)}
            >
              {status}
            </Button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        {filteredApplications.length === 0 && !loading ? (
          <div className="bg-card rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
            No applications found for this filter.
          </div>
        ) : (
          filteredApplications.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))
        )}
      </section>
    </div>
  );
}
