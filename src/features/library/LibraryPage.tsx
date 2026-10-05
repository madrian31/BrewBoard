import { useMemo, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { useContent } from '../content/useContent'
import { STATUSES } from '../../constants/workflow'
import type { ContentStatus } from '../../types/content'
import ContentRow from './ContentRow'
import BulkBar from './BulkBar'
import './LibraryPage.css'

export default function LibraryPage() {
  const { items, updateMany, deleteMany } = useContent()
  const [params, setParams] = useSearchParams()
  const here = useLocation()
  const from = here.pathname + here.search
  const [query, setQuery] = useState('')
  const [pillar, setPillar] = useState('')

  // Bulk select
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [message, setMessage] = useState<string | null>(null)

  const status = (params.get('status') ?? '') as ContentStatus | ''
  const hotOnly = params.get('hot') === '1'
  const hotCount = items.filter((c) => c.hot).length

  // [pangalan, bilang] kada pillar, naka-sort ayon sa pangalan
  const pillars = useMemo(() => {
    const counts = new Map<string, number>()
    for (const c of items) {
      if (c.pillar) counts.set(c.pillar, (counts.get(c.pillar) ?? 0) + 1)
    }
    return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [items])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items
      .filter((c) => !status || c.status === status)
      .filter((c) => !pillar || c.pillar === pillar)
      .filter((c) => !hotOnly || c.hot)
      .filter(
        (c) =>
          !q || [c.title, c.quote, c.script, c.notes, c.caption ?? '', c.hashtags ?? ''].some((f) =>
            f.toLowerCase().includes(q),
          ),
      )
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }, [items, query, status, pillar, hotOnly])

  // Ang napili LANG na nakikita ngayon ang tatamaan ng bulk action (hindi ang mga nakatagong dahil sa filter)
  const selectedIds = useMemo(
    () => visible.filter((c) => selected.has(c.id)).map((c) => c.id),
    [visible, selected],
  )
  const allSelected = visible.length > 0 && selectedIds.length === visible.length

  function announce(text: string) {
    setMessage(text)
    window.setTimeout(() => setMessage(null), 4000)
  }

  function toggleSelectMode() {
    setSelectMode((on) => !on)
    setSelected(new Set())
    setMessage(null)
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(visible.map((c) => c.id)))
  }

  const plural = (n: number) => `${n} ${n === 1 ? 'piece' : 'pieces'}`

  function bulkMove(next: ContentStatus) {
    updateMany(selectedIds, { status: next })
    const label = STATUSES.find((s) => s.id === next)?.label ?? next
    announce(`Moved ${plural(selectedIds.length)} to ${label}.`)
  }

  function bulkPillar(name: string) {
    updateMany(selectedIds, { pillar: name })
    announce(
      name
        ? `Set pillar "${name}" on ${plural(selectedIds.length)}.`
        : `Removed the pillar from ${plural(selectedIds.length)}.`,
    )
  }

  function bulkHot(hot: boolean) {
    updateMany(selectedIds, { hot })
    announce(`${hot ? 'Marked' : 'Unmarked'} ${plural(selectedIds.length)} as hot.`)
  }

  function bulkDelete() {
    const n = selectedIds.length
    if (!confirm(`Delete ${plural(n)}? This can't be undone.`)) return
    deleteMany(selectedIds)
    setSelected(new Set())
    announce(`Deleted ${plural(n)}.`)
  }

  // Binabago ang isang filter nang hindi nabubura ang iba
  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next)
  }

  function setStatus(next: string) {
    updateParam('status', next)
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Library</h1>
        <p className="page-sub">
          {items.length === 0
            ? 'Nothing here yet. Start with your first idea.'
            : `${visible.length} of ${items.length} ${items.length === 1 ? 'piece' : 'pieces'}`}
        </p>
      </header>

      {items.length > 0 && (
        <div className="filters">
          <input
            type="search"
            className="input filter-search"
            placeholder="Search titles, quotes, scripts, captions, notes"
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
                {s.label}
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
            {pillars.map(([p, n]) => (
              <option key={p} value={p}>
                {p} ({n})
              </option>
            ))}
          </select>
          <button
            type="button"
            className={hotOnly ? 'btn btn-primary' : 'btn'}
            aria-pressed={hotOnly}
            onClick={() => updateParam('hot', hotOnly ? '' : '1')}
          >
            🔥 Hot only ({hotCount})
          </button>
          <button
            type="button"
            className={selectMode ? 'btn btn-primary' : 'btn'}
            aria-pressed={selectMode}
            onClick={toggleSelectMode}
          >
            {selectMode ? 'Done selecting' : 'Select'}
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="empty">
          <p>Every Cup of Coffee lives here, from first idea to published.</p>
          <Link to="/editor" state={{ from }} className="btn btn-primary">
            Create your first content
          </Link>
        </div>
      ) : visible.length === 0 ? (
        <div className="empty">
          <p>Nothing matches your filters.</p>
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
        </div>
      ) : (
        <>
          {message && (
            <p role="status" className="bulk-message">
              {message}
            </p>
          )}
          {selectMode && (
            <label className="select-head">
              <input type="checkbox" checked={allSelected} onChange={toggleAll} />
              Select all {visible.length} shown
            </label>
          )}
          <ul className="rows">
            {visible.map((c) => (
              <li key={c.id}>
                <ContentRow
                  content={c}
                  selectable={selectMode}
                  selected={selected.has(c.id)}
                  onToggleSelect={() => toggleOne(c.id)}
                />
              </li>
            ))}
          </ul>
          {selectMode && selectedIds.length > 0 && (
            <BulkBar
              count={selectedIds.length}
              pillars={pillars.map(([name]) => name)}
              onMove={bulkMove}
              onPillar={bulkPillar}
              onHot={bulkHot}
              onDelete={bulkDelete}
              onClear={() => setSelected(new Set())}
            />
          )}
        </>
      )}
    </div>
  )
}