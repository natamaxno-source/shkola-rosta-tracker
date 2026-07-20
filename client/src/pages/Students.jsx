import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, GraduationCap } from 'lucide-react'

export default function Students() {
  const [students, setStudents] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [courses, setCourses] = useState('')

  const load = () => {
    const token = localStorage.getItem('token')
    axios.get('/api/students', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setStudents(res.data))
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    await axios.post('/api/students', { name, email, courses }, { headers: { Authorization: `Bearer ${token}` } })
    setShowModal(false)
    setName('')
    setEmail('')
    setCourses('')
    load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Удалить ученика?')) return
    const token = localStorage.getItem('token')
    await axios.delete(`/api/students/${id}`, { headers: { Authorization: `Bearer ${token}` } })
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">Ученики</h1>
        <button onClick={() => setShowModal(true)} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-light">
          <Plus size={18} /> Добавить ученика
        </button>
      </div>

      <div className="space-y-3">
        {students.map(s => (
          <div key={s.id} className="bg-white rounded-xl p-5 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <GraduationCap className="text-accent" size={20} />
              </div>
              <div>
                <h3 className="font-medium text-text">{s.name}</h3>
                <p className="text-sm text-text-secondary">{s.email}</p>
                {s.courses && <p className="text-xs text-text-secondary mt-1">{s.courses}</p>}
              </div>
            </div>
            <button onClick={() => handleDelete(s.id)} className="text-sm text-red-500 hover:underline">Удалить</button>
          </div>
        ))}
        {students.length === 0 && <div className="text-center py-12 text-text-secondary">Нет учеников</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-text mb-4">Добавить ученика</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <input type="text" placeholder="Имя" value={name} onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-accent" required />
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-accent" />
              <input type="text" placeholder="Курсы (через запятую)" value={courses} onChange={e => setCourses(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-accent" />
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
