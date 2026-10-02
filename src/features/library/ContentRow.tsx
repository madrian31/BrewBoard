import { Link, useLocation } from 'react-router-dom'
import type { Content } from '../../types/content'
import StatusBadge from '../../components/StatusBadge'
import { formatDate, isOverdue } from '../../utils/date'
import './ContentRow.css'

export default function ContentRow({ content }: { content: Content }) {
  const here = useLocation()
  const from = here.pathname + here.search
  const overdue = content.status !== 'published' && isOverdue(content.targetDate)
  const tags = [content.pillar, ...content.platforms].filter(Boolean)

  return (
    <Link to={`/editor/${content.id}`} state={{ from }} className="row">
      <div className="row-status">
        <StatusBadge status={content.status} />
        {content.hot && <span className="chip chip-hot">Hot</span>}
      </div>

      <div className="row-main">
        <h2 className="row-title">{content.title || 'Untitled'}</h2>
        {content.quote && <p className="row-quote">{content.quote}</p>}
        {tags.length > 0 && (
          <p className="row-tags">
            {tags.map((t) => (
              <span key={t} className="chip">
                {t}
              </span>
            ))}
          </p>
        )}
      </div>

      <div className={overdue ? 'row-date meta overdue' : 'row-date meta'}>
        {content.targetDate ? (overdue ? 'Overdue · ' : '') + formatDate(content.targetDate) : ''}
      </div>
    </Link>
  )
}