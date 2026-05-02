import client from './client'

export const authApi = {
  register: (data) => client.post('/auth/register/', data),
  login: (data) => client.post('/auth/login/', data),
  logout: () => client.post('/auth/logout/'),
  refresh: () => client.post('/auth/refresh/'),
  me: () => client.get('/auth/me/'),
  updateMe: (data) => client.patch('/auth/me/', data),
  changePassword: (data) => client.patch('/auth/me/', data),

  listKeys: () => client.get('/keys/'),
  createKey: (name) => client.post('/keys/', { name }),
  deleteKey: (id) => client.delete(`/keys/${id}/`),
}
