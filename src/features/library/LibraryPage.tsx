import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useContent } from '../content/useContent'
import { STATUSES } from '../../constants/workflow'
import type { ContentStatus } from '../../types/content'
import ContentCard from './ContentCard'
import './LibraryPage.css'

export default function LibraryPage() {
  const { items } = useContent()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [pillar, setPillar] = useState('')

  const status = (params.get('status') ?? '') as ContentStatus | ''

  const pillars = useMemo(
    () => [...new Set(items.map((c) => c.pillar).filter(Boolean))].sort(),
    [items],
  )

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items
      .filter((c) => !status || c.status === status)
      .filter((c) => !pillar || c.pillar === pillar)
      .filter(
        (c) =>
          !q ||
          [c.title, c.quote, c.script, c.notes].some((f) => f.toLowerCase().includes(q)),
      )
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }, [items, query, status, pillar])

  function setStatus(next: string) {
    if (next) setParams({ status: next })
    else setParams({})
  }

  const hasFilters = Boolean(query || status || pillar)

  return (
    <div className="page">
      <header className="page-header">
        <h1>Library</h1>
        <p className="page-sub">
          {items.length === 0
            ? 'Your library is empty. Start with your first idea.'
            : `${visible.length} of ${items.length} content items`}
        </p>
      </header>

      {items.length > 0 && (
        <div className="filters">
          <input
            type="search"
            className="input filter-search"
            placeholder="Search titles, quotes, scripts, or notes"
            aria-label="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <select
            className="input"
            aria-label="Filter by status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.emoji} {s.label}
              </option>
            ))}
          </select>

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
        </div>
      )}

      {items.length === 0 ? (
        <div className="empty">
          <p>Track every Cup of Coffee here, from idea to publication.</p>
          <Link to="/editor" className="btn btn-primary">
            Add your first content
          </Link>
        </div>
      ) : visible.length === 0 ? (
        <div className="empty">
          <p>No results match your filters.</p>
          {hasFilters && (
            <button
              className="btn"
              onClick={() => {
                setQuery('')
                setPillar('')
                setParams({})
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <ul className="card-list">
          {visible.map((c) => (
            <li key={c.id}>
              <ContentCard content={c} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}