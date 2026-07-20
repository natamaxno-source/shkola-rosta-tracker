import { Outlet, Link, useLocation } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '../App'
import { LayoutDashboard, FolderKanban, CheckSquare, Users, GraduationCap, User, LogOut } from 'lucide-react'

export default function Layout() {
  const { user, logout } = useContext(AuthContext)
  const location = useLocation()

  const links = [
    { to: '/', icon: LayoutDashboard, label: 'Дашборд' },
    { to: '/projects', icon: FolderKanban, label: 'Проекты' },
    { to: '/tasks', icon: CheckSquare, label: 'Задачи' },
    { to: '/students', icon: GraduationCap, label: 'Ученики' },
  ]

  if (user?.role === 'admin') {
    links.push({ to: '/team', icon: Users, label: 'Команда' })
  }

  return (
    <div className="flex h-screen">
      <aside className="w-[260px] bg-primary text-white flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-bold">Школа Роста</h1>
          <p className="text-sm text-white/60 mt-1">Трекер задач</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {links.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === to
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link to="/profile" className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors">
            <User size={20} />
            <div className="text-left">
              <div className="text-sm font-medium">{user?.name}</div>
              <div className="text-xs text-white/50">{user?.role === 'admin' ? 'Администратор' : 'Сотрудник'}</div>
            </div>
          </Link>
          <button onClick={logout} className="flex items-center gap-3 px-4 py-2 mt-2 w-full rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition-colors">
            <LogOut size={18} />
            <span className="text-sm">Выйти</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-bg p-8">
        <Outlet />
      </main>
    </div>
  )
}
