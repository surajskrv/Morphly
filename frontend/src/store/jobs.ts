import { create } from 'zustand';
import api from '@/services/api';

export interface Job {
  id: string;
  external_id?: string;
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

interface JobsState {
  jobs: Job[];
  loading: boolean;
  fetchJobs: () => Promise<void>;
}

export const useJobsStore = create<JobsState>()((set) => ({
  jobs: [],
  loading: false,
  fetchJobs: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/jobs/recommended');
      set({ jobs: res.data, loading: false });
    } catch {
      set({ loading: false });
    }
  }
}));
