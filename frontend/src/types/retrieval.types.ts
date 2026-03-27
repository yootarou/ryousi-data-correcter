import type { Coordinates, SyncStatus } from './common.types';

/** 魚種別カウント */
export interface SpeciesCatch {
  species: string;
  count: number;
  weight_kg: number;
  size_distribution: SizeDistribution;
}

/** サイズ分布 */
export interface SizeDistribution {
  small: number;
  medium: number;
  large: number;
  extra_large: number;
}

/** 外道 */
export interface BycatchEntry {
  species: string;
  count: number;
  action: 'released' | 'kept' | 'discarded';
}

/** 縄回収記録 */
export interface Retrieval {
  id: string;
  deployment_id: string;
  retrieval_time: string;
  position: Coordinates;
  hook_count_retrieved: number;
  hook_with_catch: number;
  hook_rate: number;
  dwell_time_minutes: number;
  species_catches: SpeciesCatch[];
  bycatch: BycatchEntry[];
  memo: string;
  sync_status: SyncStatus;
  created_at: string;
  updated_at: string;
}
