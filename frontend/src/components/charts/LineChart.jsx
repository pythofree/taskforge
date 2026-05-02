import { CartesianGrid, Line, LineChart as ReLineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export default function LineChart({ data, lines = [], xKey = 'day' }) {
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
  return (
    <ResponsiveContainer width="100%" height={250}>
      <ReLineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        {lines.map((key, i) => (
          <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={false} />
        ))}
      </ReLineChart>
    </ResponsiveContainer>
  )
}
