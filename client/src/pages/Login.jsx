import { useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { AuthContext } from '../App'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useContext(AuthContext)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await axios.post('/api/auth/login', { email, password })
      login(res.data.token, res.data.user)
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка входа')
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary">Школа Роста</h1>
          <p className="text-text-secondary mt-2">Трекер задач</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 text-error p-3 rounded-lg text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-text mb-1">Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">Пароль</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              required
            />
          </div>

          <button type="submit" className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-light transition-colors">
            Войти
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-text-secondary">
          Нет аккаунта? <Link to="/register" className="text-accent hover:underline">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  )
}
