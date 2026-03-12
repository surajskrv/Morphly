"use client";

import { CalendarDays, ExternalLink, Hourglass, Send } from "lucide-react";

import type { ApplicationRecord } from "@/store/applications";
import { Button } from "@/components/ui/button";

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

export function ApplicationCard({ application }: { application: ApplicationRecord }) {
  const status = (application.status || "pending").toLowerCase();
  const isApplied = status === "applied";

  return (
    <div className="bg-card rounded-xl soft-shadow border border-border/40 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-base">{application.job?.title || "Unknown role"}</h3>
          <p className="text-sm text-muted-foreground">{application.job?.company || "Unknown company"}</p>
          <p className="text-xs text-muted-foreground/80 mt-1">{application.job?.location || "Location not provided"}</p>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
            isApplied
              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
              : "bg-amber-50 text-amber-700 border-amber-100"
          }`}
        >
          {isApplied ? "Applied" : "In Progress"}
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-2 mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <CalendarDays className="w-3.5 h-3.5" />
          Requested: {formatDate(application.created_at)}
        </div>
        <div className="flex items-center gap-1.5">
          {isApplied ? <Send className="w-3.5 h-3.5" /> : <Hourglass className="w-3.5 h-3.5" />}
          Applied: {formatDate(application.applied_at)}
        </div>
      </div>

      {application.job?.apply_url || application.job?.url ? (
        <div className="mt-4">
          <Button variant="outline" size="sm" className="text-xs h-8 rounded-lg" asChild>
            <a href={application.job.apply_url || application.job.url} target="_blank" rel="noopener noreferrer">
              Open Job <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </a>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
