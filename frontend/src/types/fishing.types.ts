import type { SyncStatus } from './common.types';

/** 出航データ */
export interface DepartureData {
  fishing_start_time: string;
  crew: string[];
  target_species: string[];
  vessel_name: string;
  departure_port: string;
  target_area: string;
  hook_count: number;
  line_count: number;
  bait_type: string[];
  moon_phase: number;
  weather: string;
  fuel_cost: number;
}

/** 帰港データ */
export interface ReturnData {
  fishing_end_time: string;
  return_port: string;
  total_catch_kg: number;
  total_revenue: number;
  fuel_used: number;
  ice_cost: number;
  bait_cost: number;
  other_cost: number;
  memo: string;
  trouble: string;
}

/** 漁業記録 */
export interface FishingRecord {
  id: string;
  user_id: string;
  date: string;
  vessel_name: string;
  departure: DepartureData;
  return?: ReturnData;
  total_distance_km?: number;
  sync_status: SyncStatus;
  created_at: string;
  updated_at: string;
}
