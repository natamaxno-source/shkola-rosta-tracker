import { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { AuthContext } from '../App'
import { Link } from 'react-router-dom'
import { Plus, Filter } from 'lucide-react'

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState('all')
  const { user } = useContext(AuthContext)

  useEffect(() => {
    const token = localStorage.getItem('token')
    axios.get('/api/tasks', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setTasks(res.data))
      .catch(console.error)
  }, [])

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter)

  const statusColors = { new: 'bg-blue-100 text-blue-700', in_progress: 'bg-yellow-100 text-yellow-700', review: 'bg-purple-100 text-purple-700', done: 'bg-green-100 text-green-700' }
  const statusLabels = { new: 'Новая', in_progress: 'В работе', review: 'На проверке', done: 'Готово' }
  const priorityColors = { low: 'text-green-600', medium: 'text-yellow-600', high: 'text-red-600' }
  const priorityLabels = { low: 'Низкий', medium: 'Средний', high: 'Высокий' }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">Задачи</h1>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-primary text-white' : 'bg-white text-text-secondary hover:bg-gray-100'}`}>
          Все ({tasks.length})
        </button>
        {Object.entries(statusLabels).map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === key ? 'bg-primary text-white' : 'bg-white text-text-secondary hover:bg-gray-100'}`}>
            {label} ({tasks.filter(t => t.status === key).length})
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(t => (
          <Link key={t.id} to={`/tasks/${t.id}`} className="block bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-text">{t.title}</h3>
                <p className="text-sm text-text-secondary mt-1">{t.description?.substring(0, 120)}</p>
                <div className="flex items-center gap-3 mt-2">
                  {t.project_name && <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-text-secondary">{t.project_name}</span>}
                  {t.student_name && <span className="text-xs bg-blue-50 px-2 py-1 rounded-full text-blue-600">{t.student_name}</span>}
                </div>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <span className={`text-xs font-medium ${priorityColors[t.priority]}`}>{priorityLabels[t.priority]}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[t.status]}`}>{statusLabels[t.status]}</span>
                {t.assignee_name && <span className="text-xs text-text-secondary bg-gray-50 px-2 py-1 rounded-full">{t.assignee_name}</span>}
                {t.deadline && <span className="text-xs text-text-secondary">до {t.deadline}</span>}
              </div>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && <div className="text-center py-12 text-text-secondary">Нет задач</div>}
      </div>
    </div>
  )
}
