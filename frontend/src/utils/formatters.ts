/**
 * 日付を日本語表示用にフォーマット
 */
export const formatDate = (date: string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * 時刻をHH:mm形式にフォーマット
 */
export const formatTime = (time: string): string => {
  const d = new Date(time);
  return d.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * 金額をフォーマット
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(amount);
};

/**
 * 重量をフォーマット
 */
export const formatWeight = (kg: number): string => {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(1)}t`;
  }
  return `${kg.toFixed(1)}kg`;
};
