import { useAuth } from '../../hooks/useAuth'
import Button from '../ui/Button'

export default function Navbar({ title }) {
  const { logout } = useAuth()
  return (
    <header className="h-14 shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
      <Button variant="ghost" onClick={logout}>Sign out</Button>
    </header>
  )
}
