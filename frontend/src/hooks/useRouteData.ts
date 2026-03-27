import { useState, useEffect } from 'react';
import { routePointsRepo } from '@/services/db/routePoints';
import { deploymentsRepo } from '@/services/db/deployments';
import type { RoutePoint, Deployment } from '@/types';

export const useRouteData = (recordId: string | undefined) => {
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!recordId) {
      setIsLoading(false);
      return;
    }

    (async () => {
      setIsLoading(true);
      const [points, deps] = await Promise.all([
        routePointsRepo.getByRecordId(recordId),
        deploymentsRepo.getByRecordId(recordId),
      ]);
      setRoutePoints(points);
      setDeployments(deps);
      setIsLoading(false);
    })();
  }, [recordId]);

  return { routePoints, deployments, isLoading };
};
