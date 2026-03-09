"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Briefcase, Save } from "lucide-react";
import api from "@/services/api";
import { getErrorMessage } from "@/lib/error-utils";
import { toast } from "sonner";

export function PreferencesCard() {
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api.get("/preferences").then((res) => {
      if (res.data.desired_role) setRole(res.data.desired_role);
      if (res.data.location) setLocation(res.data.location);
      setLoaded(true);
    }).catch((err) => {
      setLoaded(true);
      toast.error(getErrorMessage(err));
    });
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await api.post("/preferences", { desired_role: role, location });
      toast.success("Preferences saved");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl soft-shadow border border-border/40 p-5 space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center">
          <Briefcase className="w-4.5 h-4.5 text-teal-600" />
        </div>
        <div>
          <h2 className="font-semibold text-base">Preferences</h2>
          <p className="text-sm text-muted-foreground">What kind of job are you looking for?</p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Desired Role</label>
          <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Frontend Engineer" className="h-11 rounded-lg" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Location</label>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Remote, New York" className="h-11 rounded-lg" />
        </div>
      </div>
      <Button onClick={save} size="sm" className="w-full gap-1.5 rounded-lg" disabled={saving || !loaded}>
        <Save className="w-3.5 h-3.5" />
        {saving ? "Saving..." : "Save"}
      </Button>
    </div>
  );
}
