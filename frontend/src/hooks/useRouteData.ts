import { useState, useEffect, useCallback } from 'react';
import { routePointsRepo } from '@/services/db/routePoints';
import { deploymentsRepo } from '@/services/db/deployments';
import type { RoutePoint, Deployment } from '@/types';

export const useRouteData = (recordId: string | undefined) => {
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!recordId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const [points, deps] = await Promise.all([
      routePointsRepo.getByRecordId(recordId),
      deploymentsRepo.getByRecordId(recordId),
    ]);
    setRoutePoints(points);
    setDeployments(deps);
    setIsLoading(false);
  }, [recordId]);

  useEffect(() => {
    load();
  }, [load]);

  return { routePoints, deployments, isLoading, reload: load };
};
