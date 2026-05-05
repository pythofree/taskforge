import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { tasksApi } from '../api/tasks'
import { PriorityBadge, StatusBadge } from '../components/tasks/TaskBadge'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import { useTasks } from '../hooks/useTasks'
import { formatDate } from '../utils/formatDate'

const STATUSES  = ['', 'pending', 'queued', 'running', 'success', 'failed', 'cancelled']
const TYPES     = ['', 'email', 'scraping', 'report', 'image', 'webhook']
const PRIORITIES = ['', 'low', 'normal', 'high', 'critical']

export default function Tasks() {
  const navigate = useNavigate()
  const { tasks, total, filters, setFilters, refetch } = useTasks()
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  const pageCount = Math.ceil(total / 20)

  const handleDelete = async (id, e) => {
    e.preventDefault()
    if (!confirm('Delete this task?')) return
    await tasksApi.delete(id)
    refetch()
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setFilters({ search })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">All Tasks <span className="text-gray-400 text-sm font-normal">({total})</span></h2>
        <Button onClick={() => navigate('/tasks/new')}>+ New Task</Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-blue-500 w-48" />
          <Button type="submit" variant="secondary">Search</Button>
        </form>
        {[
          { label: 'Status',   key: 'status',   options: STATUSES },
          { label: 'Type',     key: 'type',     options: TYPES },
          { label: 'Priority', key: 'priority', options: PRIORITIES },
        ].map(({ label, key, options }) => (
          <select key={key} value={filters[key]} onChange={e => setFilters({ [key]: e.target.value })}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-blue-500">
            <option value="">{label}</option>
            {options.filter(Boolean).map(o => <option key={o}>{o}</option>)}
          </select>
        ))}
        {(filters.status || filters.type || filters.priority || filters.search) && (
          <Button variant="ghost" onClick={() => { setSearch(''); setFilters({ status: '', type: '', priority: '', search: '' }) }}>
            Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Title', 'Type', 'Status', 'Priority', 'Created', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tasks.map(task => (
              <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <Link to={`/tasks/${task.id}`} className="font-medium text-gray-800 hover:text-blue-600">{task.title}</Link>
                  {task.description && <p className="text-xs text-gray-400 truncate max-w-xs">{task.description}</p>}
                </td>
                <td className="px-4 py-3 text-gray-500">{task.type}</td>
                <td className="px-4 py-3"><StatusBadge status={task.status} /></td>
                <td className="px-4 py-3"><PriorityBadge priority={task.priority} /></td>
                <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(task.created_at)}</td>
                <td className="px-4 py-3">
                  <button onClick={(e) => handleDelete(task.id, e)}
                    className="text-gray-400 hover:text-red-500 transition-colors text-xs">delete</button>
                </td>
              </tr>
            ))}
            {!tasks.length && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">No tasks found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="secondary" disabled={filters.page <= 1}
            onClick={() => setFilters({ page: filters.page - 1 })}>← Prev</Button>
          <span className="text-sm text-gray-500">Page {filters.page} of {pageCount}</span>
          <Button variant="secondary" disabled={filters.page >= pageCount}
            onClick={() => setFilters({ page: filters.page + 1 })}>Next →</Button>
        </div>
      )}
    </div>
  )
}
