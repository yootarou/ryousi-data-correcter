import { fishingRecordsRepo } from '@/services/db/fishingRecords';
import { deploymentsRepo } from '@/services/db/deployments';
import { retrievalsRepo } from '@/services/db/retrievals';

export interface TrendDataPoint {
  label: string;
  value: number;
}

export interface SpeciesData {
  labels: string[];
  data: number[];
  colors: string[];
}

export interface RevenueTrendData {
  labels: string[];
  revenue: number[];
  cost: number[];
  profit: number[];
}

export interface FishingGroundPoint {
  latitude: number;
  longitude: number;
  catchCount: number;
  totalWeight: number;
  label: string;
}

const SPECIES_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
];

export const catchAnalytics = {
  async getMonthlyCatchTrend(monthCount: number = 6): Promise<TrendDataPoint[]> {
    const records = await fishingRecordsRepo.getAll();
    const now = new Date();
    const result: TrendDataPoint[] = [];

    for (let i = monthCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `${d.getMonth() + 1}月`;

      const monthRecords = records.filter((r) => r.date.startsWith(yearMonth));
      const totalKg = monthRecords.reduce(
        (sum, r) => sum + (r.return?.total_catch_kg ?? 0),
        0,
      );

      result.push({ label, value: Math.round(totalKg * 10) / 10 });
    }

    return result;
  },

  async getSpeciesBreakdown(): Promise<SpeciesData> {
    const retrievals = await retrievalsRepo.getAll();
    const speciesMap = new Map<string, number>();

    for (const ret of retrievals) {
      for (const sc of ret.species_catches) {
        const current = speciesMap.get(sc.species) || 0;
        speciesMap.set(sc.species, current + sc.weight_kg);
      }
    }

    // Sort by weight descending
    const sorted = [...speciesMap.entries()].sort((a, b) => b[1] - a[1]);

    return {
      labels: sorted.map(([s]) => s),
      data: sorted.map(([, w]) => Math.round(w * 10) / 10),
      colors: sorted.map((_, i) => SPECIES_COLORS[i % SPECIES_COLORS.length]),
    };
  },

  async getRevenueTrend(monthCount: number = 6): Promise<RevenueTrendData> {
    const records = await fishingRecordsRepo.getAll();
    const now = new Date();
    const labels: string[] = [];
    const revenue: number[] = [];
    const cost: number[] = [];
    const profit: number[] = [];

    for (let i = monthCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      labels.push(`${d.getMonth() + 1}月`);

      const monthRecords = records.filter((r) => r.date.startsWith(yearMonth));
      let monthRevenue = 0;
      let monthCost = 0;

      for (const r of monthRecords) {
        if (r.return) {
          monthRevenue += r.return.total_revenue;
          monthCost += r.return.fuel_used + r.return.ice_cost + r.return.bait_cost + r.return.other_cost;
        }
        monthCost += r.departure.fuel_cost;
      }

      revenue.push(monthRevenue);
      cost.push(monthCost);
      profit.push(monthRevenue - monthCost);
    }

    return { labels, revenue, cost, profit };
  },

  async getFishingGroundData(): Promise<FishingGroundPoint[]> {
    const allDeployments = await deploymentsRepo.getAll();
    const retrievals = await retrievalsRepo.getAll();

    // Build deployment -> retrieval map
    const retMap = new Map(retrievals.map((r) => [r.deployment_id, r]));

    // Cluster nearby positions (within ~0.01 degrees ≈ 1km)
    const clusters: Map<string, FishingGroundPoint> = new Map();
    const PRECISION = 2; // decimal places for clustering

    for (const dep of allDeployments) {
      if (!dep.position.latitude || !dep.position.longitude) continue;

      const key = `${dep.position.latitude.toFixed(PRECISION)},${dep.position.longitude.toFixed(PRECISION)}`;
      const existing = clusters.get(key);
      const retrieval = retMap.get(dep.id);
      const weight = retrieval
        ? retrieval.species_catches.reduce((sum, c) => sum + c.weight_kg, 0)
        : 0;

      if (existing) {
        existing.catchCount += 1;
        existing.totalWeight += weight;
      } else {
        clusters.set(key, {
          latitude: dep.position.latitude,
          longitude: dep.position.longitude,
          catchCount: 1,
          totalWeight: weight,
          label: `投縄${dep.line_number}`,
        });
      }
    }

    return [...clusters.values()];
  },
};
