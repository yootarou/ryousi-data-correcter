import { db } from './FishingDB';
import type { FishingRecord } from '@/types';

export const fishingRecordsRepo = {
  async getById(id: string): Promise<FishingRecord | undefined> {
    return await db.fishing_records.get(id);
  },

  async getByDate(date: string): Promise<FishingRecord | undefined> {
    const records = await db.fishing_records.where('date').equals(date).toArray();
    if (records.length === 0) return undefined;
    return records.sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
  },

  async getActiveByDate(date: string): Promise<FishingRecord | undefined> {
    const records = await db.fishing_records.where('date').equals(date).toArray();
    const activeRecords = records.filter((record) => !record.return);
    if (activeRecords.length === 0) return undefined;
    return activeRecords.sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
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
    const records = await db.fishing_records.orderBy('date').reverse().toArray();
    return records
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, limit);
  },

  async getAll(): Promise<FishingRecord[]> {
    const records = await db.fishing_records.orderBy('date').reverse().toArray();
    return records.sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  async getByMonth(yearMonth: string): Promise<FishingRecord[]> {
    return await db.fishing_records
      .where('date')
      .startsWith(yearMonth)
      .toArray();
  },

  async getToday(): Promise<FishingRecord | undefined> {
    const today = new Date().toISOString().slice(0, 10);
    return (await this.getActiveByDate(today)) ?? (await this.getByDate(today));
  },

  async count(): Promise<number> {
    return await db.fishing_records.count();
  },
};
