import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function PolicyholderChart() {
  const policyholders = useSelector((state: RootState) => state.policyholders.list);

  // Prepare chart data
  const data = {
    labels: ['Policyholders'], // Single label for now
    datasets: [
      {
        label: 'Number of Policyholders',
        data: [policyholders.length], // Count of policyholders
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Policyholder Statistics',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Count',
        },
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded shadow-md">
      <Bar data={data} options={options} />
    </div>
  );
}