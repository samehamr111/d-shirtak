import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateVideoJobInput, VideoJobDto } from "@d-shirtak/shared";
import { api } from "../../lib/api-client";

const BASE = "/admin/video-jobs";
const ACTIVE_STATUSES: VideoJobDto["status"][] = ["PENDING", "RENDERING"];

export function useVideoJobs() {
  return useQuery({
    queryKey: ["video-jobs"],
    queryFn: () => api.get<VideoJobDto[]>(BASE),
    refetchInterval: (query) => {
      const jobs = query.state.data as VideoJobDto[] | undefined;
      const hasActiveJob = jobs?.some((j) => ACTIVE_STATUSES.includes(j.status)) ?? false;
      return hasActiveJob ? 4000 : false;
    },
  });
}

export function useCreateVideoJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateVideoJobInput) => api.post<VideoJobDto>(BASE, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["video-jobs"] }),
  });
}
