import type { DesignDto, SaveDesignInput } from "@d-shirtak/shared";
import { NotFoundError } from "../../domain/errors.js";
import type { IDesignRepository } from "../../domain/ports/repositories/design.repository.js";
import type { IProductVariantRepository } from "../../domain/ports/repositories/product.repository.js";
import type { IFileStorage } from "../../domain/ports/file-storage.port.js";
import type { Design } from "../../domain/entities/design.entity.js";

function toDto(design: Design): DesignDto {
  return {
    id: design.id,
    productVariantId: design.productVariantId,
    side: design.side,
    canvasJson: JSON.parse(design.canvasJson),
    previewImageUrl: design.previewImageUrl,
    createdAt: design.createdAt.toISOString(),
  };
}

export class DesignService {
  constructor(
    private readonly designs: IDesignRepository,
    private readonly variants: IProductVariantRepository,
    private readonly fileStorage: IFileStorage,
  ) {}

  async save(userId: string, input: SaveDesignInput): Promise<DesignDto> {
    const variant = await this.variants.findById(input.productVariantId);
    if (!variant) throw new NotFoundError("ProductVariant", input.productVariantId);

    // A guest's design was already uploaded once (externalizeDesign, to keep it out of
    // localStorage) -- when their cart flushes to the server post-login it arrives as that
    // hosted URL already, not fresh base64, so there's nothing left to upload.
    const previewImageUrl = input.previewImageDataUrl.startsWith("data:")
      ? (await this.fileStorage.saveBase64Image("designs", input.previewImageDataUrl)).url
      : input.previewImageDataUrl;

    const created = await this.designs.create({
      ownerUserId: userId,
      productVariantId: variant.id,
      side: input.side,
      canvasJson: JSON.stringify(input.canvasJson),
      previewImageUrl,
    });

    return toDto(created);
  }
}
