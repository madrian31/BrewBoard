import { useMemo } from 'react'
import type { Content } from '../../types/content'
import { toISO, todayISO } from '../../utils/date'
import './PillarBalance.css'

/** Ilang araw na walang bagong post bago ituring na "matagal na" */
const STALE_DAYS = 14
const NO_PILLAR = 'No pillar'
const NO_PILLAR_LABEL = 'Not assigned to a pillar yet'

interface Row {
  name: string
  count: number
  published: number
  /** Ilang araw mula sa huling post. null = wala pang na-publish. */
  daysSince: number | null
}

function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function daysBetween(from: string, to: string): number {
  return Math.round((parseISO(to).getTime() - parseISO(from).getTime()) / 86_400_000)
}

/** Petsa ng post: ang target date kung lampas na o ngayon, kung hindi, ang araw ng huling update. */
function postedOn(c: Content, today: string): string {
  if (c.targetDate && c.targetDate <= today) return c.targetDate
  const u = new Date(c.updatedAt)
  return toISO(u.getFullYear(), u.getMonth(), u.getDate())
}

/** Maikling detalye sa ilalim ng pangalan. Wala kung wala namang masasabi. */
function detail(r: Row): string | null {
  if (r.name === NO_PILLAR) return 'Open these in the editor to give them a pillar.'
  if (r.published === 0) return null
  const d = r.daysSince ?? 0
  const when = d <= 0 ? 'today' : d === 1 ? 'yesterday' : `${d} days ago`
  return `${r.published} published · last post ${when}`
}

export default function PillarBalance({ items }: { items: Content[] }) {
  const { rows, stale } = useMemo(() => {
    const today = todayISO()
    const map = new Map<string, Row>()

    for (const c of items) {
      const name = c.pillar || NO_PILLAR
      const row = map.get(name) ?? { name, count: 0, published: 0, daysSince: null }
      row.count++
      if (c.status === 'published') {
        row.published++
        const d = Math.max(daysBetween(postedOn(c, today), today), 0)
        if (row.daysSince === null || d < row.daysSince) row.daysSince = d
      }
      map.set(name, row)
    }

    // Pinakamarami ang una; ang "No pillar" ay laging nasa dulo
    const rows = [...map.values()].sort((a, b) => {
      if (a.name === NO_PILLAR) return 1
      if (b.name === NO_PILLAR) return -1
      return b.count - a.count
    })
    // "Matagal na" = nakapag-post na dati pero lampas na sa limit. Ang wala pang post ay hindi pinapagalitan.
    const stale = rows.filter(
      (r) => r.name !== NO_PILLAR && r.daysSince !== null && r.daysSince > STALE_DAYS,
    )
    return { rows, stale }
  }, [items])

  if (rows.length === 0) return null

  const total = items.length
  const anyPublished = rows.some((r) => r.published > 0)

  return (
    <section className="balance" aria-label="Pillar balance">
      <h2>Pillar balance</h2>
      <p className="balance-sub">
        Which topics you make the most of. Each bar is that pillar&apos;s share of all {total}{' '}
        {total === 1 ? 'piece' : 'pieces'}.
      </p>
      {!anyPublished && (
        <p className="balance-sub">
          Nothing is published yet. Once you publish, you&apos;ll also see when you last posted for
          each pillar.
        </p>
      )}

      {stale.length > 0 && (
        <p role="status" className="balance-alert">
          Time to post again:{' '}
          {stale.map((r) => `${r.name} (${r.daysSince} days since last post)`).join(', ')}
        </p>
      )}

      <ul className="balance-list">
        {rows.map((r) => {
          const isStale = stale.includes(r)
          const exact = (r.count / total) * 100
          const share = Math.round(exact)
          const note = detail(r)
          return (
            <li key={r.name} className={r.name === NO_PILLAR ? 'balance-row muted' : 'balance-row'}>
              <div className="balance-info">
                <span className="balance-name">
                  {r.name === NO_PILLAR ? NO_PILLAR_LABEL : r.name}
                </span>
                {note && (
                  <span className={isStale ? 'balance-detail stale' : 'balance-detail'}>{note}</span>
                )}
              </div>
              <span
                className="balance-bar"
                role="img"
                aria-label={`${r.count} of ${total} pieces, ${share}% of all`}
              >
                <span className="balance-fill" style={{ width: `${exact}%` }} />
              </span>
              <span className="balance-count">
                <strong>{r.count}</strong>
                <small>{share}% of all</small>
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}