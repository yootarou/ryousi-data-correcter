import '@/config/chartjs';
import { Bar } from 'react-chartjs-2';
import type { RevenueTrendData } from '@/services/analytics/catchAnalytics';

interface RevenueTrendChartProps {
  data: RevenueTrendData;
}

export const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({ data }) => {
  if (data.labels.length === 0) {
    return <p className="text-center text-gray-400 py-8">データなし</p>;
  }

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: '売上',
        data: data.revenue,
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: '#10b981',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'コスト',
        data: data.cost,
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderColor: '#ef4444',
        borderWidth: 1,
        borderRadius: 4,
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
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: unknown) => `¥${Number(value).toLocaleString()}`,
        },
      },
    },
  } as const;

  return (
    <div className="card">
      <h2 className="text-gray-700 mb-3">月別売上・コスト</h2>
      <div style={{ height: '220px' }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};
