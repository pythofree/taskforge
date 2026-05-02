import { useEffect, useRef } from 'react'
import { useTaskStore } from '../store/taskStore'

export function useWebSocket(taskId) {
  const ws = useRef(null)
  const { updateTaskStatus, appendLog, setCurrentTask } = useTaskStore()

  useEffect(() => {
    if (!taskId) return

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const url = `${protocol}//${window.location.host}/ws/tasks/${taskId}/`
    ws.current = new WebSocket(url)

    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      switch (msg.type) {
        case 'task.status_changed':
          updateTaskStatus(msg.task_id, msg.status)
          break
        case 'task.log_added':
          appendLog({ message: msg.message, level: msg.level, created_at: msg.timestamp })
          break
        case 'task.completed':
          setCurrentTask((prev) => prev ? { ...prev, status: 'success', result: msg.result } : prev)
          break
      }
    }

    ws.current.onerror = (e) => console.warn('WebSocket error:', e)

    return () => {
      ws.current?.close()
    }
  }, [taskId])
}
