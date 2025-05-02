import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CoverageOverTimeChartProps {
  policies: Array<{
    id: string;
    number: string;
    type: string;
    coverage: number;
    start_date: string;
    end_date: string;
    status: string;
    policyholder_id: string;
  }>;
}

const CoverageOverTimeChart = ({ policies }: CoverageOverTimeChartProps) => {
  // Prepare data for the chart (coverage over time)
  const data = policies.map((policy) => ({
    date: policy.start_date,
    coverage: policy.coverage,
  }));

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Coverage Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="date" stroke="#666" />
          <YAxis stroke="#666" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
            labelStyle={{ color: '#333' }}
          />
          <Legend verticalAlign="top" height={36} />
          <Line type="monotone" dataKey="coverage" stroke="#8884d8" name="Coverage ($)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CoverageOverTimeChart;