import { Link, useLocation } from 'react-router-dom'
import type { Content } from '../../types/content'
import StatusBadge from '../../components/StatusBadge'
import { useContent } from '../content/useContent'
import { formatDate, isOverdue } from '../../utils/date'
import './ContentRow.css'

export default function ContentRow({ content }: { content: Content }) {
  const here = useLocation()
  const { updateContent } = useContent()
  const from = here.pathname + here.search
  const overdue = content.status !== 'published' && isOverdue(content.targetDate)
  const tags = [content.pillar, ...content.platforms].filter(Boolean)
  const hot = !!content.hot

  function toggleHot() {
    updateContent(content.id, { hot: !hot })
  }

  // Ang button ay kapatid ng Link (hindi nasa loob nito), para valid at hindi nagbubukas ng editor kapag pinindot
  return (
    <div className="row-wrap">
      <Link to={`/editor/${content.id}`} state={{ from }} className="row">
        <div className="row-status">
          <StatusBadge status={content.status} />
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

      <button
        type="button"
        className={hot ? 'hot-btn is-hot' : 'hot-btn'}
        aria-pressed={hot}
        aria-label={hot ? 'Remove hot mark' : 'Mark as hot content'}
        title={hot ? 'Hot content (click to unmark)' : 'Mark as hot content'}
        onClick={toggleHot}
      >
        🔥
      </button>
    </div>
  )
}