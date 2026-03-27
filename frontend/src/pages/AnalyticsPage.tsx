import { useAnalytics } from '@/hooks/useAnalytics';
import {
  CatchTrendChart,
  SpeciesBreakdownChart,
  RevenueTrendChart,
  FishingGroundMap,
} from '@/components/features/analytics';

const AnalyticsPage = () => {
  const { catchTrend, speciesBreakdown, revenueTrend, fishingGrounds, isLoading } =
    useAnalytics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 max-w-[var(--max-content-width)] mx-auto animate-fade-in pb-24">
      <h1>分析</h1>

      <CatchTrendChart data={catchTrend} />
      <RevenueTrendChart data={revenueTrend} />
      <SpeciesBreakdownChart data={speciesBreakdown} />
      <FishingGroundMap data={fishingGrounds} />
    </div>
  );
};

export default AnalyticsPage;
