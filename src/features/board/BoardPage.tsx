import { useMemo, useState, type DragEvent } from 'react'
import { Link } from 'react-router-dom'
import { useContent } from '../content/useContent'
import { STATUSES } from '../../constants/workflow'
import type { Content, ContentStatus } from '../../types/content'
import { formatDate, isOverdue } from '../../utils/date'
import './BoardPage.css'

/** Ilang card ang ipapakita sa bawat column bago mag-"Show more" */
const COLUMN_LIMIT = 30

export default function BoardPage() {
  const { items, moveStatus } = useContent()
  const [overColumn, setOverColumn] = useState<ContentStatus | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<ContentStatus>>(new Set())

  // Mga filter (kapareho ng sa Library)
  const [query, setQuery] = useState('')
  const [pillar, setPillar] = useState('')
  const [hotOnly, setHotOnly] = useState(false)

  const hotCount = items.filter((c) => c.hot).length
  const filtering = query.trim() !== '' || pillar !== '' || hotOnly

  const pillars = useMemo(
    () => [...new Set(items.map((c) => c.pillar).filter(Boolean))].sort(),
    [items],
  )

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items
      .filter((c) => !pillar || c.pillar === pillar)
      .filter((c) => !hotOnly || c.hot)
      .filter(
        (c) =>
          !q || [c.title, c.quote, c.script, c.notes].some((f) => f.toLowerCase().includes(q)),
      )
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }, [items, query, pillar, hotOnly])

  function toggleExpanded(status: ContentStatus) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(status)) next.delete(status)
      else next.add(status)
      return next
    })
  }

  function clearFilters() {
    setQuery('')
    setPillar('')
    setHotOnly(false)
  }

  function onDrop(e: DragEvent, status: ContentStatus) {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    if (id) moveStatus(id, status)
    setOverColumn(null)
    setDraggingId(null)
  }

  return (
    <div className="page board-page">
      <header className="page-header">
        <h1>Board</h1>
        <p className="page-sub">
          {filtering
            ? `${visible.length} of ${items.length} ${items.length === 1 ? 'piece' : 'pieces'} match your filters.`
            : 'Drag a card to its next stage.'}
        </p>
      </header>

      {items.length > 0 && (
        <div className="filters board-filters">
          <input
            type="search"
            className="input filter-search"
            placeholder="Search titles, quotes, scripts, notes"
            aria-label="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="input"
            aria-label="Filter by pillar"
            value={pillar}
            onChange={(e) => setPillar(e.target.value)}
          >
            <option value="">All pillars</option>
            {pillars.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <button
            type="button"
            className={hotOnly ? 'btn btn-primary' : 'btn'}
            aria-pressed={hotOnly}
            onClick={() => setHotOnly((v) => !v)}
          >
            🔥 Hot only ({hotCount})
          </button>
          {filtering && (
            <button type="button" className="btn" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>
      )}

      <div className="board">
        {STATUSES.map((s) => {
          const cards = visible.filter((c) => c.status === s.id)
          const isOpen = expanded.has(s.id)
          const shown = isOpen ? cards : cards.slice(0, COLUMN_LIMIT)
          const hidden = cards.length - shown.length

          return (
            <section
              key={s.id}
              className={overColumn === s.id ? 'column over' : 'column'}
              data-status={s.id}
              aria-label={s.label}
              onDragOver={(e) => {
                e.preventDefault()
                setOverColumn(s.id)
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setOverColumn(null)
              }}
              onDrop={(e) => onDrop(e, s.id)}
            >
              <header className="column-head">
                <h2>{s.label}</h2>
                <span className="count">{cards.length}</span>
              </header>

              <div className="column-body">
                {shown.map((c) => (
                  <BoardCard
                    key={c.id}
                    content={c}
                    dragging={draggingId === c.id}
                    onDragStart={() => setDraggingId(c.id)}
                    onDragEnd={() => {
                      setDraggingId(null)
                      setOverColumn(null)
                    }}
                    onMove={(status) => moveStatus(c.id, status)}
                  />
                ))}
                {cards.length === 0 && (
                  <p className="column-empty">{filtering ? 'No matches' : 'Empty'}</p>
                )}
                {cards.length > COLUMN_LIMIT && (
                  <button
                    type="button"
                    className="btn btn-small column-more"
                    aria-expanded={isOpen}
                    onClick={() => toggleExpanded(s.id)}
                  >
                    {isOpen ? 'Show less' : `Show ${hidden} more`}
                  </button>
                )}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

interface CardProps {
  content: Content
  dragging: boolean
  onDragStart: () => void
  onDragEnd: () => void
  onMove: (status: ContentStatus) => void
}

function BoardCard({ content, dragging, onDragStart, onDragEnd, onMove }: CardProps) {
  const overdue = content.status !== 'published' && isOverdue(content.targetDate)

  return (
    <article
      className={dragging ? 'board-card dragging' : 'board-card'}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', content.id)
        e.dataTransfer.effectAllowed = 'move'
        onDragStart()
      }}
      onDragEnd={onDragEnd}
    >
      <Link to={`/editor/${content.id}`} className="board-card-title">
        {content.hot && (
          <span role="img" aria-label="Hot content">
            🔥{' '}
          </span>
        )}
        {content.title || 'Untitled'}
      </Link>

      {(content.pillar || content.targetDate) && (
        <p className="board-card-meta">
          {content.pillar && <span className="chip">{content.pillar}</span>}
          {content.targetDate && (
            <span className={overdue ? 'chip overdue' : 'chip'}>{formatDate(content.targetDate)}</span>
          )}
        </p>
      )}

      {/* Pamalit sa drag para sa phone/touch */}
      <select
        className="move-select"
        aria-label={`Move ${content.title || 'untitled'}`}
        value={content.status}
        onChange={(e) => onMove(e.target.value as ContentStatus)}
      >
        {STATUSES.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>
    </article>
  )
}