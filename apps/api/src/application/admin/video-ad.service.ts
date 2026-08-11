import type { CreateVideoJobInput, VideoJobDto } from "@d-shirtak/shared";
import { parseBuffer } from "music-metadata";
import { renderProductCommercial } from "@d-shirtak/video-renderer";
import { NotFoundError, ValidationError } from "../../domain/errors.js";
import type { VideoJob, VideoJobSpec } from "../../domain/entities/video-job.entity.js";
import type { IVideoJobRepository } from "../../domain/ports/repositories/video-job.repository.js";
import type { IProductRepository } from "../../domain/ports/repositories/product.repository.js";
import type { IDesignAssetRepository } from "../../domain/ports/repositories/design-library.repository.js";
import type { IFileStorage } from "../../domain/ports/file-storage.port.js";
import { synthesizeSpeech } from "../../infrastructure/tts/elevenlabs-client.js";
import { env } from "../../infrastructure/config/env.js";

const DEFAULT_AUDIO_DURATION_SECONDS = 20;
const CTA_TEXT = "صمم قطعتك دلوقتي على D-Shirtak";

function toDto(job: VideoJob): VideoJobDto {
  const spec = JSON.parse(job.specJson) as VideoJobSpec;
  return {
    id: job.id,
    status: job.status,
    productName: spec.productName,
    videoUrl: job.videoUrl,
    errorMessage: job.errorMessage,
    createdAt: job.createdAt.toISOString(),
  };
}

export class VideoAdService {
  constructor(
    private readonly jobs: IVideoJobRepository,
    private readonly products: IProductRepository,
    private readonly designAssets: IDesignAssetRepository,
    private readonly fileStorage: IFileStorage,
  ) {}

  async listJobs(): Promise<VideoJobDto[]> {
    const rows = await this.jobs.list();
    return rows.map(toDto);
  }

  async getJob(id: string): Promise<VideoJobDto> {
    const job = await this.jobs.findById(id);
    if (!job) throw new NotFoundError("VideoJob", id);
    return toDto(job);
  }

  async createJob(input: CreateVideoJobInput): Promise<VideoJobDto> {
    const { productName, priceLabel, imageUrls } = await this.resolveAssets(input);
    if (imageUrls.length === 0) throw new ValidationError("No images resolved for this video");

    const spec: VideoJobSpec = { productName, priceLabel, imageUrls, scriptText: input.scriptText };
    const job = await this.jobs.create(JSON.stringify(spec));

    // Fire-and-forget: the HTTP response returns the PENDING job immediately. Rendering takes
    // minutes and happens in the background; the admin UI polls GET /admin/video-jobs/:id.
    void this.processJob(job.id, spec);

    return toDto(job);
  }

  private async resolveAssets(
    input: CreateVideoJobInput,
  ): Promise<{ productName: string; priceLabel: string; imageUrls: string[] }> {
    if (input.productId && input.colorId) {
      const product = await this.products.findById(input.productId);
      if (!product) throw new NotFoundError("Product", input.productId);
      const color = product.colors.find((c) => c.colorId === input.colorId);
      if (!color) throw new ValidationError("That color isn't set up for this product");

      const imageUrls = [color.modelFrontImageUrl, color.frontImageUrl, color.modelBackImageUrl, color.backImageUrl].filter(
        (url): url is string => Boolean(url),
      );

      if (input.designAssetId) {
        const asset = await this.designAssets.findById(input.designAssetId);
        if (asset) imageUrls.push(asset.imageUrl);
      }

      return { productName: product.name, priceLabel: `${product.basePrice} جنيه`, imageUrls };
    }

    return { productName: "D-Shirtak", priceLabel: "", imageUrls: input.imageUrls ?? [] };
  }

  private async processJob(id: string, spec: VideoJobSpec): Promise<void> {
    try {
      await this.jobs.update(id, { status: "RENDERING" });

      let audioUrl = "";
      let audioDurationInSeconds = DEFAULT_AUDIO_DURATION_SECONDS;

      if (env.ELEVENLABS_API_KEY) {
        const audioBuffer = await synthesizeSpeech(spec.scriptText);
        const audioMeta = await parseBuffer(audioBuffer, "audio/mpeg");
        audioDurationInSeconds = audioMeta.format.duration ?? DEFAULT_AUDIO_DURATION_SECONDS;
        const audioSaved = await this.fileStorage.saveBuffer("videos", "narration.mp3", audioBuffer);
        audioUrl = audioSaved.url;
      }

      const videoBuffer = await renderProductCommercial({
        productName: spec.productName,
        priceLabel: spec.priceLabel,
        imageUrls: spec.imageUrls,
        audioUrl,
        audioDurationInSeconds,
        ctaText: CTA_TEXT,
      });

      const videoSaved = await this.fileStorage.saveBuffer("videos", "commercial.mp4", videoBuffer);
      await this.jobs.update(id, { status: "DONE", videoUrl: videoSaved.url });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      await this.jobs.update(id, { status: "FAILED", errorMessage: message.slice(0, 500) });
    }
  }
}
