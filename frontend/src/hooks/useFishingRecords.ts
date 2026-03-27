import { useState, useEffect, useCallback } from 'react';
import { fishingRecordsRepo } from '@/services/db/fishingRecords';
import type { FishingRecord } from '@/types';

export const useFishingRecords = () => {
  const [records, setRecords] = useState<FishingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fishingRecordsRepo.getRecent(10);
      setRecords(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { records, isLoading, refresh };
};

export const useMonthlyStats = () => {
  const [stats, setStats] = useState({
    fishingDays: 0,
    totalCatchKg: 0,
    totalRevenue: 0,
    roi: null as number | null,
  });
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const yearMonth = new Date().toISOString().slice(0, 7);
      const monthRecords = await fishingRecordsRepo.getByMonth(yearMonth);

      let totalCatchKg = 0;
      let totalRevenue = 0;
      let totalCost = 0;

      for (const record of monthRecords) {
        if (record.return) {
          totalCatchKg += record.return.total_catch_kg;
          totalRevenue += record.return.total_revenue;
          totalCost +=
            record.return.fuel_used +
            record.return.ice_cost +
            record.return.bait_cost +
            record.return.other_cost;
        }
      }

      const roi = totalCost > 0 ? Math.round(((totalRevenue - totalCost) / totalCost) * 100) : null;

      setStats({
        fishingDays: monthRecords.length,
        totalCatchKg,
        totalRevenue,
        roi,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { stats, isLoading, refresh };
};

export const useTodayRecord = () => {
  const [record, setRecord] = useState<FishingRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const today = await fishingRecordsRepo.getToday();
      setRecord(today ?? null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { record, isLoading, refresh };
};
