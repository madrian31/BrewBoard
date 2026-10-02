import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useContent } from '../content/useContent'
import type { Content } from '../../types/content'
import { toISO, todayISO } from '../../utils/date'
import './CalendarPage.css'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CalendarPage() {
  const { items } = useContent()
  const here = useLocation()
  const from = here.pathname + here.search
  const today = todayISO()
  const [cursor, setCursor] = useState(() => {
    const [y, m] = today.split('-').map(Number)
    return { year: y, month: m - 1 }
  })

  const byDate = useMemo(() => {
    const map = new Map<string, Content[]>()
    for (const c of items) {
      if (!c.targetDate) continue
      map.set(c.targetDate, [...(map.get(c.targetDate) ?? []), c])
    }
    return map
  }, [items])

  const unscheduled = items.filter((c) => !c.targetDate && c.status !== 'published')

  // Kumpletong linggo (Sun-Sat) na sumasaklaw sa buwan
  const firstWeekday = new Date(cursor.year, cursor.month, 1).getDay()
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const label = new Date(cursor.year, cursor.month, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  function shift(delta: number) {
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  return (
    <div className="page calendar-page">
      <header className="page-header cal-header">
        <h1>{label}</h1>
        <div className="cal-nav">
          <button className="btn btn-small" onClick={() => shift(-1)} aria-label="Previous month">
            Prev
          </button>
          <button
            className="btn btn-small"
            onClick={() => {
              const [y, m] = today.split('-').map(Number)
              setCursor({ year: y, month: m - 1 })
            }}
          >
            Today
          </button>
          <button className="btn btn-small" onClick={() => shift(1)} aria-label="Next month">
            Next
          </button>
        </div>
      </header>

      <div className="cal-grid" role="grid" aria-label={label}>
        {WEEKDAYS.map((d) => (
          <div key={d} className="cal-weekday" role="columnheader">
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`b${i}`} className="cal-cell blank" />
          const iso = toISO(cursor.year, cursor.month, day)
          const list = byDate.get(iso) ?? []
          return (
            <div
              key={iso}
              className={iso === today ? 'cal-cell today' : 'cal-cell'}
              role="gridcell"
              data-date={iso}
            >
              <div className="cal-day">
                <span className="cal-num">{day}</span>
                <Link to={`/editor?date=${iso}`} state={{ from }} className="cal-add" aria-label={`Add content on ${iso}`}>
                  +
                </Link>
              </div>
              {list.map((c) => (
                <Link
                  key={c.id}
                  to={`/editor/${c.id}`}
                  state={{ from }}
                  className="cal-item"
                  data-status={c.status}
                  title={c.title}
                >
                  {c.title}
                </Link>
              ))}
            </div>
          )
        })}
      </div>

      {unscheduled.length > 0 && (
        <section className="unscheduled">
          <h2>No target date ({unscheduled.length})</h2>
          <ul>
            {unscheduled.map((c) => (
              <li key={c.id}>
                <Link to={`/editor/${c.id}`} state={{ from }}>
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}