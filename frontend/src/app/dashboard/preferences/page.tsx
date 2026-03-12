"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, Zap } from "lucide-react";
import { toast } from "sonner";

import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/error-utils";

interface PreferencePayload {
  desired_role?: string;
  location?: string;
  skills?: string[];
  experience_level?: string;
  remote_only?: boolean;
  salary_min?: number | null;
  preferred_companies?: string[];
}

export default function DashboardPreferencesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchingJobs, setFetchingJobs] = useState(false);

  const [desiredRole, setDesiredRole] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [salaryMin, setSalaryMin] = useState("");
  const [preferredCompanies, setPreferredCompanies] = useState("");

  useEffect(() => {
    api
      .get("/preferences")
      .then((res) => {
        const pref = res.data || {};
        setDesiredRole(pref.desired_role || "");
        setLocation(pref.location || "");
        setSkills(Array.isArray(pref.skills) ? pref.skills.join(", ") : "");
        setExperienceLevel(pref.experience_level || "");
        setRemoteOnly(Boolean(pref.remote_only));
        setSalaryMin(pref.salary_min != null ? String(pref.salary_min) : "");
        setPreferredCompanies(
          Array.isArray(pref.preferred_companies) ? pref.preferred_companies.join(", ") : ""
        );
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const savePreferences = async () => {
    setSaving(true);
    const payload: PreferencePayload = {
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
    };

    try {
      await api.post("/preferences", payload);
      toast.success("Preferences updated");
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
    <div className="space-y-4">
      <section className="bg-card rounded-2xl border border-border/50 p-5 sm:p-6">
        <h1 className="text-xl font-semibold">Preferences</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure your ideal role, skills, and constraints so recommendations stay relevant.
        </p>
      </section>

      <section className="bg-card rounded-2xl border border-border/50 p-5 sm:p-6 space-y-4">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading preferences...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Desired Role</label>
                <Input
                  value={desiredRole}
                  onChange={(e) => setDesiredRole(e.target.value)}
                  placeholder="e.g. Backend Engineer"
                  className="h-10 rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Preferred Location</label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Remote, Bangalore"
                  className="h-10 rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Experience Level</label>
                <Input
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  placeholder="e.g. Mid-level"
                  className="h-10 rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Minimum Salary</label>
                <Input
                  type="number"
                  min="0"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  placeholder="e.g. 1200000"
                  className="h-10 rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Skills (comma separated)</label>
              <Input
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="React, FastAPI, PostgreSQL"
                className="h-10 rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Preferred Companies (comma separated)</label>
              <Input
                value={preferredCompanies}
                onChange={(e) => setPreferredCompanies(e.target.value)}
                placeholder="Google, Stripe, Atlassian"
                className="h-10 rounded-lg"
              />
            </div>

            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={remoteOnly}
                onChange={(e) => setRemoteOnly(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary"
              />
              Remote only
            </label>

            <div className="flex items-center gap-2">
              <Button onClick={savePreferences} size="sm" className="text-xs h-8 rounded-lg gap-1.5" disabled={saving}>
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Preferences
              </Button>
              <Button
                onClick={fetchJobsNow}
                variant="outline"
                size="sm"
                className="text-xs h-8 rounded-lg gap-1.5"
                disabled={fetchingJobs}
              >
                {fetchingJobs ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                Fetch Jobs Now
              </Button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
