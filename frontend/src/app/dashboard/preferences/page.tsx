"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Save, Sparkles, WandSparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InfoCallout,
  PageHeader,
  SectionEyebrow,
  SectionHeader,
  StatusBadge,
  SurfaceCard,
} from "@/components/ui/product-shell";
import { getErrorMessage } from "@/lib/error-utils";
import api from "@/services/api";

interface ProfileResponse {
  extracted_profile: {
    desired_role?: string | null;
    skills?: string[];
    experience_level?: string | null;
    location?: string | null;
    summary?: string | null;
    past_companies?: string[];
    education?: string[];
  };
  user_preferences: {
    desired_role?: string | null;
    skills?: string[];
    experience_level?: string | null;
    location?: string | null;
    remote_only?: boolean;
    salary_min?: number | null;
    preferred_companies?: string[];
  };
  merged_profile: {
    desired_role?: string | null;
    skills?: string[];
    experience_level?: string | null;
    location?: string | null;
    remote_only?: boolean;
    salary_min?: number | null;
    preferred_companies?: string[];
    summary?: string | null;
    past_companies?: string[];
    education?: string[];
  };
}

export default function DashboardPreferencesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchingJobs, setFetchingJobs] = useState(false);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);

  const [desiredRole, setDesiredRole] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [salaryMin, setSalaryMin] = useState("");
  const [preferredCompanies, setPreferredCompanies] = useState("");

  useEffect(() => {
    api
      .get("/profile")
      .then((res) => {
        const payload = res.data as ProfileResponse;
        const merged = payload.merged_profile || {};
        setProfile(payload);
        setDesiredRole(merged.desired_role || "");
        setLocation(merged.location || "");
        setSkills(Array.isArray(merged.skills) ? merged.skills.join(", ") : "");
        setExperienceLevel(merged.experience_level || "");
        setRemoteOnly(Boolean(merged.remote_only));
        setSalaryMin(merged.salary_min != null ? String(merged.salary_min) : "");
        setPreferredCompanies(
          Array.isArray(merged.preferred_companies) ? merged.preferred_companies.join(", ") : ""
        );
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const completion = useMemo(() => {
    const values = [desiredRole, location, skills, experienceLevel];
    return Math.round((values.filter((value) => value.trim()).length / values.length) * 100);
  }, [desiredRole, location, skills, experienceLevel]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await api.post("/profile/review", {
        desired_role: desiredRole.trim() || undefined,
        location: location.trim() || undefined,
        experience_level: experienceLevel.trim() || undefined,
        remote_only: remoteOnly,
        salary_min: salaryMin.trim() ? Number(salaryMin) : null,
        skills: skills
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        preferred_companies: preferredCompanies
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });
      setProfile(res.data);
      toast.success("Profile reviewed and saved");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const fetchJobsNow = async () => {
    setFetchingJobs(true);
    try {
      await api.post("/jobs/fetch");
      toast.success("Job fetch triggered");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setFetchingJobs(false);
    }
  };

  return (
    <div className="space-y-6 content-fade-in">
      <PageHeader
        eyebrow={<SectionEyebrow icon={Sparkles} label="Onboarding step 2 of 3" />}
        title="Review what Morphly learned from your resume and keep the important parts accurate."
        description="Your uploaded resume gave Morphly a starting point. This screen is where you turn that into a cleaner profile for matching and draft generation."
        actions={<StatusBadge tone="info">{completion}% reviewed</StatusBadge>}
      />

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <SurfaceCard>
          <SectionHeader
            title="Manual review"
            description="Anything you edit here should be treated as more trustworthy than extracted guesses."
          />

          {loading ? (
            <div className="mt-5 inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading profile...
            </div>
          ) : (
            <div className="mt-5 space-y-5">
              <InfoCallout
                title="Recommended approach"
                description="Keep this profile factual and stable. Tailoring happens later inside each job workspace, so this page should reflect your true baseline preferences."
              />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target role</label>
                  <Input value={desiredRole} onChange={(e) => setDesiredRole(e.target.value)} placeholder="Backend Engineer" />
                  <p className="text-xs text-muted-foreground">This helps match scoring and summary generation stay focused.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Preferred location</label>
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Remote, Bengaluru" />
                  <p className="text-xs text-muted-foreground">Use `Remote` if you want remote-first roles to rank higher.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Experience level</label>
                  <Input value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} placeholder="Mid" />
                  <p className="text-xs text-muted-foreground">Examples: Entry, Mid, Senior.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Minimum salary</label>
                  <Input type="number" min="0" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} placeholder="1200000" />
                  <p className="text-xs text-muted-foreground">Optional, but helpful when salary data exists in listings.</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Core skills</label>
                <Input
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="Python, FastAPI, PostgreSQL, React"
                />
                <p className="text-xs text-muted-foreground">Comma-separated. These strongly influence match reasons and what gets emphasized in drafts.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Preferred companies</label>
                <Input
                  value={preferredCompanies}
                  onChange={(e) => setPreferredCompanies(e.target.value)}
                  placeholder="Figma, Stripe, Atlassian"
                />
                <p className="text-xs text-muted-foreground">Optional. Use this only for companies you actively want to prioritize.</p>
              </div>

              <label className="surface-subtle flex items-center gap-3 rounded-[1.35rem] border border-border/70 px-4 py-4 text-sm font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={remoteOnly}
                  onChange={(e) => setRemoteOnly(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary"
                />
                Remote only
              </label>

              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                <Button onClick={saveProfile} disabled={saving} className="w-full sm:w-auto">
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Save review
                </Button>
                <Button onClick={fetchJobsNow} variant="outline" disabled={fetchingJobs} className="w-full sm:w-auto">
                  {fetchingJobs ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <WandSparkles className="h-3.5 w-3.5" />}
                  Refresh matching
                </Button>
                <Button asChild variant="ghost" className="w-full sm:w-auto">
                  <Link href="/dashboard/jobs">Go to jobs</Link>
                </Button>
              </div>
            </div>
          )}
        </SurfaceCard>

        <div className="grid gap-4">
          <SurfaceCard>
            <SectionHeader
              title="Resume-derived signals"
              description="These are extracted from your most recent base resume and used as the starting layer."
            />

            <div className="mt-5 space-y-4 text-sm">
              {profile?.extracted_profile.skills?.length ? (
                <div className="flex flex-wrap gap-2">
                  {profile.extracted_profile.skills.slice(0, 10).map((skill) => (
                    <StatusBadge key={skill} tone="info">{skill}</StatusBadge>
                  ))}
                </div>
              ) : null}

              <div className="space-y-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Detected summary</p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{profile?.extracted_profile.summary || "No summary extracted yet."}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Past companies</p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {profile?.extracted_profile.past_companies?.length
                      ? profile.extracted_profile.past_companies.join(", ")
                      : "No company names detected yet."}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Education</p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {profile?.extracted_profile.education?.length
                      ? profile.extracted_profile.education.join(" • ")
                      : "No education section detected yet."}
                  </p>
                </div>
              </div>
            </div>
          </SurfaceCard>

          <InfoCallout
            title="What to do next"
            description="Once the profile looks right, refresh the feed and move into the jobs view. From there, open a role and generate your first tailored draft."
            tone="success"
          />
        </div>
      </section>
    </div>
  );
}
