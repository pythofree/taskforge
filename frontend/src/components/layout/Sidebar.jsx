import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const NAV = [
  { to: '/',          label: 'Dashboard',  icon: '▦' },
  { to: '/tasks',     label: 'Tasks',      icon: '✓' },
  { to: '/analytics', label: 'Analytics',  icon: '▲' },
  { to: '/settings',  label: 'Settings',   icon: '⚙' },
]

export default function Sidebar() {
  const user = useAuthStore((s) => s.user)

  const links = user?.role === 'admin'
    ? [...NAV, { to: '/admin', label: 'Admin', icon: '★' }]
    : NAV

  return (
    <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col">
      <div className="px-6 py-5 border-b border-gray-100">
        <span className="text-xl font-bold text-blue-600">TaskForge</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            <span>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
        <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
      </div>
    </aside>
  )
}
