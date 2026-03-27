/**
 * ROI（投資利益率）を計算
 */
export const calculateROI = (revenue: number, totalCost: number): number | null => {
  if (totalCost === 0) return null;
  return Math.round(((revenue - totalCost) / totalCost) * 100);
};

/**
 * 利益を計算
 */
export const calculateProfit = (revenue: number, totalCost: number): number => {
  return revenue - totalCost;
};
