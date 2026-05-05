import { useEffect, useState } from 'react'
import { analyticsApi } from '../api/analytics'
import BarChart from '../components/charts/BarChart'
import LineChart from '../components/charts/LineChart'
import Spinner from '../components/ui/Spinner'

export default function Analytics() {
  const [byDay, setByDay]         = useState([])
  const [byType, setByType]       = useState([])
  const [perf, setPerf]           = useState(null)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    Promise.all([analyticsApi.byDay(), analyticsApi.byType(), analyticsApi.performance()])
      .then(([d, t, p]) => {
        setByDay(d.data.map(r => ({ ...r, day: r.day?.slice(5) })))
        setByType(t.data)
        setPerf(p.data)
      }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Tasks per day (last 30 days)</h2>
        <LineChart data={byDay} lines={['total', 'success', 'failed']} xKey="day" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Breakdown by type</h2>
          <BarChart data={byType} bars={['total', 'success', 'failed']} xKey="type" />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Avg execution time (seconds)</h2>
          <BarChart data={perf?.avg_duration_by_type || []} bars={['avg_seconds']} xKey="type" />
        </div>
      </div>

      {!!perf?.top_errors?.length && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">Top Errors</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {perf.top_errors.map((e, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3">
                <p className="text-sm text-gray-700 truncate mr-4">{e.error_message}</p>
                <span className="shrink-0 text-sm font-semibold text-red-600">{e.count}×</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
