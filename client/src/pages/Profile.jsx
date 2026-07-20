import { useState, useContext } from 'react'
import axios from 'axios'
import { AuthContext } from '../App'

export default function Profile() {
  const { user, login, logout } = useContext(AuthContext)
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  const handleProfile = async (e) => {
    e.preventDefault()
    setMessage('')
    try {
      const res = await axios.put('/api/auth/profile', { name, email }, { headers })
      setMessage('Профиль обновлён')
      login(token, res.data)
    } catch (err) {
      setMessage(err.response?.data?.error || 'Ошибка')
    }
  }

  const handlePassword = async (e) => {
    e.preventDefault()
    setMessage('')
    try {
      await axios.put('/api/auth/password', { oldPassword, newPassword }, { headers })
      setMessage('Пароль обновлён')
      setOldPassword('')
      setNewPassword('')
    } catch (err) {
      setMessage(err.response?.data?.error || 'Ошибка')
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-text mb-6">Настройки профиля</h1>

      {message && (
        <div className={`p-3 rounded-lg text-sm mb-4 ${message.includes('ошиб') || message.includes('Ошибка') ? 'bg-red-50 text-error' : 'bg-green-50 text-success'}`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-xl p-6 shadow-sm mb-4">
        <h2 className="font-semibold text-text mb-4">Личные данные</h2>
        <form onSubmit={handleProfile} className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">Имя</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-accent" />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-accent" />
          </div>
          <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-light">
            Сохранить
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold text-text mb-4">Смена пароля</h2>
        <form onSubmit={handlePassword} className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">Текущий пароль</label>
            <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-accent" required />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Новый пароль</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-accent" required />
          </div>
          <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-light">
            Обновить пароль
          </button>
        </form>
      </div>
    </div>
  )
}
