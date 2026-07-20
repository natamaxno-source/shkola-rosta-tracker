import { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { useParams, Link } from 'react-router-dom'
import { AuthContext } from '../App'
import { ArrowLeft, Send } from 'lucide-react'

export default function TaskDetail() {
  const { id } = useParams()
  const { user } = useContext(AuthContext)
  const [task, setTask] = useState(null)
  const [comments, setComments] = useState([])
  const [users, setUsers] = useState([])
  const [students, setStudents] = useState([])
  const [projects, setProjects] = useState([])
  const [newComment, setNewComment] = useState('')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    axios.get(`/api/tasks/${id}`, { headers }).then(res => { setTask(res.data); setForm(res.data) })
    axios.get(`/api/comments/${id}`, { headers }).then(res => setComments(res.data))
    axios.get('/api/users', { headers }).then(res => setUsers(res.data)).catch(() => {})
    axios.get('/api/students', { headers }).then(res => setStudents(res.data))
    axios.get('/api/projects', { headers }).then(res => setProjects(res.data))
  }, [id])

  const handleStatusChange = async (status) => {
    await axios.put(`/api/tasks/${id}`, { status }, { headers })
    setTask({ ...task, status })
  }

  const handleSave = async () => {
    await axios.put(`/api/tasks/${id}`, form, { headers })
    setTask({ ...task, ...form })
    setEditing(false)
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    const res = await axios.post(`/api/comments/${id}`, { text: newComment }, { headers })
    setComments([...comments, res.data])
    setNewComment('')
  }

  const statusColors = { new: 'bg-blue-100 text-blue-700', in_progress: 'bg-yellow-100 text-yellow-700', review: 'bg-purple-100 text-purple-700', done: 'bg-green-100 text-green-700' }
  const statusLabels = { new: 'Новая', in_progress: 'В работе', review: 'На проверке', done: 'Готово' }

  if (!task) return <div className="text-center py-8 text-text-secondary">Загрузка...</div>

  return (
    <div>
      <Link to="/tasks" className="flex items-center gap-2 text-text-secondary hover:text-text mb-4">
        <ArrowLeft size={18} /> К задачам
      </Link>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-text">{task.title}</h1>
              {user?.role === 'admin' && (
                <button onClick={() => setEditing(!editing)} className="text-sm text-accent hover:underline">
                  {editing ? 'Отмена' : 'Редактировать'}
                </button>
              )}
            </div>

            {editing ? (
              <div className="space-y-3">
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg" />
                <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg h-24" />
                <div className="flex gap-3">
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="px-4 py-2 border rounded-lg">
                    <option value="low">Низкий</option>
                    <option value="medium">Средний</option>
                    <option value="high">Высокий</option>
                  </select>
                  <input type="date" value={form.deadline || ''} onChange={e => setForm({ ...form, deadline: e.target.value })} className="px-4 py-2 border rounded-lg" />
                  <select value={form.assigned_to || ''} onChange={e => setForm({ ...form, assigned_to: e.target.value || null })} className="px-4 py-2 border rounded-lg">
                    <option value="">Не назначен</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div className="flex gap-3">
                  <select value={form.project_id || ''} onChange={e => setForm({ ...form, project_id: e.target.value || null })} className="px-4 py-2 border rounded-lg">
                    <option value="">Без проекта</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <select value={form.student_id || ''} onChange={e => setForm({ ...form, student_id: e.target.value || null })} className="px-4 py-2 border rounded-lg">
                    <option value="">Без ученика</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <button onClick={handleSave} className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-light">Сохранить</button>
              </div>
            ) : (
              <>
                <p className="text-text-secondary">{task.description || 'Без описания'}</p>
                <div className="flex items-center gap-4 mt-4 text-sm text-text-secondary">
                  {task.project_name && <span className="bg-gray-100 px-3 py-1 rounded-full">{task.project_name}</span>}
                  {task.student_name && <span className="bg-blue-50 px-3 py-1 rounded-full text-blue-600">{task.student_name}</span>}
                  {task.deadline && <span>Дедлайн: {task.deadline}</span>}
                </div>
              </>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold text-text mb-4">Комментарии ({comments.length})</h2>
            <div className="space-y-3">
              {comments.map(c => (
                <div key={c.id} className="p-3 bg-bg rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-text">{c.user_name}</span>
                    <span className="text-xs text-text-secondary">{c.created_at?.split('T')[0]}</span>
                  </div>
                  <p className="text-sm text-text mt-1">{c.text}</p>
                </div>
              ))}
            </div>
            <form onSubmit={handleAddComment} className="flex gap-2 mt-4">
              <input value={newComment} onChange={e => setNewComment(e.target.value)}
                placeholder="Добавить комментарий..."
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-accent" />
              <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-light">
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-medium text-text-secondary mb-3">Статус</h3>
            <div className="space-y-2">
              {Object.entries(statusLabels).map(([key, label]) => (
                <button key={key} onClick={() => handleStatusChange(key)}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${task.status === key ? `${statusColors[key]} font-bold` : 'hover:bg-gray-50 text-text-secondary'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-medium text-text-secondary mb-2">Приоритет</h3>
            <p className="text-text font-medium">{task.priority === 'low' ? 'Низкий' : task.priority === 'medium' ? 'Средний' : 'Высокий'}</p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-medium text-text-secondary mb-2">Исполнитель</h3>
            <p className="text-text font-medium">{task.assignee_name || 'Не назначен'}</p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-medium text-text-secondary mb-2">Создал</h3>
            <p className="text-text font-medium">{task.creator_name}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
