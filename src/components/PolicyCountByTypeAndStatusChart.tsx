import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function PolicyCountByTypeAndStatusChart({ statusFilter }: { statusFilter: string }) {
  const policies = useSelector((state: RootState) => state.policies.list);

  const filteredPolicies = statusFilter
    ? policies.filter((policy) => policy.status === statusFilter)
    : policies;

  const chartData = useMemo(() => {
    const types = [...new Set(filteredPolicies.map((p) => p.type))];
    const statuses = ['Active', 'Expired', 'Pending'];

    const datasets = statuses.map((status) => ({
      label: status,
      data: types.map((type) =>
        filteredPolicies.filter((p) => p.type === type && p.status === status).length
      ),
      backgroundColor:
        status === 'Active'
          ? 'rgba(75, 192, 192, 0.6)'
          : status === 'Expired'
          ? 'rgba(255, 99, 132, 0.6)'
          : 'rgba(255, 206, 86, 0.6)',
    }));

    return {
      labels: types,
      datasets,
    };
  }, [filteredPolicies]);

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Policy Count by Type and Status</h3>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Policy Count by Type and Status' },
          },
          scales: {
            x: { stacked: true },
            y: { stacked: true, beginAtZero: true, ticks: { stepSize: 1 } },
          },
        }}
      />
    </div>
  );
}