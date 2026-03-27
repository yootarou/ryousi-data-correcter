import { apiClient } from './client';

export interface SyncUploadResponse {
  success: boolean;
  message: string;
  id: string;
}

export interface SyncFetchResponse {
  records: unknown[];
  deployments: unknown[];
  retrievals: unknown[];
  synced_at: string;
}

export const syncAPI = {
  async upload(type: string, payload: unknown): Promise<SyncUploadResponse> {
    const { data } = await apiClient.post<SyncUploadResponse>('/v1/sync/upload', {
      type,
      payload,
    });
    return data;
  },

  async fetchLatest(since: string, userId: string = 'default-user'): Promise<SyncFetchResponse> {
    const { data } = await apiClient.get<SyncFetchResponse>('/v1/sync/latest', {
      params: { since, user_id: userId },
    });
    return data;
  },
};
