import { NavLink, Outlet } from 'react-router-dom'
import { useContent } from '../features/content/useContent'
import './AppLayout.css'

const NAV = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/library', label: 'Library', end: false },
  { to: '/board', label: 'Board', end: false },
  { to: '/calendar', label: 'Calendar', end: false },
  { to: '/data', label: 'Import & backup', end: false },
]

export default function AppLayout() {
  const { saveFailed } = useContent()
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-name">Brewboard</span>
          <span className="brand-tag">Where ideas are brewed.</span>
        </div>

        <nav className="nav" aria-label="Main">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <NavLink to="/editor" className="btn btn-primary sidebar-cta">
          New content
        </NavLink>
      </aside>

      <main className="main">
        {saveFailed && (
          <div className="banner" role="alert">
            Hindi ma-save sa browser (baka puno na ang storage). Mag-download ng backup sa
            Import & backup bago mag-edit pa.
          </div>
        )}
        <Outlet />
      </main>
    </div>
  )
}
