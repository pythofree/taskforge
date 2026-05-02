import { create } from 'zustand'

export const useTaskStore = create((set, get) => ({
  tasks: [],
  total: 0,
  currentTask: null,
  logs: [],
  filters: { status: '', type: '', priority: '', page: 1, search: '' },

  setTasks: (tasks, total) => set({ tasks, total }),
  setCurrentTask: (task) => set({ currentTask: task }),
  setLogs: (logs) => set({ logs }),
  appendLog: (log) => set((s) => ({ logs: [...s.logs, log] })),

  setFilters: (patch) =>
    set((s) => ({ filters: { ...s.filters, ...patch, page: 1 } })),

  updateTaskStatus: (taskId, status) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
      currentTask:
        s.currentTask?.id === taskId
          ? { ...s.currentTask, status }
          : s.currentTask,
    })),
}))
