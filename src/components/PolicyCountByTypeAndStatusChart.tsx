import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PolicyCountByTypeAndStatusChartProps {
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

const PolicyCountByTypeAndStatusChart = ({ policies }: PolicyCountByTypeAndStatusChartProps) => {
  // Aggregate data by type and status
  const data = policies.reduce((acc: { type: string; Active: number; Expired: number; Pending: number }[], policy) => {
    let entry = acc.find((item) => item.type === policy.type);
    if (!entry) {
      entry = { type: policy.type, Active: 0, Expired: 0, Pending: 0 };
      acc.push(entry);
    }
    if (policy.status === 'Active') entry.Active += 1;
    if (policy.status === 'Expired') entry.Expired += 1;
    if (policy.status === 'Pending') entry.Pending += 1;
    return acc;
  }, []);

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Policy Count by Type and Status</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="type" stroke="#666" />
          <YAxis stroke="#666" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
            labelStyle={{ color: '#333' }}
          />
          <Legend verticalAlign="top" height={36} />
          <Bar dataKey="Active" fill="#82ca9d" stackId="a" />
          <Bar dataKey="Expired" fill="#ff6b6b" stackId="a" />
          <Bar dataKey="Pending" fill="#ffd700" stackId="a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PolicyCountByTypeAndStatusChart;