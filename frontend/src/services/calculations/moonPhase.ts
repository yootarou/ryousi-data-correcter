/**
 * 指定日の月齢を計算する（簡易計算）
 * @param date 日付文字列 (YYYY-MM-DD)
 * @returns 月齢 (0-29.5)
 */
export const calculateMoonPhase = (date: string): number => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();

  // Simplified moon phase calculation
  let c = 0;
  let e = 0;
  let jd = 0;

  if (month < 3) {
    c = year - 1;
    e = month + 12;
  } else {
    c = year;
    e = month;
  }

  jd = Math.floor(365.25 * (c + 4716)) + Math.floor(30.6001 * (e + 1)) + day - 1524.5;
  const daysSinceNew = jd - 2451550.1;
  const newMoons = daysSinceNew / 29.530588853;
  const phase = ((newMoons % 1) + 1) % 1;

  return Math.round(phase * 29.5 * 10) / 10;
};

/**
 * 月齢からフェーズ名を取得
 */
export const getMoonPhaseName = (moonAge: number): string => {
  if (moonAge < 1.85) return '新月';
  if (moonAge < 7.38) return '三日月';
  if (moonAge < 9.22) return '上弦';
  if (moonAge < 14.77) return '十三夜';
  if (moonAge < 16.61) return '満月';
  if (moonAge < 22.15) return '十八夜';
  if (moonAge < 23.99) return '下弦';
  if (moonAge < 27.68) return '二十六夜';
  return '新月';
};
