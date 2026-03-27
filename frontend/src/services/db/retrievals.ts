import { db } from './FishingDB';
import { deploymentsRepo } from './deployments';
import type { Retrieval } from '@/types';

export const retrievalsRepo = {
  async getById(id: string): Promise<Retrieval | undefined> {
    return await db.retrievals.get(id);
  },

  async getByDeploymentId(deploymentId: string): Promise<Retrieval | undefined> {
    return await db.retrievals.where('deployment_id').equals(deploymentId).first();
  },

  async getByRecordId(recordId: string): Promise<Retrieval[]> {
    const deployments = await deploymentsRepo.getByRecordId(recordId);
    const deploymentIds = deployments.map((deployment) => deployment.id);
    if (deploymentIds.length === 0) return [];
    return await db.retrievals.where('deployment_id').anyOf(deploymentIds).toArray();
  },

  async create(retrieval: Retrieval): Promise<string> {
    return await db.retrievals.add(retrieval);
  },

  async update(id: string, changes: Partial<Retrieval>): Promise<number> {
    return await db.retrievals.update(id, changes);
  },

  async delete(id: string): Promise<void> {
    await db.retrievals.delete(id);
  },

  async getAll(): Promise<Retrieval[]> {
    return await db.retrievals.toArray();
  },
};
