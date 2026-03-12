import { create } from "zustand";

import api from "@/services/api";

export interface ApplicationJobSummary {
  id: string;
  title: string;
  company: string;
  location?: string;
  apply_url?: string;
  url?: string;
  source?: string;
}

export interface ApplicationRecord {
  id: string;
  job_id: string;
  user_id: string;
  status?: string;
  resume_path?: string;
  cover_letter_content?: string;
  applied_at?: string;
  created_at: string;
  job?: ApplicationJobSummary;
}

interface ApplicationsState {
  applications: ApplicationRecord[];
  loading: boolean;
  applyingJobIds: string[];
  fetchApplications: () => Promise<void>;
  applyToJob: (jobId: string) => Promise<ApplicationRecord | null>;
  isApplied: (jobId: string) => boolean;
}

export const useApplicationsStore = create<ApplicationsState>()((set, get) => ({
  applications: [],
  loading: false,
  applyingJobIds: [],

  fetchApplications: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/applications/");
      set({ applications: res.data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  applyToJob: async (jobId: string) => {
    if (get().applyingJobIds.includes(jobId)) return null;

    set((state) => ({ applyingJobIds: [...state.applyingJobIds, jobId] }));

    try {
      const res = await api.post("/applications/", { job_id: jobId });
      const payload = res.data as ApplicationRecord;

      set((state) => {
        const exists = state.applications.some((item) => item.job_id === payload.job_id);
        return {
          applications: exists ? state.applications : [payload, ...state.applications],
        };
      });

      return payload;
    } finally {
      set((state) => ({
        applyingJobIds: state.applyingJobIds.filter((id) => id !== jobId),
      }));
    }
  },

  isApplied: (jobId: string) => get().applications.some((item) => item.job_id === jobId),
}));
