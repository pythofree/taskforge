import { Link } from 'react-router-dom'
import { formatDate } from '../../utils/formatDate'
import { TYPE_COLORS } from '../../utils/statusColors'
import { PriorityBadge, StatusBadge } from './TaskBadge'

export default function TaskCard({ task }) {
  return (
    <Link
      to={`/tasks/${task.id}`}
      className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">{task.title}</p>
          <p className={`text-xs mt-0.5 font-medium ${TYPE_COLORS[task.type]}`}>{task.type}</p>
        </div>
        <StatusBadge status={task.status} />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <PriorityBadge priority={task.priority} />
        <span className="text-gray-400 text-xs ml-auto">{formatDate(task.created_at)}</span>
      </div>
    </Link>
  )
}
