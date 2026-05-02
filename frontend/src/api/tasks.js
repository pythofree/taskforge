import client from './client'

export const tasksApi = {
  list: (params) => client.get('/tasks/', { params }),
  get: (id) => client.get(`/tasks/${id}/`),
  create: (data) => client.post('/tasks/', data),
  delete: (id) => client.delete(`/tasks/${id}/`),
  cancel: (id) => client.post(`/tasks/${id}/cancel/`),
  retry: (id) => client.post(`/tasks/${id}/retry/`),
  logs: (id) => client.get(`/tasks/${id}/logs/`),

  listWebhooks: () => client.get('/webhooks/'),
  createWebhook: (data) => client.post('/webhooks/', data),
  deleteWebhook: (id) => client.delete(`/webhooks/${id}/`),
}
