import { describe, it, expect } from 'vitest';
import { calculateMoonPhase, getMoonPhaseName } from './moonPhase';

describe('calculateMoonPhase', () => {
  it('returns a number between 0 and 29.5', () => {
    const phase = calculateMoonPhase('2026-03-27');
    expect(phase).toBeGreaterThanOrEqual(0);
    expect(phase).toBeLessThanOrEqual(29.5);
  });

  it('returns consistent results for the same date', () => {
    const phase1 = calculateMoonPhase('2026-01-15');
    const phase2 = calculateMoonPhase('2026-01-15');
    expect(phase1).toBe(phase2);
  });

  it('returns different results for different dates', () => {
    const phase1 = calculateMoonPhase('2026-01-01');
    const phase2 = calculateMoonPhase('2026-01-15');
    expect(phase1).not.toBe(phase2);
  });
});

describe('getMoonPhaseName', () => {
  it('returns 新月 for 0', () => {
    expect(getMoonPhaseName(0)).toBe('新月');
  });

  it('returns 三日月 for 3', () => {
    expect(getMoonPhaseName(3)).toBe('三日月');
  });

  it('returns 上弦 for 7.5', () => {
    expect(getMoonPhaseName(7.5)).toBe('上弦');
  });

  it('returns 満月 for 15', () => {
    expect(getMoonPhaseName(15)).toBe('満月');
  });

  it('returns 下弦 for 22.5', () => {
    expect(getMoonPhaseName(22.5)).toBe('下弦');
  });

  it('returns 新月 for values near 29.5', () => {
    expect(getMoonPhaseName(29)).toBe('新月');
  });
});
