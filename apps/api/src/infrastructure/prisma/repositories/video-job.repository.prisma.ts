import type { PrismaClient } from "@prisma/client";
import type { VideoJob } from "../../../domain/entities/video-job.entity.js";
import type {
  IVideoJobRepository,
  UpdateVideoJobInput,
} from "../../../domain/ports/repositories/video-job.repository.js";

function toVideoJob(row: {
  id: string;
  status: string;
  specJson: string;
  videoUrl: string | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}): VideoJob {
  return { ...row, status: row.status as VideoJob["status"] };
}

export class PrismaVideoJobRepository implements IVideoJobRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(specJson: string): Promise<VideoJob> {
    const row = await this.db.videoJob.create({ data: { specJson } });
    return toVideoJob(row);
  }

  async list(): Promise<VideoJob[]> {
    const rows = await this.db.videoJob.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map(toVideoJob);
  }

  async findById(id: string): Promise<VideoJob | null> {
    const row = await this.db.videoJob.findUnique({ where: { id } });
    return row ? toVideoJob(row) : null;
  }

  async update(id: string, input: UpdateVideoJobInput): Promise<VideoJob> {
    const row = await this.db.videoJob.update({ where: { id }, data: input });
    return toVideoJob(row);
  }
}
