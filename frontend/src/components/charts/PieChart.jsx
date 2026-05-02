import { Cell, Legend, Pie, PieChart as RePieChart, ResponsiveContainer, Tooltip } from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function PieChart({ data, dataKey = 'total', nameKey = 'type' }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <RePieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
          dataKey={dataKey} nameKey={nameKey} paddingAngle={3}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip />
        <Legend />
      </RePieChart>
    </ResponsiveContainer>
  )
}
