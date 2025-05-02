import { useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PolicyDistributionByRegionChart() {
  const policies = useSelector((state: RootState) => state.policies.list);
  const policyholders = useSelector((state: RootState) => state.policyholders.list);

  const chartData = useMemo(() => {
    const regions = [...new Set(policyholders.map((ph) => ph.region).filter(Boolean))];
    const data = regions.map((region) => {
      const policyholdersInRegion = policyholders.filter((ph) => ph.region === region);
      const policyCount = policies.filter((p) =>
        policyholdersInRegion.some((ph) => ph.id === p.policyholder_id)
      ).length;
      return policyCount;
    });

    return {
      labels: regions,
      datasets: [
        {
          label: 'Policies by Region',
          data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
          ],
        },
      ],
    };
  }, [policies, policyholders]);

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Policy Distribution by Region</h3>
      <Pie
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Policy Distribution by Region' },
          },
        }}
      />
    </div>
  );
}