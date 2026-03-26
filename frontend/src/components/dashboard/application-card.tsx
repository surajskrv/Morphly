"use client";

import Link from "next/link";
import { CalendarDays, ExternalLink, FileCheck2, Layers3, Save, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SectionHeader, StatusBadge, SurfaceCard } from "@/components/ui/product-shell";
import type { ApplicationRecord } from "@/store/applications";

function formatDate(value?: string): string {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getStatusConfig(status: ApplicationRecord["status"]) {
  if (status === "applied") {
    return { label: "Applied", tone: "success" as const, icon: Send };
  }

  if (status === "ready") {
    return { label: "Ready to apply", tone: "info" as const, icon: FileCheck2 };
  }

  return { label: "Saved", tone: "attention" as const, icon: Layers3 };
}

export function ApplicationCard({ application }: { application: ApplicationRecord }) {
  const status = getStatusConfig(application.status);
  const sourceHref = application.job?.apply_url || application.job?.url;
  const hasResumeDraft = Boolean(application.resume_sections?.length);
  const hasCoverLetter = Boolean(application.cover_letter_content);

  return (
    <SurfaceCard className="soft-shadow-hover p-5">
      <SectionHeader
        title={application.job?.title || "Unknown role"}
        description={
          <span>
            {application.job?.company || "Unknown company"}
            {application.job?.location ? ` • ${application.job.location}` : ""}
          </span>
        }
        action={<StatusBadge tone={status.tone} icon={status.icon}>{status.label}</StatusBadge>}
      />

      <div className="mt-4 flex flex-wrap gap-2">
        {hasResumeDraft ? <StatusBadge tone="info" icon={Save}>Resume draft saved</StatusBadge> : null}
        {hasCoverLetter ? <StatusBadge tone="success" icon={Save}>Cover letter saved</StatusBadge> : null}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="surface-subtle rounded-[1.25rem] border border-border/70 px-4 py-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <CalendarDays className="h-4 w-4 text-primary" />
            Saved to tracking
          </div>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{formatDate(application.created_at)}</p>
        </div>
        <div className="surface-subtle rounded-[1.25rem] border border-border/70 px-4 py-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <CalendarDays className="h-4 w-4 text-primary" />
            Last activity
          </div>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {formatDate(application.updated_at || application.applied_at)}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {sourceHref ? (
          <Button asChild variant="subtle" className="w-full sm:w-auto">
            <a href={sourceHref} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
              Open source listing
            </a>
          </Button>
        ) : null}
        {application.job?.id ? (
          <Button asChild variant="ghost" className="w-full sm:w-auto">
            <Link href={`/dashboard/jobs/${application.job.id}`}>
              Open workspace
            </Link>
          </Button>
        ) : null}
      </div>
    </SurfaceCard>
  );
}
