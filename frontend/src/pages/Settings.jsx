import { useEffect, useState } from 'react'
import { authApi } from '../api/auth'
import { tasksApi } from '../api/tasks'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { useAuthStore } from '../store/authStore'

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
      <h2 className="text-base font-semibold text-gray-800">{title}</h2>
      {children}
    </div>
  )
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" {...props} />
    </div>
  )
}

export default function Settings() {
  const { user, setUser } = useAuthStore()

  // Profile
  const [name, setName]     = useState(user?.name || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)

  // Password
  const [pwForm, setPwForm]     = useState({ old_password: '', new_password: '' })
  const [pwLoading, setPwLoad]  = useState(false)
  const [pwMsg, setPwMsg]       = useState('')

  // API Keys
  const [keys, setKeys]         = useState([])
  const [keyModal, setKeyModal] = useState(false)
  const [keyName, setKeyName]   = useState('')
  const [newKey, setNewKey]     = useState(null)

  // Webhooks
  const [webhooks, setWebhooks]   = useState([])
  const [whModal, setWhModal]     = useState(false)
  const [whForm, setWhForm]       = useState({ url: '', events: ['task.completed'] })

  useEffect(() => {
    authApi.listKeys().then(r => setKeys(r.data))
    tasksApi.listWebhooks().then(r => setWebhooks(r.data))
  }, [])

  const saveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    const { data } = await authApi.updateMe({ name })
    setUser(data)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setSaving(false)
  }

  const changePassword = async (e) => {
    e.preventDefault()
    setPwLoad(true)
    setPwMsg('')
    try {
      await authApi.changePassword(pwForm)
      setPwMsg('Password updated!')
      setPwForm({ old_password: '', new_password: '' })
    } catch {
      setPwMsg('Failed. Check your current password.')
    }
    setPwLoad(false)
  }

  const createKey = async () => {
    const { data } = await authApi.createKey(keyName)
    setKeys(k => [...k, data])
    setNewKey(data.key)
    setKeyName('')
  }

  const deleteKey = async (id) => {
    await authApi.deleteKey(id)
    setKeys(k => k.filter(x => x.id !== id))
  }

  const createWebhook = async () => {
    const { data } = await tasksApi.createWebhook(whForm)
    setWebhooks(w => [...w, data])
    setWhModal(false)
    setWhForm({ url: '', events: ['task.completed'] })
  }

  const deleteWebhook = async (id) => {
    await tasksApi.deleteWebhook(id)
    setWebhooks(w => w.filter(x => x.id !== id))
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile */}
      <Section title="Profile">
        <form onSubmit={saveProfile} className="space-y-4">
          <Input label="Name" value={name} onChange={e => setName(e.target.value)} />
          <Input label="Email" value={user?.email} readOnly className="bg-gray-50 cursor-not-allowed" />
          <Button type="submit" loading={saving}>{saved ? 'Saved!' : 'Save'}</Button>
        </form>
      </Section>

      {/* Password */}
      <Section title="Change Password">
        <form onSubmit={changePassword} className="space-y-4">
          <Input label="Current password" type="password" value={pwForm.old_password}
            onChange={e => setPwForm(f => ({ ...f, old_password: e.target.value }))} />
          <Input label="New password" type="password" value={pwForm.new_password}
            onChange={e => setPwForm(f => ({ ...f, new_password: e.target.value }))} />
          {pwMsg && <p className="text-sm text-blue-600">{pwMsg}</p>}
          <Button type="submit" loading={pwLoading}>Update Password</Button>
        </form>
      </Section>

      {/* API Keys */}
      <Section title="API Keys">
        <div className="space-y-2">
          {keys.map(k => (
            <div key={k.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2.5">
              <div>
                <p className="text-sm font-medium text-gray-800">{k.name}</p>
                <p className="text-xs text-gray-400 font-mono">{k.key_prefix}••••••••</p>
              </div>
              <button onClick={() => deleteKey(k.id)} className="text-xs text-red-500 hover:underline">delete</button>
            </div>
          ))}
        </div>
        <Button variant="secondary" onClick={() => setKeyModal(true)}>+ New API Key</Button>
      </Section>

      {/* Webhooks */}
      <Section title="Webhooks">
        <div className="space-y-2">
          {webhooks.map(wh => (
            <div key={wh.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2.5">
              <div>
                <p className="text-sm font-medium text-gray-800 truncate max-w-xs">{wh.url}</p>
                <p className="text-xs text-gray-400">{wh.events?.join(', ')}</p>
              </div>
              <button onClick={() => deleteWebhook(wh.id)} className="text-xs text-red-500 hover:underline">delete</button>
            </div>
          ))}
        </div>
        <Button variant="secondary" onClick={() => setWhModal(true)}>+ Add Webhook</Button>
      </Section>

      {/* API Key Modal */}
      <Modal isOpen={keyModal} onClose={() => { setKeyModal(false); setNewKey(null) }} title="Create API Key">
        {newKey ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Copy your key — it won't be shown again.</p>
            <pre className="bg-gray-900 text-green-400 rounded-lg p-3 text-xs font-mono break-all">{newKey}</pre>
            <Button className="w-full" onClick={() => { setKeyModal(false); setNewKey(null) }}>Done</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Input label="Key name" placeholder="e.g. production" value={keyName} onChange={e => setKeyName(e.target.value)} />
            <Button className="w-full" onClick={createKey} disabled={!keyName}>Generate</Button>
          </div>
        )}
      </Modal>

      {/* Webhook Modal */}
      <Modal isOpen={whModal} onClose={() => setWhModal(false)} title="Add Webhook">
        <div className="space-y-4">
          <Input label="URL" type="url" placeholder="https://your-server.com/webhook"
            value={whForm.url} onChange={e => setWhForm(f => ({ ...f, url: e.target.value }))} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Events</label>
            {['task.completed', 'task.failed'].map(ev => (
              <label key={ev} className="flex items-center gap-2 text-sm mb-1">
                <input type="checkbox" checked={whForm.events.includes(ev)}
                  onChange={e => setWhForm(f => ({
                    ...f,
                    events: e.target.checked ? [...f.events, ev] : f.events.filter(x => x !== ev)
                  }))} />
                {ev}
              </label>
            ))}
          </div>
          <Button className="w-full" onClick={createWebhook} disabled={!whForm.url || !whForm.events.length}>
            Add Webhook
          </Button>
        </div>
      </Modal>
    </div>
  )
}
