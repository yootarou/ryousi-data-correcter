import { useState, useEffect, useCallback } from 'react';
import {
  catchAnalytics,
  type TrendDataPoint,
  type SpeciesData,
  type RevenueTrendData,
  type FishingGroundPoint,
} from '@/services/analytics/catchAnalytics';

export const useAnalytics = () => {
  const [catchTrend, setCatchTrend] = useState<TrendDataPoint[]>([]);
  const [speciesBreakdown, setSpeciesBreakdown] = useState<SpeciesData>({
    labels: [],
    data: [],
    colors: [],
  });
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrendData>({
    labels: [],
    revenue: [],
    cost: [],
    profit: [],
  });
  const [fishingGrounds, setFishingGrounds] = useState<FishingGroundPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const [ct, sp, rv, fg] = await Promise.all([
      catchAnalytics.getMonthlyCatchTrend(6),
      catchAnalytics.getSpeciesBreakdown(),
      catchAnalytics.getRevenueTrend(6),
      catchAnalytics.getFishingGroundData(),
    ]);
    setCatchTrend(ct);
    setSpeciesBreakdown(sp);
    setRevenueTrend(rv);
    setFishingGrounds(fg);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    catchTrend,
    speciesBreakdown,
    revenueTrend,
    fishingGrounds,
    isLoading,
    refresh,
  };
};
