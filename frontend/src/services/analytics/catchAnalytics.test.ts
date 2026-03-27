import { describe, it, expect, vi, beforeEach } from 'vitest';
import { catchAnalytics } from './catchAnalytics';

const currentYearMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

vi.mock('@/services/db/fishingRecords', () => {
  const ym = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  return {
    fishingRecordsRepo: {
      getAll: vi.fn().mockResolvedValue([
        {
          id: 'r1', date: `${ym}-10`,
          departure: { fuel_cost: 5000 },
          return: { total_catch_kg: 30, total_revenue: 100000, fuel_used: 2000, ice_cost: 1000, bait_cost: 500, other_cost: 300 },
        },
        {
          id: 'r2', date: `${ym}-15`,
          departure: { fuel_cost: 6000 },
          return: { total_catch_kg: 20, total_revenue: 80000, fuel_used: 2500, ice_cost: 800, bait_cost: 600, other_cost: 200 },
        },
        {
          id: 'r3', date: `${ym}-20`,
          departure: { fuel_cost: 4000 },
          return: null,
        },
      ]),
    },
  };
});

vi.mock('@/services/db/deployments', () => ({
  deploymentsRepo: {
    getAll: vi.fn().mockResolvedValue([
      { id: 'd1', line_number: 1, position: { latitude: 35.1, longitude: 139.5 } },
      { id: 'd2', line_number: 2, position: { latitude: 35.1, longitude: 139.5 } },
      { id: 'd3', line_number: 3, position: { latitude: null, longitude: null } },
    ]),
  },
}));

vi.mock('@/services/db/retrievals', () => ({
  retrievalsRepo: {
    getAll: vi.fn().mockResolvedValue([
      {
        id: 'ret1', deployment_id: 'd1',
        species_catches: [
          { species: 'マグロ', count: 3, weight_kg: 25 },
          { species: 'カツオ', count: 5, weight_kg: 10 },
        ],
      },
      {
        id: 'ret2', deployment_id: 'd2',
        species_catches: [
          { species: 'マグロ', count: 2, weight_kg: 15 },
        ],
      },
    ]),
  },
}));

describe('catchAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMonthlyCatchTrend', () => {
    it('returns monthly data points', async () => {
      const result = await catchAnalytics.getMonthlyCatchTrend(6);
      expect(result).toHaveLength(6);
      expect(result[result.length - 1].label).toContain('月');
    });

    it('sums catch kg for current month', async () => {
      const result = await catchAnalytics.getMonthlyCatchTrend(1);
      // r1: 30kg + r2: 20kg, r3 has no return
      expect(result[0].value).toBe(50);
    });

    it('ignores records without return data', async () => {
      const result = await catchAnalytics.getMonthlyCatchTrend(1);
      expect(result[0].value).toBe(50); // not 50 + 0
    });
  });

  describe('getSpeciesBreakdown', () => {
    it('aggregates species by weight', async () => {
      const result = await catchAnalytics.getSpeciesBreakdown();
      expect(result.labels).toContain('マグロ');
      expect(result.labels).toContain('カツオ');
    });

    it('sorts by weight descending', async () => {
      const result = await catchAnalytics.getSpeciesBreakdown();
      // マグロ: 25 + 15 = 40, カツオ: 10
      expect(result.labels[0]).toBe('マグロ');
      expect(result.data[0]).toBe(40);
      expect(result.data[1]).toBe(10);
    });

    it('assigns colors to each species', async () => {
      const result = await catchAnalytics.getSpeciesBreakdown();
      expect(result.colors).toHaveLength(result.labels.length);
    });
  });

  describe('getRevenueTrend', () => {
    it('returns revenue, cost, and profit arrays', async () => {
      const result = await catchAnalytics.getRevenueTrend(1);
      expect(result.labels).toHaveLength(1);
      expect(result.revenue).toHaveLength(1);
      expect(result.cost).toHaveLength(1);
      expect(result.profit).toHaveLength(1);
    });

    it('calculates revenue correctly', async () => {
      const result = await catchAnalytics.getRevenueTrend(1);
      // r1: 100000 + r2: 80000 = 180000
      expect(result.revenue[0]).toBe(180000);
    });

    it('calculates cost including fuel, ice, bait, other', async () => {
      const result = await catchAnalytics.getRevenueTrend(1);
      // r1: 5000 + 2000+1000+500+300 = 8800
      // r2: 6000 + 2500+800+600+200 = 10100
      // r3: 4000 (no return) = 4000
      expect(result.cost[0]).toBe(22900);
    });

    it('profit equals revenue minus cost', async () => {
      const result = await catchAnalytics.getRevenueTrend(1);
      expect(result.profit[0]).toBe(result.revenue[0] - result.cost[0]);
    });
  });

  describe('getFishingGroundData', () => {
    it('clusters nearby deployments', async () => {
      const result = await catchAnalytics.getFishingGroundData();
      // d1 and d2 at same position, d3 has null coords
      expect(result).toHaveLength(1);
      expect(result[0].catchCount).toBe(2);
    });

    it('sums weight from retrievals', async () => {
      const result = await catchAnalytics.getFishingGroundData();
      // d1: 25+10=35, d2: 15 → total 50
      expect(result[0].totalWeight).toBe(50);
    });

    it('skips deployments without GPS coordinates', async () => {
      const result = await catchAnalytics.getFishingGroundData();
      expect(result.every((p) => p.latitude !== null)).toBe(true);
    });
  });
});
