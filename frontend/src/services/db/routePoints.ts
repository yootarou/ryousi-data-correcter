import { db } from './FishingDB';
import type { RoutePoint } from '@/types';

export const routePointsRepo = {
  async bulkAdd(points: RoutePoint[]): Promise<void> {
    await db.route_points.bulkAdd(points);
  },

  async getByRecordId(recordId: string): Promise<RoutePoint[]> {
    return await db.route_points
      .where('[record_id+timestamp]')
      .between([recordId, Dexie.minKey], [recordId, Dexie.maxKey])
      .toArray();
  },

  async getLatest(recordId: string): Promise<RoutePoint | undefined> {
    return await db.route_points
      .where('[record_id+timestamp]')
      .between([recordId, Dexie.minKey], [recordId, Dexie.maxKey])
      .last();
  },

  async deleteByRecordId(recordId: string): Promise<number> {
    return await db.route_points.where('record_id').equals(recordId).delete();
  },

  async count(recordId: string): Promise<number> {
    return await db.route_points.where('record_id').equals(recordId).count();
  },
};

// Dexie needs to be imported for minKey/maxKey
import Dexie from 'dexie';
