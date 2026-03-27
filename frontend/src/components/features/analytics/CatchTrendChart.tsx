import '@/config/chartjs';
import { Bar } from 'react-chartjs-2';
import type { TrendDataPoint } from '@/services/analytics/catchAnalytics';

interface CatchTrendChartProps {
  data: TrendDataPoint[];
}

export const CatchTrendChart: React.FC<CatchTrendChartProps> = ({ data }) => {
  if (data.length === 0) {
    return <p className="text-center text-gray-400 py-8">データなし</p>;
  }

  const chartData = {
    labels: data.map((d) => d.label),
    datasets: [
      {
        label: '漁獲量 (kg)',
        data: data.map((d) => d.value),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: '#3b82f6',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: unknown) => `${value}kg`,
        },
      },
    },
  } as const;

  return (
    <div className="card">
      <h2 className="text-gray-700 mb-3">月別漁獲量</h2>
      <div style={{ height: '200px' }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};
