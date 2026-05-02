import axios from 'axios'

const client = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

let isRefreshing = false

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) return Promise.reject(error)

      original._retry = true
      isRefreshing = true

      try {
        await client.post('/auth/refresh/')
        isRefreshing = false
        return client(original)
      } catch {
        isRefreshing = false
        const { useAuthStore } = await import('../store/authStore')
        useAuthStore.getState().logout()
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)

export default client
