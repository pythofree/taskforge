import { useNavigate, useParams } from 'react-router-dom'
import { tasksApi } from '../api/tasks'
import { PriorityBadge, StatusBadge } from '../components/tasks/TaskBadge'
import TaskLogs from '../components/tasks/TaskLogs'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import { useTask } from '../hooks/useTasks'
import { useWebSocket } from '../hooks/useWebSocket'
import { formatDate, formatDuration } from '../utils/formatDate'

const RUNNING = ['pending', 'queued', 'running']

export default function TaskDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { task, logs, refetch } = useTask(id)
  useWebSocket(id)

  if (!task) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  const handleCancel = async () => {
    await tasksApi.cancel(id)
    refetch()
  }
  const handleRetry = async () => {
    await tasksApi.retry(id)
    refetch()
  }
  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return
    await tasksApi.delete(id)
    navigate('/tasks')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{task.title}</h2>
            {task.description && <p className="text-gray-500 mt-1 text-sm">{task.description}</p>}
          </div>
          <StatusBadge status={task.status} />
        </div>

        {RUNNING.includes(task.status) && (
          <div className="mt-4">
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full animate-pulse w-2/3" />
            </div>
          </div>
        )}

        <dl className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          {[
            { label: 'Type',      value: task.type },
            { label: 'Priority',  value: <PriorityBadge priority={task.priority} /> },
            { label: 'Retries',   value: `${task.retry_count} / ${task.max_retries}` },
            { label: 'Created',   value: formatDate(task.created_at) },
            { label: 'Started',   value: formatDate(task.started_at) },
            { label: 'Duration',  value: formatDuration(task.started_at, task.completed_at) },
          ].map(({ label, value }) => (
            <div key={label}>
              <dt className="text-xs text-gray-400 uppercase tracking-wide">{label}</dt>
              <dd className="mt-0.5 font-medium text-gray-800">{value}</dd>
            </div>
          ))}
        </dl>

        {task.error_message && (
          <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {task.error_message}
          </div>
        )}

        <div className="mt-5 flex gap-2">
          {task.status === 'pending' && (
            <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
          )}
          {task.status === 'failed' && (
            <Button onClick={handleRetry}>Retry</Button>
          )}
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </div>

      {/* Result */}
      {task.result && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Result</h3>
          <pre className="bg-gray-50 rounded-lg p-4 text-xs font-mono overflow-auto max-h-60">
            {JSON.stringify(task.result, null, 2)}
          </pre>
        </div>
      )}

      {/* Payload */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Payload</h3>
        <pre className="bg-gray-50 rounded-lg p-4 text-xs font-mono overflow-auto">
          {JSON.stringify(task.payload, null, 2)}
        </pre>
      </div>

      {/* Logs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Logs</h3>
        <TaskLogs logs={logs} />
      </div>
    </div>
  )
}
