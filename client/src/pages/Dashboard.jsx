import { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { AuthContext } from '../App'
import { Link } from 'react-router-dom'
import { Clock, CheckCircle, AlertCircle, FileText } from 'lucide-react'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const { user } = useContext(AuthContext)

  useEffect(() => {
    const token = localStorage.getItem('token')
    axios.get('/api/dashboard', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setData(res.data))
      .catch(console.error)
  }, [])

  if (!data) return <div className="text-center py-8 text-text-secondary">Загрузка...</div>

  const statusColors = {
    new: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-yellow-100 text-yellow-700',
    review: 'bg-purple-100 text-purple-700',
    done: 'bg-green-100 text-green-700'
  }

  const statusLabels = {
    new: 'Новые', in_progress: 'В работе', review: 'На проверке', done: 'Готово'
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-text mb-6">
        Привет, {user?.name}! 👋
      </h1>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {Object.entries(data.stats).map(([status, count]) => (
          <div key={status} className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">{statusLabels[status]}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
                {count}
              </span>
            </div>
            <div className="text-3xl font-bold text-text mt-2">{count}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm text-center">
          <FileText className="mx-auto text-primary mb-2" size={24} />
          <div className="text-2xl font-bold text-text">{data.projectCount}</div>
          <div className="text-sm text-text-secondary">Проектов</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm text-center">
          <CheckCircle className="mx-auto text-accent mb-2" size={24} />
          <div className="text-2xl font-bold text-text">{data.studentCount}</div>
          <div className="text-sm text-text-secondary">Учеников</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm text-center">
          <AlertCircle className="mx-auto text-warning mb-2" size={24} />
          <div className="text-2xl font-bold text-text">{data.userCount}</div>
          <div className="text-sm text-text-secondary">Сотрудников</div>
        </div>
      </div>

      {data.upcomingTasks.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-text mb-4">Ближайшие дедлайны</h2>
          <div className="space-y-3">
            {data.upcomingTasks.map(task => (
              <Link key={task.id} to={`/tasks/${task.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-bg transition-colors">
                <div>
                  <div className="font-medium text-text">{task.title}</div>
                  <div className="text-sm text-text-secondary">{task.assignee_name}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-text-secondary" />
                  <span className="text-sm text-text-secondary">{task.deadline}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
                    {statusLabels[task.status]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
