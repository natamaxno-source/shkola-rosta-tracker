import { useState, useEffect } from 'react'
import axios from 'axios'
import { useParams, Link } from 'react-router-dom'
import { Plus, ArrowLeft } from 'lucide-react'

export default function ProjectDetail() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [priority, setPriority] = useState('medium')

  useEffect(() => {
    const token = localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}` }
    axios.get(`/api/projects/${id}`, { headers }).then(res => setProject(res.data))
    axios.get(`/api/tasks?project_id=${id}`, { headers }).then(res => setTasks(res.data))
  }, [id])

  const handleCreate = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    await axios.post('/api/tasks', { title, description, deadline, priority, project_id: id }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    setShowModal(false)
    setTitle('')
    setDescription('')
    setDeadline('')
    setPriority('medium')
    const token2 = localStorage.getItem('token')
    axios.get(`/api/tasks?project_id=${id}`, { headers: { Authorization: `Bearer ${token2}` } })
      .then(res => setTasks(res.data))
  }

  const statusColors = { new: 'bg-blue-100 text-blue-700', in_progress: 'bg-yellow-100 text-yellow-700', review: 'bg-purple-100 text-purple-700', done: 'bg-green-100 text-green-700' }
  const statusLabels = { new: 'Новая', in_progress: 'В работе', review: 'На проверке', done: 'Готово' }
  const priorityColors = { low: 'text-green-600', medium: 'text-yellow-600', high: 'text-red-600' }
  const priorityLabels = { low: 'Низкий', medium: 'Средний', high: 'Высокий' }

  if (!project) return <div className="text-center py-8 text-text-secondary">Загрузка...</div>

  return (
    <div>
      <Link to="/projects" className="flex items-center gap-2 text-text-secondary hover:text-text mb-4">
        <ArrowLeft size={18} /> К проектам
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">{project.name}</h1>
          <p className="text-text-secondary mt-1">{project.description || 'Без описания'}</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-light">
          <Plus size={18} /> Новая задача
        </button>
      </div>

      <div className="space-y-3">
        {tasks.map(t => (
          <Link key={t.id} to={`/tasks/${t.id}`} className="block bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-text">{t.title}</h3>
                <p className="text-sm text-text-secondary mt-1">{t.description?.substring(0, 100)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium ${priorityColors[t.priority]}`}>{priorityLabels[t.priority]}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[t.status]}`}>{statusLabels[t.status]}</span>
                {t.assignee_name && <span className="text-xs text-text-secondary">{t.assignee_name}</span>}
                {t.deadline && <span className="text-xs text-text-secondary">до {t.deadline}</span>}
              </div>
            </div>
          </Link>
        ))}
        {tasks.length === 0 && <div className="text-center py-8 text-text-secondary">Нет задач в проекте</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-text mb-4">Новая задача</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <input type="text" placeholder="Название задачи" value={title} onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-accent" required />
              <textarea placeholder="Описание" value={description} onChange={e => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-accent h-20" />
              <div className="flex gap-3">
                <select value={priority} onChange={e => setPriority(e.target.value)} className="flex-1 px-4 py-3 border border-gray-200 rounded-lg">
                  <option value="low">Низкий приоритет</option>
                  <option value="medium">Средний приоритет</option>
                  <option value="high">Высокий приоритет</option>
                </select>
                <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-lg" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 border border-gray-200 rounded-lg">Отмена</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-light">Создать</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
