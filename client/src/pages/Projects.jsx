import { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { AuthContext } from '../App'
import { Link } from 'react-router-dom'
import { Plus, FolderKanban } from 'lucide-react'

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const { user } = useContext(AuthContext)

  const loadProjects = () => {
    const token = localStorage.getItem('token')
    axios.get('/api/projects', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setProjects(res.data))
      .catch(console.error)
  }

  useEffect(() => { loadProjects() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    await axios.post('/api/projects', { name, description }, { headers: { Authorization: `Bearer ${token}` } })
    setShowModal(false)
    setName('')
    setDescription('')
    loadProjects()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">Проекты</h1>
        {user?.role === 'admin' && (
          <button onClick={() => setShowModal(true)} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-light transition-colors">
            <Plus size={18} /> Новый проект
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {projects.map(p => (
          <Link key={p.id} to={`/projects/${p.id}`} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <FolderKanban className="text-primary mb-3" size={32} />
            <h3 className="font-semibold text-text text-lg">{p.name}</h3>
            <p className="text-text-secondary text-sm mt-1 line-clamp-2">{p.description || 'Без описания'}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-text-secondary">{p.task_count} задач</span>
              <span className="text-xs text-text-secondary">{p.creator_name}</span>
            </div>
          </Link>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12 text-text-secondary">
          <FolderKanban size={48} className="mx-auto mb-4 text-gray-300" />
          <p>Пока нет проектов</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-text mb-4">Новый проект</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                type="text" placeholder="Название проекта" value={name} onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-accent"
                required
              />
              <textarea
                placeholder="Описание (необязательно)" value={description} onChange={e => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-accent h-24"
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-text-secondary hover:bg-gray-50">
                  Отмена
                </button>
                <button type="submit" className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-light">
                  Создать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
