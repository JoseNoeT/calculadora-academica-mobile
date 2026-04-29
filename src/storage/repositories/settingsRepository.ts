import type { AppSettings } from "../../domain/entities";

export interface SettingsRepository {
  get(): Promise<AppSettings>;
  save(settings: AppSettings): Promise<void>;
  reset(): Promise<void>;
}
