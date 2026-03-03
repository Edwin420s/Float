import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/treasury', label: 'Treasury', icon: '💰' },
  { to: '/transactions', label: 'Transactions', icon: '↗️' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
  { to: '/demo', label: 'Demo', icon: '🎯' },
]

export default function Sidebar() {
  return (
    <aside className="bg-surface w-64 p-6 space-y-4 hidden md:block">
      <nav className="space-y-2">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block p-3 rounded-lg transition ${isActive ? 'bg-secondary text-primary font-semibold' : 'hover:bg-primary'}`
            }
          >
            <span className="mr-3">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}