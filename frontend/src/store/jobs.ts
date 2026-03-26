import { create } from "zustand";

import api from "@/services/api";

export interface Job {
  id: string;
  external_id?: string;
  title: string;
  company: string;
  location?: string;
  description?: string;
  url?: string;
  apply_url?: string;
  posted_at?: string;
  salary_min?: number;
  salary_max?: number;
  match_score?: number;
  relevance_score?: number;
  match_reasons?: string[];
  skills?: string[];
  source?: string;
}

export interface JobFetchStatus {
  in_progress: boolean;
  last_requested_at?: string | null;
  last_completed_at?: string | null;
  last_error?: string | null;
}

interface JobsState {
  jobs: Job[];
  loading: boolean;
  fetchStatus: JobFetchStatus | null;
  fetchJobs: () => Promise<void>;
  fetchFetchStatus: () => Promise<JobFetchStatus | null>;
  getJobById: (jobId: string) => Promise<Job | null>;
}

export const useJobsStore = create<JobsState>()((set, get) => ({
  jobs: [],
  loading: false,
  fetchStatus: null,

  fetchJobs: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/jobs/recommended");
      set({ jobs: res.data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchFetchStatus: async () => {
    try {
      const res = await api.get("/jobs/fetch-status");
      const payload = res.data as JobFetchStatus;
      set({ fetchStatus: payload });
      return payload;
    } catch {
      return null;
    }
  },

  getJobById: async (jobId: string) => {
    const existing = get().jobs.find((job) => job.id === jobId);
    if (existing) {
      return existing;
    }

    try {
      const res = await api.get(`/jobs/${jobId}`);
      const job = res.data as Job;
      set((state) => ({ jobs: [job, ...state.jobs.filter((item) => item.id !== job.id)] }));
      return job;
    } catch {
      return null;
    }
  },
}));
