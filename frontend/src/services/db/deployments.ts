import { db } from './FishingDB';
import type { Deployment } from '@/types';

export const deploymentsRepo = {
  async getById(id: string): Promise<Deployment | undefined> {
    return await db.deployments.get(id);
  },

  async getByRecordId(recordId: string): Promise<Deployment[]> {
    return await db.deployments.where('record_id').equals(recordId).toArray();
  },

  async create(deployment: Deployment): Promise<string> {
    return await db.deployments.add(deployment);
  },

  async update(id: string, changes: Partial<Deployment>): Promise<number> {
    return await db.deployments.update(id, changes);
  },

  async delete(id: string): Promise<void> {
    await db.deployments.delete(id);
  },

  async getAll(): Promise<Deployment[]> {
    return await db.deployments.toArray();
  },

  async getNextLineNumber(recordId: string): Promise<number> {
    const deployments = await this.getByRecordId(recordId);
    if (deployments.length === 0) return 1;
    return Math.max(...deployments.map((d) => d.line_number)) + 1;
  },
};
