import { db } from './FishingDB';
import type { FishingRecord } from '@/types';

export const fishingRecordsRepo = {
  async getById(id: string): Promise<FishingRecord | undefined> {
    return await db.fishing_records.get(id);
  },

  async getByDate(date: string): Promise<FishingRecord | undefined> {
    return await db.fishing_records.where('date').equals(date).first();
  },

  async create(record: FishingRecord): Promise<string> {
    return await db.fishing_records.add(record);
  },

  async update(id: string, changes: Partial<FishingRecord>): Promise<number> {
    return await db.fishing_records.update(id, changes);
  },

  async delete(id: string): Promise<void> {
    await db.fishing_records.delete(id);
  },

  async getRecent(limit: number = 10): Promise<FishingRecord[]> {
    return await db.fishing_records.orderBy('date').reverse().limit(limit).toArray();
  },

  async getAll(): Promise<FishingRecord[]> {
    return await db.fishing_records.orderBy('date').reverse().toArray();
  },

  async getByMonth(yearMonth: string): Promise<FishingRecord[]> {
    return await db.fishing_records
      .where('date')
      .startsWith(yearMonth)
      .toArray();
  },

  async getToday(): Promise<FishingRecord | undefined> {
    const today = new Date().toISOString().slice(0, 10);
    return await this.getByDate(today);
  },

  async count(): Promise<number> {
    return await db.fishing_records.count();
  },
};
