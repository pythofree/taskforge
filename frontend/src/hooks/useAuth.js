import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/auth'
import { useAuthStore } from '../store/authStore'

export function useAuth() {
  const { user, isAuthenticated, setUser, logout: clearUser } = useAuthStore()
  const navigate = useNavigate()

  const login = useCallback(async (credentials) => {
    const { data } = await authApi.login(credentials)
    setUser(data)
    navigate('/')
  }, [setUser, navigate])

  const register = useCallback(async (payload) => {
    const { data } = await authApi.register(payload)
    setUser(data)
    navigate('/')
  }, [setUser, navigate])

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => {})
    clearUser()
    navigate('/login')
  }, [clearUser, navigate])

  return { user, isAuthenticated, login, register, logout }
}
