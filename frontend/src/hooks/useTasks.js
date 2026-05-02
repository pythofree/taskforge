import { useCallback, useEffect } from 'react'
import { tasksApi } from '../api/tasks'
import { useTaskStore } from '../store/taskStore'

export function useTasks() {
  const { tasks, total, filters, setTasks, setFilters } = useTaskStore()

  const fetchTasks = useCallback(async () => {
    const params = {}
    if (filters.status) params.status = filters.status
    if (filters.type) params.type = filters.type
    if (filters.priority) params.priority = filters.priority
    if (filters.search) params.search = filters.search
    params.page = filters.page

    const { data } = await tasksApi.list(params)
    setTasks(data.results, data.count)
  }, [filters, setTasks])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  return { tasks, total, filters, setFilters, refetch: fetchTasks }
}

export function useTask(id) {
  const { currentTask, logs, setCurrentTask, setLogs } = useTaskStore()

  const fetchTask = useCallback(async () => {
    const [taskRes, logsRes] = await Promise.all([
      tasksApi.get(id),
      tasksApi.logs(id),
    ])
    setCurrentTask(taskRes.data)
    setLogs(logsRes.data)
  }, [id, setCurrentTask, setLogs])

  useEffect(() => {
    if (id) fetchTask()
    return () => setCurrentTask(null)
  }, [id])

  return { task: currentTask, logs, refetch: fetchTask }
}
