import { describe, it, expect } from 'vitest';
import { calculateROI, calculateProfit } from './roi';

describe('calculateROI', () => {
  it('calculates positive ROI', () => {
    expect(calculateROI(150000, 100000)).toBe(50);
  });

  it('calculates negative ROI', () => {
    expect(calculateROI(50000, 100000)).toBe(-50);
  });

  it('returns null when totalCost is 0', () => {
    expect(calculateROI(100000, 0)).toBeNull();
  });

  it('calculates 0% ROI for break-even', () => {
    expect(calculateROI(100000, 100000)).toBe(0);
  });

  it('rounds to integer', () => {
    expect(calculateROI(200000, 150000)).toBe(33);
  });
});

describe('calculateProfit', () => {
  it('calculates positive profit', () => {
    expect(calculateProfit(150000, 100000)).toBe(50000);
  });

  it('calculates negative profit (loss)', () => {
    expect(calculateProfit(50000, 100000)).toBe(-50000);
  });

  it('calculates zero profit', () => {
    expect(calculateProfit(100000, 100000)).toBe(0);
  });
});
