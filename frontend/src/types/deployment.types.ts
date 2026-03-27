import type { Coordinates, Direction, SyncStatus } from './common.types';

/** 縄設置記録 */
export interface Deployment {
  id: string;
  record_id: string;
  line_number: number;
  deployment_time: string;
  position: Coordinates;
  depth: number;
  hook_count: number;
  hook_interval: number;
  line_length: number;
  bait_type: string;
  water_temp: number;
  current_direction: Direction;
  current_speed: number;
  wind_direction: Direction;
  wind_speed: number;
  wave_height: number;
  visibility: string;
  moon_phase: number;
  tide_phase: string;
  fish_finder_reaction: string;
  bird_activity: string;
  memo: string;
  sync_status: SyncStatus;
  created_at: string;
  updated_at: string;
}
