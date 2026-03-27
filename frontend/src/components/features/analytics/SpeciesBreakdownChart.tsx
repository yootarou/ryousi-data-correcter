import '@/config/chartjs';
import { Doughnut } from 'react-chartjs-2';
import type { SpeciesData } from '@/services/analytics/catchAnalytics';

interface SpeciesBreakdownChartProps {
  data: SpeciesData;
}

export const SpeciesBreakdownChart: React.FC<SpeciesBreakdownChartProps> = ({ data }) => {
  if (data.labels.length === 0) {
    return <p className="text-center text-gray-400 py-8">データなし</p>;
  }

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        data: data.data,
        backgroundColor: data.colors,
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { boxWidth: 12, padding: 12 },
      },
    },
  };

  return (
    <div className="card">
      <h2 className="text-gray-700 mb-3">魚種別漁獲</h2>
      <div style={{ height: '250px' }}>
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
};
