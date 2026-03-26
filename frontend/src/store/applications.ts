import { create } from "zustand";

import api from "@/services/api";

export type ApplicationStatus = "saved" | "ready" | "applied";

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
  status: ApplicationStatus;
  resume_path?: string;
  resume_sections?: Array<{
    id: string;
    title: string;
    content: string;
  }>;
  resume_grounding?: string[];
  cover_letter_content?: string;
  cover_letter_grounding?: string[];
  applied_at?: string;
  updated_at?: string;
  created_at: string;
  job?: ApplicationJobSummary;
}

interface ApplicationsState {
  applications: ApplicationRecord[];
  loading: boolean;
  fetchApplications: () => Promise<void>;
  saveApplication: (payload: {
    job_id: string;
    status?: ApplicationStatus;
    resume_sections?: Array<{
      id: string;
      title: string;
      content: string;
    }>;
    resume_grounding?: string[];
    cover_letter_content?: string;
    cover_letter_grounding?: string[];
  }) => Promise<ApplicationRecord | null>;
  updateStatus: (applicationId: string, status: ApplicationStatus) => Promise<ApplicationRecord | null>;
  updateApplication: (
    applicationId: string,
    payload: Partial<Pick<ApplicationRecord, "status" | "resume_path" | "resume_sections" | "resume_grounding" | "cover_letter_content" | "cover_letter_grounding">>
  ) => Promise<ApplicationRecord | null>;
  getByJobId: (jobId: string) => ApplicationRecord | undefined;
}

export const useApplicationsStore = create<ApplicationsState>()((set, get) => ({
  applications: [],
  loading: false,

  fetchApplications: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/applications/");
      set({ applications: res.data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  saveApplication: async ({
    job_id,
    status = "saved",
    resume_sections,
    resume_grounding,
    cover_letter_content,
    cover_letter_grounding,
  }) => {
    try {
      const res = await api.post("/applications/", {
        job_id,
        status,
        resume_sections,
        resume_grounding,
        cover_letter_content,
        cover_letter_grounding,
      });
      const payload = res.data as ApplicationRecord;
      set((state) => ({
        applications: [
          payload,
          ...state.applications.filter((item) => item.id !== payload.id),
        ],
      }));
      return payload;
    } catch {
      return null;
    }
  },

  updateStatus: async (applicationId, status) => {
    return get().updateApplication(applicationId, { status });
  },

  updateApplication: async (applicationId, payload) => {
    try {
      const res = await api.patch(`/applications/${applicationId}`, payload);
      const updated = res.data as ApplicationRecord;
      set((state) => ({
        applications: state.applications.map((item) => (item.id === updated.id ? updated : item)),
      }));
      return updated;
    } catch {
      return null;
    }
  },

  getByJobId: (jobId) => get().applications.find((item) => item.job_id === jobId),
}));
