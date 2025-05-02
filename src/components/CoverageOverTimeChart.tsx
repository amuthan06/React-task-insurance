import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function CoverageOverTimeChart({ dateRange }: { dateRange: { start: string; end: string } }) {
  const policies = useSelector((state: RootState) => state.policies.list);

  const filteredPolicies = policies.filter((policy) => {
    const policyDate = new Date(policy.start_date);
    const start = dateRange.start ? new Date(dateRange.start) : new Date('1900-01-01');
    const end = dateRange.end ? new Date(dateRange.end) : new Date('2100-12-31');
    return policyDate >= start && policyDate <= end;
  });

  const chartData = useMemo(() => {
    const dates = [...new Set(filteredPolicies.map((p) => p.start_date))].sort();
    const data = dates.map((date) => {
      const policiesOnDate = filteredPolicies.filter((p) => p.start_date === date);
      return policiesOnDate.reduce((sum, p) => sum + p.coverage, 0);
    });

    return {
      labels: dates,
      datasets: [
        {
          label: 'Total Coverage ($)',
          data,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
        },
      ],
    };
  }, [filteredPolicies]);

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Coverage Over Time</h3>
      <Line
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Coverage Over Time' },
          },
        }}
      />
    </div>
  );
}