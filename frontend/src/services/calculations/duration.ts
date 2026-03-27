/**
 * 2つの時刻間の滞留時間を計算（分）
 */
export const calculateDwellTime = (startTime: string, endTime: string): number => {
  const toMinutes = (t: string) => {
    const parts = t.split(':').map(Number);
    return parts[0] * 60 + parts[1];
  };
  const startMin = toMinutes(startTime);
  const endMin = toMinutes(endTime);
  const diff = endMin - startMin;
  return diff >= 0 ? diff : diff + 24 * 60;
};

/**
 * 分を「○時間○分」形式にフォーマット
 */
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}分`;
  if (mins === 0) return `${hours}時間`;
  return `${hours}時間${mins}分`;
};
