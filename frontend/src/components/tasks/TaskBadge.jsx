import Badge from '../ui/Badge'
import { PRIORITY_COLORS, STATUS_COLORS } from '../../utils/statusColors'

export function StatusBadge({ status }) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.pending
  return (
    <Badge className={`${colors.bg} ${colors.text}`}>
      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${colors.dot} inline-block`} />
      {status}
    </Badge>
  )
}

export function PriorityBadge({ priority }) {
  const colors = PRIORITY_COLORS[priority] || PRIORITY_COLORS.normal
  return (
    <Badge className={`${colors.bg} ${colors.text}`}>
      {priority}
    </Badge>
  )
}
