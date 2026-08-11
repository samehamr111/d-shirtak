import type { StoreSettings } from "../../entities/catalog.entity.js";

export interface IStoreSettingsRepository {
  get(): Promise<StoreSettings>;
  update(customizationSurchargeEgp: number): Promise<StoreSettings>;
}
