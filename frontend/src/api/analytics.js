import client from './client'

export const analyticsApi = {
  summary: () => client.get('/analytics/summary/'),
  byType: () => client.get('/analytics/by-type/'),
  byDay: () => client.get('/analytics/by-day/'),
  performance: () => client.get('/analytics/performance/'),
}
