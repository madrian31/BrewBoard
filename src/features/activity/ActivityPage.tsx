import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useContent } from '../content/useContent'
import { formatDate, toISO, todayISO } from '../../utils/date'
import './ActivityPage.css'

const PAGE_SIZE = 60

type EventType = 'added' | 'edited' | 'moved'

interface Row {
  id: string
  at: string
  type: EventType
  contentId: string
  title: string
  detail?: string
}

const TYPE_LABEL: Record<EventType, string> = {
  added: 'Added',
  edited: 'Edited',
  moved: 'Moved',
}

function dayKey(iso: string): string {
  const d = new Date(iso)
  return toISO(d.getFullYear(), d.getMonth(), d.getDate())
}

function dayTitle(key: string): string {
  if (key === todayISO()) return 'Today'
  const y = new Date()
  y.setDate(y.getDate() - 1)
  if (key === toISO(y.getFullYear(), y.getMonth(), y.getDate())) return 'Yesterday'
  return formatDate(key)
}

function timeOf(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export default function ActivityPage() {
  const { items } = useContent()
  const [filter, setFilter] = useState<'' | EventType>('')
  const [shown, setShown] = useState(PAGE_SIZE)

  // Binubuo mula sa mismong content: "Added" galing sa createdAt, ang iba galing sa log ng bawat isa
  const rows = useMemo(() => {
    const out: Row[] = []
    for (const c of items) {
      if (new Date(c.createdAt).getTime() > 0) {
        out.push({ id: `${c.id}:added`, at: c.createdAt, type: 'added', contentId: c.id, title: c.title })
      }
      const log = c.log ?? []
      log.forEach((e, i) => {
        out.push({ id: `${c.id}:log:${i}`, at: e.at, type: e.type, contentId: c.id, title: c.title, detail: e.detail })
      })
      // Lumang content na may binago pero wala pang log
      if (log.length === 0 && c.updatedAt !== c.createdAt) {
        out.push({ id: `${c.id}:updated`, at: c.updatedAt, type: 'edited', contentId: c.id, title: c.title, detail: 'Updated' })
      }
    }
    return out.sort((a, b) => b.at.localeCompare(a.at))
  }, [items])

  const filtered = useMemo(() => (filter ? rows.filter((r) => r.type === filter) : rows), [rows, filter])
  const visible = filtered.slice(0, shown)

  const groups = useMemo(() => {
    const map = new Map<string, Row[]>()
    for (const r of visible) {
      const k = dayKey(r.at)
      map.set(k, [...(map.get(k) ?? []), r])
    }
    return [...map.entries()]
  }, [visible])

  return (
    <div className="page activity-page">
      <header className="page-header">
        <h1>Activity</h1>
        <p className="page-sub">
          What was added, edited, or moved, newest first. Deleted pieces aren&apos;t listed.
        </p>
      </header>

      {rows.length === 0 ? (
        <div className="empty">
          <p>No activity yet. Add, edit, or move a piece and it will show up here.</p>
        </div>
      ) : (
        <>
          <div className="filters">
            <select
              className="input"
              aria-label="Filter activity"
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value as '' | EventType)
                setShown(PAGE_SIZE)
              }}
            >
              <option value="">All activity</option>
              <option value="added">Added</option>
              <option value="edited">Edited</option>
              <option value="moved">Moved</option>
            </select>
          </div>

          {groups.map(([key, list]) => (
            <section key={key} className="activity-day" aria-label={dayTitle(key)}>
              <h2>{dayTitle(key)}</h2>
              <ul className="activity-list">
                {list.map((r) => (
                  <li key={r.id} className="activity-row">
                    <span className="activity-time">{timeOf(r.at)}</span>
                    <span className="activity-badge">{TYPE_LABEL[r.type]}</span>
                    <div className="activity-main">
                      <Link
                        to={`/editor/${r.contentId}`}
                        state={{ from: '/activity' }}
                        className="activity-title"
                      >
                        {r.title || 'Untitled'}
                      </Link>
                      {r.detail && <span className="activity-detail">{r.detail}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {filtered.length > shown && (
            <button type="button" className="btn mt-5" onClick={() => setShown((n) => n + PAGE_SIZE)}>
              Show more
            </button>
          )}
        </>
      )}
    </div>
  )
}