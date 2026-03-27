import { apiClient } from './client';
import type { FishingRecord, Deployment, Retrieval, RecordFilters } from '@/types';

export const fishingAPI = {
  async getRecords(userId: string = 'default-user', filters?: RecordFilters): Promise<FishingRecord[]> {
    const { data } = await apiClient.get('/v1/fishing/records', {
      params: { user_id: userId, ...filters },
    });
    return data;
  },

  async getRecord(id: string): Promise<FishingRecord> {
    const { data } = await apiClient.get(`/v1/fishing/records/${id}`);
    return data;
  },

  async createRecord(record: FishingRecord): Promise<FishingRecord> {
    const { data } = await apiClient.post('/v1/fishing/records', record);
    return data;
  },

  async getDeployments(recordId: string): Promise<Deployment[]> {
    const { data } = await apiClient.get(`/v1/fishing/records/${recordId}/deployments`);
    return data;
  },

  async createDeployment(deployment: Deployment): Promise<Deployment> {
    const { data } = await apiClient.post('/v1/fishing/deployments', deployment);
    return data;
  },

  async createRetrieval(retrieval: Retrieval): Promise<Retrieval> {
    const { data } = await apiClient.post('/v1/fishing/retrievals', retrieval);
    return data;
  },
};
