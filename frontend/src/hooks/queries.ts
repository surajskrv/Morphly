import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";

// -- Profile & Setup Queries --

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await api.get("/profile");
      return data;
    },
  });
}

export function useResumeStatus() {
  return useQuery({
    queryKey: ["resumeStatus"],
    queryFn: async () => {
      const { data } = await api.get("/resume");
      return data;
    },
  });
}

// -- Jobs Queries --

export function useRecommendedJobs() {
  return useQuery({
    queryKey: ["jobs", "recommended"],
    queryFn: async () => {
      const { data } = await api.get("/jobs/recommended");
      return data.items ?? data;
    },
  });
}

export function useJob(jobId: string) {
  return useQuery({
    queryKey: ["job", jobId],
    queryFn: async () => {
      const { data } = await api.get(`/jobs/${jobId}`);
      return data;
    },
    enabled: !!jobId,
  });
}

export function useJobFetchStatus() {
  return useQuery({
    queryKey: ["jobFetchStatus"],
    queryFn: async () => {
      const { data } = await api.get("/jobs/fetch-status");
      return data;
    },
    refetchInterval: (query) => {
      // Poll every 3 seconds if a fetch is in progress
      return query.state.data?.in_progress ? 3000 : false;
    },
  });
}

export function useTriggerJobFetch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.post("/jobs/fetch");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobFetchStatus"] });
    },
  });
}

// -- Applications Queries --

export function useApplications() {
  return useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const { data } = await api.get("/applications");
      return data.items ?? data;
    },
  });
}

export function useApplication(jobId: string) {
  return useQuery({
    queryKey: ["application", jobId],
    queryFn: async () => {
      // Returns 404 if not found, we handle checking that
      try {
        const { data } = await api.get(`/applications/job/${jobId}`);
        return data;
      } catch (err: any) {
        if (err.response?.status === 404) return null;
        throw err;
      }
    },
    enabled: !!jobId,
  });
}
