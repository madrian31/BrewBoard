import { useState, type DragEvent } from 'react'
import { Link } from 'react-router-dom'
import { useContent } from '../content/useContent'
import { STATUSES } from '../../constants/workflow'
import type { Content, ContentStatus } from '../../types/content'
import { formatDate, isOverdue } from '../../utils/date'
import './BoardPage.css'

export default function BoardPage() {
  const { items, moveStatus } = useContent()
  const [overColumn, setOverColumn] = useState<ContentStatus | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)

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
        <p className="page-sub">Drag a card to its next stage.</p>
      </header>

      <div className="board">
        {STATUSES.map((s) => {
          const cards = items.filter((c) => c.status === s.id)
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
                {cards.map((c) => (
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
                {cards.length === 0 && <p className="column-empty">Empty</p>}
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
