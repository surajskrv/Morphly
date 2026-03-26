"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  Clock3,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { JobCard } from "@/components/dashboard/job-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  EmptyState,
  FilterChips,
  PageHeader,
  SectionEyebrow,
  StatusBadge,
  SurfaceCard,
} from "@/components/ui/product-shell";
import api from "@/services/api";
import type { Job } from "@/store/jobs";
import { useJobsStore } from "@/store/jobs";

type TimeFilter = "any" | "1h" | "1d" | "1w";
type MatchFilter = "all" | "80" | "60" | "40";

const TIME_FILTERS: ReadonlyArray<{ label: string; value: TimeFilter }> = [
  { label: "Any time", value: "any" },
  { label: "Past hour", value: "1h" },
  { label: "Past day", value: "1d" },
  { label: "Past week", value: "1w" },
];

const MATCH_FILTERS: ReadonlyArray<{ label: string; value: MatchFilter }> = [
  { label: "All matches", value: "all" },
  { label: "80%+", value: "80" },
  { label: "60%+", value: "60" },
  { label: "40%+", value: "40" },
];

function getJobScore(job: Job) {
  return Math.round((job.match_score ?? job.relevance_score ?? 0) * 100);
}

function getTimeWindow(value: TimeFilter) {
  const hour = 1000 * 60 * 60;
  const day = hour * 24;
  if (value === "1h") return hour;
  if (value === "1d") return day;
  if (value === "1w") return day * 7;
  return null;
}

function matchesPostedWindow(job: Job, filter: TimeFilter) {
  if (filter === "any") return true;
  if (!job.posted_at) return false;

  const date = new Date(job.posted_at);
  if (Number.isNaN(date.getTime())) return false;

  const windowMs = getTimeWindow(filter);
  if (!windowMs) return true;

  return Date.now() - date.getTime() <= windowMs;
}

function formatFetchStatus(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function JobsLoadingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <SurfaceCard key={index} className="shimmer-placeholder p-5 sm:p-6">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <div className="h-7 w-20 rounded-full bg-muted/80" />
              <div className="h-7 w-24 rounded-full bg-muted/80" />
              <div className="h-7 w-20 rounded-full bg-muted/80" />
            </div>
            <div className="space-y-2">
              <div className="h-6 w-2/3 rounded-xl bg-muted/80" />
              <div className="h-4 w-1/3 rounded-lg bg-muted/70" />
              <div className="h-4 w-1/2 rounded-lg bg-muted/70" />
            </div>
            <div className="rounded-[1.35rem] border border-border/60 bg-muted/45 p-4">
              <div className="h-3 w-20 rounded bg-muted/80" />
              <div className="mt-3 space-y-2">
                <div className="h-4 w-full rounded bg-muted/70" />
                <div className="h-4 w-5/6 rounded bg-muted/70" />
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <div className="h-10 rounded-xl bg-muted/80" />
              <div className="h-10 rounded-xl bg-muted/80" />
              <div className="h-10 rounded-xl bg-muted/80" />
              <div className="h-10 rounded-xl bg-muted/80" />
            </div>
          </div>
        </SurfaceCard>
      ))}
    </div>
  );
}

export default function DashboardJobsPage() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { jobs, loading, fetchJobs, fetchStatus, fetchFetchStatus } = useJobsStore();
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>((searchParams.get("time") as TimeFilter) || "any");
  const [matchFilter, setMatchFilter] = useState<MatchFilter>((searchParams.get("match") as MatchFilter) || "all");
  const [sourceFilter, setSourceFilter] = useState(searchParams.get("source") || "all");

  useEffect(() => {
    void Promise.all([fetchJobs(), fetchFetchStatus()]);
  }, [fetchFetchStatus, fetchJobs]);

  useEffect(() => {
    setQuery(searchParams.get("query") || "");
    setTimeFilter(((searchParams.get("time") as TimeFilter) || "any"));
    setMatchFilter(((searchParams.get("match") as MatchFilter) || "all"));
    setSourceFilter(searchParams.get("source") || "all");
  }, [searchParams]);

  useEffect(() => {
    if (!fetchStatus?.in_progress) return;

    const interval = window.setInterval(() => {
      void Promise.all([fetchFetchStatus(), fetchJobs()]);
    }, 4000);

    return () => window.clearInterval(interval);
  }, [fetchFetchStatus, fetchJobs, fetchStatus?.in_progress]);

  const sourceOptions = useMemo(() => {
    const values = Array.from(new Set(jobs.map((job) => job.source).filter(Boolean) as string[])).sort((a, b) =>
      a.localeCompare(b)
    );
    return ["all", ...values];
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const threshold = matchFilter === "all" ? 0 : Number(matchFilter);

    return [...jobs]
      .filter((job) => {
        if (needle) {
          const matchesQuery = [
            job.title,
            job.company,
            job.location,
            job.description,
            ...(job.match_reasons || []),
            ...(job.skills || []),
          ]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(needle));

          if (!matchesQuery) return false;
        }

        if (sourceFilter !== "all" && job.source !== sourceFilter) return false;
        if (!matchesPostedWindow(job, timeFilter)) return false;
        if (threshold > 0 && getJobScore(job) < threshold) return false;

        return true;
      })
      .sort((a, b) => {
        const scoreDelta = getJobScore(b) - getJobScore(a);
        if (scoreDelta !== 0) return scoreDelta;

        const postedA = a.posted_at ? new Date(a.posted_at).getTime() : 0;
        const postedB = b.posted_at ? new Date(b.posted_at).getTime() : 0;
        return postedB - postedA;
      });
  }, [jobs, matchFilter, query, sourceFilter, timeFilter]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (query.trim()) params.set("query", query.trim());
    else params.delete("query");

    if (timeFilter !== "any") params.set("time", timeFilter);
    else params.delete("time");

    if (matchFilter !== "all") params.set("match", matchFilter);
    else params.delete("match");

    if (sourceFilter !== "all") params.set("source", sourceFilter);
    else params.delete("source");

    const next = params.toString();
    const current = searchParams.toString();
    if (next !== current) {
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    }
  }, [matchFilter, pathname, query, router, searchParams, sourceFilter, timeFilter]);

  const activeFilterCount = [
    query.trim().length > 0,
    timeFilter !== "any",
    matchFilter !== "all",
    sourceFilter !== "all",
  ].filter(Boolean).length;

  const clearFilters = () => {
    setQuery("");
    setTimeFilter("any");
    setMatchFilter("all");
    setSourceFilter("all");
  };

  const triggerRefresh = async () => {
    setRefreshing(true);
    try {
      await api.post("/jobs/fetch");
      toast.success("Background job refresh started");
      await fetchFetchStatus();
    } catch {
      toast.error("Failed to trigger job fetch");
    } finally {
      setRefreshing(false);
    }
  };

  const hasJobs = jobs.length > 0;
  const hasVisibleJobs = filteredJobs.length > 0;
  const completedAtLabel = formatFetchStatus(fetchStatus?.last_completed_at);
  const requestedAtLabel = formatFetchStatus(fetchStatus?.last_requested_at);

  return (
    <div className="space-y-5 content-fade-in">
      <PageHeader
        className="sm:py-6"
        eyebrow={<SectionEyebrow icon={Sparkles} label="Recommended jobs" />}
        title="The roles worth your attention, in one cleaner workspace."
        description="Filter by freshness, source, and match strength, then move straight into document prep when something looks right."
      />

      <div className="sticky top-[6.6rem] z-10 sm:top-[7.25rem] lg:top-[5.75rem]">
        <SurfaceCard className="tab-bar-shell border-border/80 bg-card/90 p-4 shadow-[0_14px_34px_oklch(0.35_0.01_80_/_8%)] backdrop-blur-xl sm:p-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="relative max-w-2xl flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search roles, companies, locations, skills, or match reasons"
                  className="h-11 rounded-2xl border-border/80 bg-background/85 pl-11"
                />
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between xl:justify-end">
                <div className="text-xs font-medium text-muted-foreground">
                  {fetchStatus?.in_progress
                    ? `Refreshing now${requestedAtLabel ? ` • requested ${requestedAtLabel}` : ""}`
                    : completedAtLabel
                      ? `Last completed ${completedAtLabel}`
                      : "Fetch the latest listings when you want a fresher feed"}
                </div>
                <Button variant="outline" onClick={triggerRefresh} disabled={refreshing || fetchStatus?.in_progress} className="w-full sm:w-auto">
                  <RefreshCw className={`h-3.5 w-3.5 ${refreshing || fetchStatus?.in_progress ? "animate-spin" : ""}`} />
                  {fetchStatus?.in_progress ? "Refreshing" : "Fetch latest"}
                </Button>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px] xl:grid-cols-[minmax(0,1fr)_220px_220px]">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Posted window
                </p>
                <div className="-mx-1 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <FilterChips
                    items={TIME_FILTERS}
                    selected={timeFilter}
                    onSelect={setTimeFilter}
                    className="min-w-max flex-nowrap"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="source-filter"
                  className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
                >
                  Source
                </label>
                <select
                  id="source-filter"
                  value={sourceFilter}
                  onChange={(event) => setSourceFilter(event.target.value)}
                  className="flex h-11 w-full rounded-2xl border border-border/80 bg-background/85 px-4 text-sm text-foreground outline-none transition-colors focus:border-primary/35 focus:ring-3 focus:ring-ring/20"
                >
                  {sourceOptions.map((source) => (
                    <option key={source} value={source}>
                      {source === "all" ? "All sources" : source}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Match strength
                </p>
                <div className="-mx-1 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <FilterChips
                    items={MATCH_FILTERS}
                    selected={matchFilter}
                    onSelect={setMatchFilter}
                    className="min-w-max flex-nowrap"
                  />
                </div>
              </div>
            </div>
          </div>
        </SurfaceCard>
      </div>

      <SurfaceCard className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone="info" icon={SlidersHorizontal}>
                {filteredJobs.length} visible
              </StatusBadge>
              <StatusBadge tone="success" icon={Clock3}>
                Sorted by best match
              </StatusBadge>
              {fetchStatus?.last_error ? (
                <StatusBadge tone="attention" icon={AlertCircle}>
                  Last refresh had an issue
                </StatusBadge>
              ) : null}
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              {activeFilterCount > 0
                ? "Your current filters are narrowing the recommendation feed to the most relevant roles."
                : "You are seeing the strongest recommended roles first across the current feed."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {query ? <StatusBadge>{`Search: ${query}`}</StatusBadge> : null}
            {timeFilter !== "any" ? (
              <StatusBadge>{TIME_FILTERS.find((item) => item.value === timeFilter)?.label}</StatusBadge>
            ) : null}
            {sourceFilter !== "all" ? <StatusBadge>{sourceFilter}</StatusBadge> : null}
            {matchFilter !== "all" ? <StatusBadge>{`${matchFilter}%+ match`}</StatusBadge> : null}
            {activeFilterCount > 0 ? (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full sm:w-auto">
                <X className="h-3.5 w-3.5" />
                Clear filters
              </Button>
            ) : null}
          </div>
        </div>
      </SurfaceCard>

      {loading && !hasJobs ? (
        <JobsLoadingSkeleton />
      ) : hasVisibleJobs ? (
        <section className="space-y-3">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} showDescription />
          ))}
        </section>
      ) : fetchStatus?.in_progress && !hasJobs ? (
        <EmptyState
          icon={RefreshCw}
          title="Refreshing recommendations"
          description="Morphly is pulling new listings in the background right now. Stay here and the feed will update when the run completes."
          action={
            <Button variant="outline" disabled>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              Refreshing now
            </Button>
          }
        />
      ) : hasJobs ? (
        <EmptyState
          icon={Search}
          title="No jobs match these filters"
          description="Try broadening the posted window, switching source, or clearing the filters to reopen the full recommendation feed."
          action={
            <Button variant="outline" onClick={clearFilters}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <EmptyState
          icon={Sparkles}
          title="No recommendations yet"
          description="Use the sticky toolbar to fetch the latest listings, then review your profile if the feed still feels too broad or too thin."
          action={
            <Button asChild variant="outline">
              <Link href="/dashboard/preferences">Review profile</Link>
            </Button>
          }
        />
      )}

      {fetchStatus?.last_error ? (
        <SurfaceCard className="p-4 sm:p-5">
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 text-amber-700">
              <AlertCircle className="h-4.5 w-4.5" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">The last refresh did not complete cleanly</p>
              <p>{fetchStatus.last_error}</p>
            </div>
          </div>
        </SurfaceCard>
      ) : null}
    </div>
  );
}
