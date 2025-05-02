import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

interface PolicyDistributionByRegionChartProps {
  policies: Array<{
    id: string
    number: string
    type: string
    coverage: number
    start_date: string
    end_date: string
    status: string
    policyholder_id: string
  }>
  policyholders: Array<{
    id: string
    name: string
    contact: string
    user_id: string
    region: string
  }>
}

const PolicyDistributionByRegionChart = ({
  policies,
  policyholders,
}: PolicyDistributionByRegionChartProps) => {
  // Get all unique regions from policyholders
  const allRegions = Array.from(new Set(policyholders.map((ph) => ph.region)))

  // Map policies to regions via policyholders
  const data = policies.reduce(
    (acc: { region: string; count: number }[], policy) => {
      const policyholder = policyholders.find(
        (ph) => ph.id === policy.policyholder_id
      )
      if (!policyholder) {
        return acc
      }

      let entry = acc.find((item) => item.region === policyholder.region)
      if (!entry) {
        entry = { region: policyholder.region, count: 0 }
        acc.push(entry)
      }
      entry.count += 1
      return acc
    },
    []
  )

  // Ensure all regions are included, even those with zero policies
  const finalData = allRegions.map((region) => {
    const entry = data.find((item) => item.region === region)
    return { region, count: entry ? entry.count : 0 }
  })

  // Define colors for each region
  const COLORS: { [key: string]: string } = {
    North: '#4a90e2', // Blue
    South: '#82ca9d', // Green
    West: '#ff6b6b', // Red
    East: '#ffd700', // Yellow
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">
        Policy Distribution by Region
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={finalData}
            dataKey="count"
            nameKey="region"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {finalData.map((entry) => (
              <Cell
                key={entry.region} // Use region as key instead of index
                fill={COLORS[entry.region] || '#8884d8'}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
            labelStyle={{ color: '#333' }}
          />
          <Legend verticalAlign="top" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default PolicyDistributionByRegionChart
