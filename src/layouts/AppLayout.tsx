import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'
import { useContent } from '../features/content/useContent'
import LocalDataBanner from '../features/content/LocalDataBanner'
import Splash from '../components/Splash'
import './AppLayout.css'

const NAV = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/library', label: 'Library', end: false },
  { to: '/board', label: 'Board', end: false },
  { to: '/calendar', label: 'Calendar', end: false },
  { to: '/data', label: 'Import & backup', end: false },
]

export default function AppLayout() {
  const { user, signOut } = useAuth()
  const { loading, loadError, writeError, dismissWriteError, pending } = useContent()

  const initial = (user?.displayName ?? user?.email ?? '?').charAt(0).toUpperCase()

  return (
    <div className="shell">
      <header className="masthead">
        <div className="masthead-inner">
          <NavLink to="/" className="wordmark">
            Brewboard
          </NavLink>

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

          <div className="masthead-right">
            <span className="sync" aria-live="polite">
              {pending ? 'Saving…' : 'Synced'}
            </span>
            <NavLink to="/editor" className="btn btn-primary btn-small">
              New content
            </NavLink>
            <div className="account">
              {user?.photoURL ? (
                <img
                  className="avatar"
                  src={user.photoURL}
                  alt=""
                  referrerPolicy="no-referrer"
                  title={user.email ?? undefined}
                />
              ) : (
                <span className="avatar avatar-fallback" title={user?.email ?? undefined}>
                  {initial}
                </span>
              )}
              <button type="button" className="link-btn" onClick={() => signOut()}>
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="main">
        <LocalDataBanner />

        {writeError && (
          <div className="banner banner-error" role="alert">
            <span>Couldn&apos;t save your last change. {writeError}</span>
            <button type="button" className="btn btn-small" onClick={dismissWriteError}>
              Dismiss
            </button>
          </div>
        )}

        {loadError ? (
          <div className="state">
            <h1>Couldn&apos;t load your content</h1>
            <p>{loadError}</p>
            <button type="button" className="btn" onClick={() => signOut()}>
              Sign out
            </button>
          </div>
        ) : loading ? (
          <Splash />
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  )
}
