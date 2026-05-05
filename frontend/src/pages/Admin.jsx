import { useEffect, useState } from 'react'
import client from '../api/client'
import { StatusBadge } from '../components/tasks/TaskBadge'
import Spinner from '../components/ui/Spinner'
import { formatDate } from '../utils/formatDate'

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm text-center">
      <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  )
}

export default function Admin() {
  const [stats, setStats]   = useState(null)
  const [users, setUsers]   = useState([])
  const [tasks, setTasks]   = useState([])
  const [loading, setLoad]  = useState(true)

  useEffect(() => {
    Promise.all([
      client.get('/admin/stats/'),
      client.get('/admin/users/'),
      client.get('/admin/tasks/'),
    ]).then(([s, u, t]) => {
      setStats(s.data)
      setUsers(u.data)
      setTasks(t.data.slice(0, 20))
    }).finally(() => setLoad(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Users"     value={stats?.total_users} />
        <StatCard label="Total"     value={stats?.total} />
        <StatCard label="Success"   value={stats?.success} />
        <StatCard label="Failed"    value={stats?.failed} />
        <StatCard label="Running"   value={stats?.running} />
        <StatCard label="Queued"    value={stats?.queued} />
      </div>

      {/* Users */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Users ({users.length})</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Email', 'Name', 'Role', 'Joined'].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-2.5">{u.email}</td>
                <td className="px-4 py-2.5 text-gray-500">{u.name || '—'}</td>
                <td className="px-4 py-2.5">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                  }`}>{u.role}</span>
                </td>
                <td className="px-4 py-2.5 text-gray-400 text-xs">{formatDate(u.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent Tasks */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Recent Tasks (last 20)</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Title', 'Type', 'Status', 'Created'].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tasks.map(t => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-4 py-2.5 font-medium">{t.title}</td>
                <td className="px-4 py-2.5 text-gray-500">{t.type}</td>
                <td className="px-4 py-2.5"><StatusBadge status={t.status} /></td>
                <td className="px-4 py-2.5 text-gray-400 text-xs">{formatDate(t.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Flower iframe */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Celery Monitor (Flower)</h2>
        </div>
        <iframe src="http://localhost:5555" title="Flower" className="w-full h-96 border-0" />
      </div>
    </div>
  )
}
