import Dexie, { type Table } from 'dexie';
import type { FishingRecord, Deployment, Retrieval, SyncQueueItem, RoutePoint } from '@/types';

export class FishingDB extends Dexie {
  fishing_records!: Table<FishingRecord>;
  deployments!: Table<Deployment>;
  retrievals!: Table<Retrieval>;
  sync_queue!: Table<SyncQueueItem>;
  route_points!: Table<RoutePoint>;

  constructor() {
    super('FishingAppDB');

    this.version(1).stores({
      fishing_records: 'id, user_id, date, vessel_name, sync_status',
      deployments: 'id, record_id, line_number, deployment_time, [record_id+line_number]',
      retrievals: 'id, deployment_id, retrieval_time, sync_status',
      sync_queue: '++id, type, priority, created_at, status',
    });

    this.version(2).stores({
      fishing_records: 'id, user_id, date, vessel_name, sync_status',
      deployments: 'id, record_id, line_number, deployment_time, [record_id+line_number]',
      retrievals: 'id, deployment_id, retrieval_time, sync_status',
      sync_queue: '++id, type, priority, created_at, status',
      route_points: 'id, record_id, timestamp, [record_id+timestamp]',
    });
  }
}

export const db = new FishingDB();
