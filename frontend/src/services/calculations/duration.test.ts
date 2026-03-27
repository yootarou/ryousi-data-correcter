import { describe, it, expect } from 'vitest';
import { calculateDwellTime, formatDuration } from './duration';

describe('calculateDwellTime', () => {
  it('calculates simple time difference', () => {
    expect(calculateDwellTime('05:00', '08:30')).toBe(210);
  });

  it('returns 0 for same time', () => {
    expect(calculateDwellTime('12:00', '12:00')).toBe(0);
  });

  it('handles overnight (crossing midnight)', () => {
    expect(calculateDwellTime('22:00', '02:00')).toBe(240);
  });

  it('handles minute differences', () => {
    expect(calculateDwellTime('06:15', '06:45')).toBe(30);
  });

  it('handles full day minus one minute', () => {
    expect(calculateDwellTime('00:01', '00:00')).toBe(1439);
  });
});

describe('formatDuration', () => {
  it('formats minutes only', () => {
    expect(formatDuration(30)).toBe('30分');
  });

  it('formats hours only', () => {
    expect(formatDuration(120)).toBe('2時間');
  });

  it('formats hours and minutes', () => {
    expect(formatDuration(150)).toBe('2時間30分');
  });

  it('formats zero', () => {
    expect(formatDuration(0)).toBe('0分');
  });
});
