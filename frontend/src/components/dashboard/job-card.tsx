"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  DollarSign,
  ExternalLink,
  FileSignature,
  FileText,
  MapPin,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusBadge, SurfaceCard } from "@/components/ui/product-shell";
import type { Job } from "@/store/jobs";

interface JobCardProps {
  job: Job;
  showDescription?: boolean;
}

function getPostedLabel(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) return "Just posted";

  const hour = 1000 * 60 * 60;
  const day = hour * 24;

  if (diffMs < hour) {
    const minutes = Math.max(1, Math.round(diffMs / (1000 * 60)));
    return `${minutes}m ago`;
  }

  if (diffMs < day) {
    return `${Math.round(diffMs / hour)}h ago`;
  }

  if (diffMs < day * 7) {
    return `${Math.round(diffMs / day)}d ago`;
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function JobCard({ job, showDescription = false }: JobCardProps) {
  const applyHref = job.apply_url || job.url;
  const fitScore = Math.round((job.match_score ?? job.relevance_score ?? 0) * 100);
  const postedLabel = getPostedLabel(job.posted_at);

  return (
    <SurfaceCard className="soft-shadow-hover content-fade-in p-5 sm:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge>{job.source || "Job feed"}</StatusBadge>
            {job.match_score != null || job.relevance_score != null ? (
              <StatusBadge tone="success" icon={Sparkles}>{fitScore}% match</StatusBadge>
            ) : null}
            {postedLabel ? (
              <StatusBadge tone="info" icon={Clock3}>{postedLabel}</StatusBadge>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg font-semibold tracking-tight text-foreground">{job.title}</h3>
            <p className="text-sm font-medium text-muted-foreground">{job.company}</p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {job.location || "Remote"}
              </span>
              {job.salary_min != null && job.salary_max != null ? (
                <span className="inline-flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5" />
                  {Math.round(job.salary_min / 1000)}k - {Math.round(job.salary_max / 1000)}k
                </span>
              ) : null}
            </div>
          </div>

          {job.match_reasons?.length ? (
            <div className="surface-subtle rounded-[1.35rem] border border-border/70 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Why it fits</p>
              <div className="mt-3 space-y-2.5">
                {job.match_reasons.slice(0, 3).map((reason) => (
                  <div key={reason} className="flex items-start gap-2.5 text-sm leading-6 text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {showDescription && job.description ? (
            <p className="line-clamp-2 text-sm leading-7 text-muted-foreground">{job.description}</p>
          ) : null}
        </div>

        <div className="grid min-w-full gap-2 sm:grid-cols-2 xl:min-w-[236px] xl:grid-cols-1">
          <Button asChild variant="default" className="w-full">
            <Link href={`/dashboard/jobs/${job.id}?tab=resume`}>
              <FileText className="h-3.5 w-3.5" />
              Generate resume
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href={`/dashboard/jobs/${job.id}?tab=cover-letter`}>
              <FileSignature className="h-3.5 w-3.5" />
              Generate cover letter
            </Link>
          </Button>
          {applyHref ? (
            <Button asChild variant="subtle" className="w-full">
              <a href={applyHref} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
                Apply on source
              </a>
            </Button>
          ) : (
            <Button variant="subtle" disabled className="w-full">
              <ExternalLink className="h-3.5 w-3.5" />
              Apply on source
            </Button>
          )}
          <Button asChild variant="ghost" className="w-full">
            <Link href={`/dashboard/jobs/${job.id}`}>
              Open workspace
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </SurfaceCard>
  );
}
