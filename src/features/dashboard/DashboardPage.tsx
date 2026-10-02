import { Link } from 'react-router-dom'
import { useContent } from '../content/useContent'
import { STATUSES } from '../../constants/workflow'
import StatusBadge from '../../components/StatusBadge'
import { formatDate, isOverdue } from '../../utils/date'
import './DashboardPage.css'

export default function DashboardPage() {
  const { items } = useContent()

  const nextUp = items
    .filter((c) => c.status !== 'published' && c.targetDate)
    .sort((a, b) => a.targetDate.localeCompare(b.targetDate))
    .slice(0, 6)

  const ready = items.filter((c) => c.status === 'script_ready').length

  return (
    <div className="page">
      <header className="page-header">
        <h1>Dashboard</h1>
        <p className="page-sub">
          {items.length === 0
            ? 'Nothing here yet. Start with a single idea.'
            : ready > 0
              ? `${ready} ${ready === 1 ? 'script is' : 'scripts are'} ready to record.`
              : 'Your whole pipeline, at a glance.'}
        </p>
      </header>

      <section aria-label="Pipeline" className="pipeline">
        {STATUSES.map((s) => {
          const count = items.filter((c) => c.status === s.id).length
          return (
            <Link key={s.id} to={`/library?status=${s.id}`} className="stage" data-status={s.id}>
              <span className="stage-count">{count}</span>
              <span className="stage-label">{s.label}</span>
            </Link>
          )
        })}
      </section>

      <section className="next-up" aria-label="Next up">
        <h2>Next up</h2>
        {nextUp.length === 0 ? (
          <div className="empty">
            <p>Add a target date to a piece of content and it will appear here.</p>
            <Link to="/editor" className="btn btn-primary">
              New content
            </Link>
          </div>
        ) : (
          <ul className="next-list">
            {nextUp.map((c) => {
              const overdue = isOverdue(c.targetDate)
              return (
                <li key={c.id}>
                  <Link to={`/editor/${c.id}`} className="next-item">
                    <span className={overdue ? 'next-date overdue' : 'next-date'}>
                      {overdue ? 'Overdue · ' : ''}
                      {formatDate(c.targetDate)}
                    </span>
                    <span className="next-title">{c.title}</span>
                    <StatusBadge status={c.status} />
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
