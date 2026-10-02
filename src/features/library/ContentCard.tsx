import { Link, useLocation } from 'react-router-dom'
import type { Content } from '../../types/content'
import StatusBadge from '../../components/StatusBadge'
import { formatDate, isOverdue } from '../../utils/date'
import './ContentCard.css'

export default function ContentCard({ content }: { content: Content }) {
  const here = useLocation()
  const from = here.pathname + here.search
  const overdue = content.status !== 'published' && isOverdue(content.targetDate)

  return (
    <Link to={`/editor/${content.id}`} state={{ from }} className="content-card">
      <div className="content-card-top">
        <StatusBadge status={content.status} />
        {content.targetDate && (
          <span className={overdue ? 'meta overdue' : 'meta'}>
            {overdue ? 'Overdue: ' : ''}
            {formatDate(content.targetDate)}
          </span>
        )}
      </div>

      <h2 className="content-card-title">{content.title || 'Walang title'}</h2>

      {content.quote && <p className="content-card-quote">{content.quote}</p>}

      <div className="content-card-foot">
        {content.pillar && <span className="chip">{content.pillar}</span>}
        {content.platforms.map((p) => (
          <span key={p} className="chip chip-plain">
            {p}
          </span>
        ))}
      </div>
    </Link>
  )
}