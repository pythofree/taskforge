import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

const TITLES = {
  '/':          'Dashboard',
  '/tasks':     'Tasks',
  '/tasks/new': 'Create Task',
  '/analytics': 'Analytics',
  '/settings':  'Settings',
  '/admin':     'Admin Panel',
}

export default function Layout() {
  const { pathname } = useLocation()
  const title = TITLES[pathname] || 'TaskForge'

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
