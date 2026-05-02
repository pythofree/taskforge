import { formatDate } from '../../utils/formatDate'

const LEVEL_COLORS = {
  info: 'text-gray-300',
  warning: 'text-yellow-400',
  error: 'text-red-400',
}

export default function TaskLogs({ logs }) {
  if (!logs?.length) {
    return <p className="text-gray-500 text-sm">No logs yet.</p>
  }

  return (
    <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm overflow-y-auto max-h-80">
      {logs.map((log, i) => (
        <div key={i} className="flex gap-3 py-0.5">
          <span className="text-gray-500 shrink-0">{formatDate(log.created_at)}</span>
          <span className={`uppercase text-xs font-bold w-14 shrink-0 ${LEVEL_COLORS[log.level]}`}>
            [{log.level}]
          </span>
          <span className="text-gray-100">{log.message}</span>
        </div>
      ))}
    </div>
  )
}
