"use client";

import { useEffect, useMemo, useState } from "react";
import { ClipboardCheck, FileCheck2, Layers3, Send } from "lucide-react";

import { ApplicationCard } from "@/components/dashboard/application-card";
import { EmptyState, FilterChips, PageHeader, SectionEyebrow, StatusBadge, SurfaceCard } from "@/components/ui/product-shell";
import { type ApplicationStatus, useApplicationsStore } from "@/store/applications";

const STATUS_FILTERS: ReadonlyArray<{ value: ApplicationStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "saved", label: "Saved" },
  { value: "ready", label: "Ready" },
  { value: "applied", label: "Applied" },
];

export default function DashboardAppliedPage() {
  const { applications, fetchApplications, loading } = useApplicationsStore();
  const [filter, setFilter] = useState<ApplicationStatus | "all">("all");

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const filteredApplications = useMemo(() => {
    if (filter === "all") return applications;
    return applications.filter((item) => item.status === filter);
  }, [applications, filter]);

  const counts = useMemo(
    () => ({
      saved: applications.filter((item) => item.status === "saved").length,
      ready: applications.filter((item) => item.status === "ready").length,
      applied: applications.filter((item) => item.status === "applied").length,
    }),
    [applications]
  );

  return (
    <div className="space-y-6 content-fade-in">
      <PageHeader
        eyebrow={<SectionEyebrow icon={ClipboardCheck} label="Application tracking" />}
        title="Keep your saved, prepared, and applied roles organized."
        description="Tracking should feel like a quick pulse-check, not another backlog. Filter by status and return to any workspace when needed."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="info">{filteredApplications.length} visible</StatusBadge>
            <StatusBadge tone="success">Sorted by recent activity</StatusBadge>
          </div>
        }
      />

      <SurfaceCard className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="surface-subtle rounded-[1.35rem] border border-border/70 px-4 py-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground"><Layers3 className="h-4 w-4 text-amber-700" /> Saved</div>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{counts.saved}</p>
          </div>
          <div className="surface-subtle rounded-[1.35rem] border border-border/70 px-4 py-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground"><FileCheck2 className="h-4 w-4 text-sky-700" /> Ready</div>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{counts.ready}</p>
          </div>
          <div className="surface-subtle rounded-[1.35rem] border border-border/70 px-4 py-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground"><Send className="h-4 w-4 text-emerald-700" /> Applied</div>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{counts.applied}</p>
          </div>
        </div>

        <FilterChips items={STATUS_FILTERS} selected={filter} onSelect={setFilter} />
      </SurfaceCard>

      <section className="space-y-3">
        {filteredApplications.length === 0 && !loading ? (
          <EmptyState
            icon={ClipboardCheck}
            title={filter === "all" ? "No tracked roles yet" : `No ${filter} roles yet`}
            description={
              filter === "all"
                ? "Tracked jobs appear here after you save a role or generate a tailored draft."
                : "Switch filters or start preparing a role to populate this status bucket."
            }
          />
        ) : (
          filteredApplications.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))
        )}
      </section>
    </div>
  );
}
