import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, Users, Trash2 } from 'lucide-react'

export default function Team() {
  const [users, setUsers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const load = () => {
    const token = localStorage.getItem('token')
    axios.get('/api/users', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setUsers(res.data))
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    try {
      await axios.post('/api/users', { name, email, password, role: 'employee' }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setShowModal(false)
      setName('')
      setEmail('')
      setPassword('')
      load()
    } catch (err) {
      alert(err.response?.data?.error || 'Ошибка')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Удалить сотрудника?')) return
    const token = localStorage.getItem('token')
    await axios.delete(`/api/users/${id}`, { headers: { Authorization: `Bearer ${token}` } })
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">Команда</h1>
        <button onClick={() => setShowModal(true)} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-light">
          <Plus size={18} /> Добавить сотрудника
        </button>
      </div>

      <div className="space-y-3">
        {users.map(u => (
          <div key={u.id} className="bg-white rounded-xl p-5 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Users className="text-primary" size={20} />
              </div>
              <div>
                <h3 className="font-medium text-text">{u.name}</h3>
                <p className="text-sm text-text-secondary">{u.email}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-text-secondary'}`}>
                  {u.role === 'admin' ? 'Администратор' : 'Сотрудник'}
                </span>
              </div>
            </div>
            {u.role !== 'admin' && (
              <button onClick={() => handleDelete(u.id)} className="text-sm text-red-500 hover:underline flex items-center gap-1">
                <Trash2 size={14} /> Удалить
              </button>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-text mb-4">Добавить сотрудника</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <input type="text" placeholder="Имя" value={name} onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-accent" required />
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-accent" required />
              <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-accent" required />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 border border-gray-200 rounded-lg">Отмена</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-light">Добавить</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
