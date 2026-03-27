/** 同期ステータス */
export type SyncStatus = 'pending' | 'synced' | 'conflict' | 'error';

/** 方位（8方位） */
export type Direction = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

/** 座標 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/** 同期キューアイテム */
export interface SyncQueueItem {
  id?: number;
  type: 'fishing_record' | 'deployment' | 'retrieval';
  payload: unknown;
  priority: number;
  created_at: string;
  status: 'pending' | 'processing' | 'failed';
  retry_count: number;
}

/** フィルター */
export interface RecordFilters {
  date_from?: string;
  date_to?: string;
  species?: string[];
  vessel_name?: string;
}
