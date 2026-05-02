export const STATUS_COLORS = {
  pending:   { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-400' },
  queued:    { bg: 'bg-blue-100',   text: 'text-blue-800',   dot: 'bg-blue-400'   },
  running:   { bg: 'bg-indigo-100', text: 'text-indigo-800', dot: 'bg-indigo-500' },
  success:   { bg: 'bg-green-100',  text: 'text-green-800',  dot: 'bg-green-500'  },
  failed:    { bg: 'bg-red-100',    text: 'text-red-800',    dot: 'bg-red-500'    },
  cancelled: { bg: 'bg-gray-100',   text: 'text-gray-600',   dot: 'bg-gray-400'   },
}

export const PRIORITY_COLORS = {
  low:      { bg: 'bg-gray-100',   text: 'text-gray-600'   },
  normal:   { bg: 'bg-blue-100',   text: 'text-blue-700'   },
  high:     { bg: 'bg-orange-100', text: 'text-orange-700' },
  critical: { bg: 'bg-red-100',    text: 'text-red-700'    },
}

export const TYPE_COLORS = {
  email:    'text-purple-600',
  scraping: 'text-cyan-600',
  report:   'text-green-600',
  image:    'text-pink-600',
  webhook:  'text-orange-600',
}
