import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { tasksApi } from '../api/tasks'
import TaskForm from '../components/tasks/TaskForm'

export default function CreateTask() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (data) => {
    setLoading(true)
    setError('')
    try {
      const res = await tasksApi.create(data)
      navigate(`/tasks/${res.data.id}`)
    } catch (err) {
      const detail = err.response?.data?.error
      setError(typeof detail === 'string' ? detail : JSON.stringify(detail))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">Create New Task</h2>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <TaskForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  )
}
