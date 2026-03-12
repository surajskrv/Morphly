"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, DollarSign, ExternalLink } from "lucide-react";
import api from "@/services/api";
import { getErrorMessage } from "@/lib/error-utils";
import { toast } from "sonner";

interface Job {
  id: string;
  title: string;
  company: string;
  location?: string;
  description?: string;
  url?: string;
  apply_url?: string;
  salary_min?: number;
  salary_max?: number;
  match_score?: number;
  relevance_score?: number;
}

interface JobCardProps {
  job: Job;
  applied?: boolean;
  onApply?: (jobId: string) => Promise<unknown> | unknown;
  showDescription?: boolean;
}

export function JobCard({ job, applied = false, onApply, showDescription = false }: JobCardProps) {
  const [applying, setApplying] = useState(false);

  const handleApply = async () => {
    if (applied || applying) return;
    setApplying(true);
    try {
      if (onApply) {
        await onApply(job.id);
      } else {
        await api.post("/applications/", { job_id: job.id });
      }
      toast.success(`Applied to ${job.title} at ${job.company}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="bg-card rounded-xl soft-shadow soft-shadow-hover border border-border/40 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-semibold truncate">{job.title}</h3>
            {(job.match_score != null || job.relevance_score != null) && (
              <span className="shrink-0 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-600 border border-teal-100">
                {Math.round((job.match_score ?? job.relevance_score ?? 0) * 100)}%
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground font-medium">{job.company}</p>
          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground/80">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {job.location || "Remote"}
            </span>
            {job.salary_min != null && job.salary_max != null && (
              <span className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" /> {Math.round(job.salary_min / 1000)}k – {Math.round(job.salary_max / 1000)}k
              </span>
            )}
          </div>
          {showDescription && job.description ? (
            <p className="text-sm text-muted-foreground mt-3 max-h-16 overflow-hidden">{job.description}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button onClick={handleApply} size="sm" className="text-xs h-8 rounded-lg px-4" disabled={applied || applying}>
            {applied ? "Applied" : applying ? "Applying..." : "Apply"}
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground" asChild>
            <a href={job.apply_url || job.url || "#"} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
