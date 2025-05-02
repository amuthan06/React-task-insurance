import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface PolicyholdersBasedOnRegionChartProps {
  policyholders: Array<{
    id: string
    name: string
    contact: string
    user_id: string
    region: string
  }>
}

const PolicyholdersBasedOnRegionChart = ({
  policyholders,
}: PolicyholdersBasedOnRegionChartProps) => {
  // Aggregate data: count of policyholders by region
  const data = policyholders.reduce(
    (acc: { region: string; count: number }[], ph) => {
      let entry = acc.find((item) => item.region === ph.region)
      if (!entry) {
        entry = { region: ph.region, count: 0 }
        acc.push(entry)
      }
      entry.count += 1
      return acc
    },
    []
  )

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">
        Policyholders Based on Region
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="region" stroke="#666" />
          <YAxis stroke="#666" />
          <Tooltip
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
            labelStyle={{ color: '#333' }}
          />
          <Legend verticalAlign="top" height={36} />
          <Bar dataKey="count" fill="#4a90e2" name="Policyholders" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default PolicyholdersBasedOnRegionChart
