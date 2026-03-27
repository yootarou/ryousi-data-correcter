import { useState, useCallback } from 'react';
import { fishingRecordsRepo } from '@/services/db/fishingRecords';
import { deploymentsRepo } from '@/services/db/deployments';
import { retrievalsRepo } from '@/services/db/retrievals';
import type { FishingRecord, Deployment, Retrieval } from '@/types';

export const useLocalDB = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const withLoading = useCallback(async <T>(fn: () => Promise<T>): Promise<T | undefined> => {
    setIsLoading(true);
    setError(null);
    try {
      return await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'DB operation failed');
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    fishingRecords: {
      getById: (id: string) => withLoading(() => fishingRecordsRepo.getById(id)),
      getByDate: (date: string) => withLoading(() => fishingRecordsRepo.getByDate(date)),
      create: (record: FishingRecord) => withLoading(() => fishingRecordsRepo.create(record)),
      update: (id: string, changes: Partial<FishingRecord>) =>
        withLoading(() => fishingRecordsRepo.update(id, changes)),
      getRecent: (limit?: number) => withLoading(() => fishingRecordsRepo.getRecent(limit)),
    },
    deployments: {
      getById: (id: string) => withLoading(() => deploymentsRepo.getById(id)),
      getByRecordId: (recordId: string) =>
        withLoading(() => deploymentsRepo.getByRecordId(recordId)),
      create: (deployment: Deployment) => withLoading(() => deploymentsRepo.create(deployment)),
      update: (id: string, changes: Partial<Deployment>) =>
        withLoading(() => deploymentsRepo.update(id, changes)),
    },
    retrievals: {
      getById: (id: string) => withLoading(() => retrievalsRepo.getById(id)),
      getByDeploymentId: (deploymentId: string) =>
        withLoading(() => retrievalsRepo.getByDeploymentId(deploymentId)),
      create: (retrieval: Retrieval) => withLoading(() => retrievalsRepo.create(retrieval)),
      update: (id: string, changes: Partial<Retrieval>) =>
        withLoading(() => retrievalsRepo.update(id, changes)),
    },
  };
};
