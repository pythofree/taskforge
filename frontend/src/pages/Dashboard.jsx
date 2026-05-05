import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { analyticsApi } from '../api/analytics'
import { tasksApi } from '../api/tasks'
import BarChart from '../components/charts/BarChart'
import LineChart from '../components/charts/LineChart'
import PieChart from '../components/charts/PieChart'
import { StatusBadge } from '../components/tasks/TaskBadge'
import Spinner from '../components/ui/Spinner'
import { formatDate } from '../utils/formatDate'

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${color}`}>{value ?? '—'}</p>
    </div>
  )
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [byDay, setByDay] = useState([])
  const [byType, setByType] = useState([])
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      analyticsApi.summary(),
      analyticsApi.byDay(),
      analyticsApi.byType(),
      tasksApi.list({ page_size: 5 }),
    ]).then(([s, d, t, r]) => {
      setSummary(s.data)
      setByDay(d.data.map(row => ({ ...row, day: row.day?.slice(5) })))
      setByType(t.data)
      setRecent(r.data.results)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Tasks" value={summary?.total}   color="text-gray-900" />
        <StatCard label="Success"     value={summary?.success} color="text-green-600" />
        <StatCard label="Failed"      value={summary?.failed}  color="text-red-600" />
        <StatCard label="In Queue"    value={summary?.queued}  color="text-blue-600" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Tasks per day (last 30 days)</h2>
          <LineChart data={byDay} lines={['total', 'success', 'failed']} xKey="day" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Distribution by type</h2>
          <PieChart data={byType} dataKey="total" nameKey="type" />
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Success vs Failed by type</h2>
        <BarChart data={byType} bars={['success', 'failed']} xKey="type" />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Recent Tasks</h2>
          <Link to="/tasks" className="text-sm text-blue-600 hover:underline">View all →</Link>
        </div>
        <div className="divide-y divide-gray-100">
          {recent.map(task => (
            <Link key={task.id} to={`/tasks/${task.id}`}
              className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
              <div>
                <p className="text-sm font-medium text-gray-800">{task.title}</p>
                <p className="text-xs text-gray-400">{task.type} · {formatDate(task.created_at)}</p>
              </div>
              <StatusBadge status={task.status} />
            </Link>
          ))}
          {!recent.length && <p className="px-5 py-8 text-sm text-gray-400 text-center">No tasks yet.</p>}
        </div>
      </div>
    </div>
  )
}
