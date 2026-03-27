import { useState, useEffect, useCallback } from 'react';
import { routePointsRepo } from '@/services/db/routePoints';
import { deploymentsRepo } from '@/services/db/deployments';
import { retrievalsRepo } from '@/services/db/retrievals';
import type { RoutePoint, Deployment, Retrieval } from '@/types';

export const useRouteData = (recordId: string | undefined) => {
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [retrievals, setRetrievals] = useState<Retrieval[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!recordId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const [points, deps, rets] = await Promise.all([
      routePointsRepo.getByRecordId(recordId),
      deploymentsRepo.getByRecordId(recordId),
      retrievalsRepo.getByRecordId(recordId),
    ]);
    setRoutePoints(points);
    setDeployments(deps);
    setRetrievals(rets);
    setIsLoading(false);
  }, [recordId]);

  useEffect(() => {
    load();
  }, [load]);

  return { routePoints, deployments, retrievals, isLoading, reload: load };
};
