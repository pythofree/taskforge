import { useState } from 'react'
import Button from '../ui/Button'

const TASK_TYPES = ['email', 'scraping', 'report', 'image', 'webhook']
const PRIORITIES = ['low', 'normal', 'high', 'critical']

const PAYLOAD_FIELDS = {
  email:    [{ name: 'to', label: 'To', type: 'email' }, { name: 'subject', label: 'Subject' }, { name: 'body', label: 'Body', multiline: true }],
  scraping: [{ name: 'url', label: 'URL', type: 'url' }, { name: 'depth', label: 'Depth', type: 'number' }],
  report:   [{ name: 'data_type', label: 'Data Type' }, { name: 'filters', label: 'Filters (JSON)', multiline: true }],
  image:    [{ name: 'url', label: 'Image URL', type: 'url' }, { name: 'width', label: 'Width', type: 'number' }, { name: 'height', label: 'Height', type: 'number' }],
  webhook:  [{ name: 'url', label: 'URL', type: 'url' }, { name: 'method', label: 'Method' }, { name: 'payload', label: 'Payload (JSON)', multiline: true }],
}

export default function TaskForm({ onSubmit, loading }) {
  const [form, setForm] = useState({ title: '', description: '', type: 'scraping', priority: 'normal', scheduled_at: '' })
  const [payload, setPayload] = useState({})

  const fields = PAYLOAD_FIELDS[form.type] || []

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))
  const setP = (key, val) => setPayload((p) => ({ ...p, [key]: val }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const data = { ...form, payload }
    if (!form.scheduled_at) delete data.scheduled_at
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
        <input required value={form.title} onChange={(e) => set('title', e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
          <select value={form.type} onChange={(e) => { set('type', e.target.value); setPayload({}) }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 outline-none">
            {TASK_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select value={form.priority} onChange={(e) => set('priority', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 outline-none">
            {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div className="border-t pt-4">
        <p className="text-sm font-medium text-gray-700 mb-3">Payload</p>
        <div className="space-y-3">
          {fields.map((f) =>
            f.multiline ? (
              <div key={f.name}>
                <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
                <textarea rows={3} value={payload[f.name] || ''} onChange={(e) => setP(f.name, e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 outline-none font-mono" />
              </div>
            ) : (
              <div key={f.name}>
                <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
                <input type={f.type || 'text'} value={payload[f.name] || ''} onChange={(e) => setP(f.name, e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 outline-none" />
              </div>
            )
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Schedule (optional)</label>
        <input type="datetime-local" value={form.scheduled_at} onChange={(e) => set('scheduled_at', e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 outline-none" />
      </div>

      <Button type="submit" loading={loading} className="w-full">
        Create Task
      </Button>
    </form>
  )
}
