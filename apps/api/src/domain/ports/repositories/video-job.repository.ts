import type { VideoJob, VideoJobStatus } from "../../entities/video-job.entity.js";

export interface UpdateVideoJobInput {
  status: VideoJobStatus;
  videoUrl?: string;
  errorMessage?: string;
}

export interface IVideoJobRepository {
  create(specJson: string): Promise<VideoJob>;
  list(): Promise<VideoJob[]>;
  findById(id: string): Promise<VideoJob | null>;
  update(id: string, input: UpdateVideoJobInput): Promise<VideoJob>;
}
