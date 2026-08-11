import type { PrismaClient } from "@prisma/client";
import type { StoreSettings } from "../../../domain/entities/catalog.entity.js";
import type { IStoreSettingsRepository } from "../../../domain/ports/repositories/store-settings.repository.js";

const SINGLETON_ID = "singleton";

function toStoreSettings(row: { id: string; customizationSurchargeEgp: { toString(): string } }): StoreSettings {
  return { id: row.id, customizationSurchargeEgp: Number(row.customizationSurchargeEgp) };
}

export class PrismaStoreSettingsRepository implements IStoreSettingsRepository {
  constructor(private readonly db: PrismaClient) {}

  async get(): Promise<StoreSettings> {
    const row = await this.db.storeSettings.findUniqueOrThrow({ where: { id: SINGLETON_ID } });
    return toStoreSettings(row);
  }

  async update(customizationSurchargeEgp: number): Promise<StoreSettings> {
    const row = await this.db.storeSettings.update({
      where: { id: SINGLETON_ID },
      data: { customizationSurchargeEgp },
    });
    return toStoreSettings(row);
  }
}
