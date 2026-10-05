import { STATUSES } from '../../constants/workflow'
import type { ContentStatus } from '../../types/content'
import './BulkBar.css'

interface Props {
  count: number
  pillars: string[]
  onMove: (status: ContentStatus) => void
  /** '' = alisin ang pillar */
  onPillar: (pillar: string) => void
  onHot: (hot: boolean) => void
  onDelete: () => void
  onClear: () => void
}

const NEW_PILLAR = '__new__'
const NO_PILLAR = '__none__'

/** Lumalabas sa ilalim kapag may napiling content sa Library. */
export default function BulkBar({ count, pillars, onMove, onPillar, onHot, onDelete, onClear }: Props) {
  function pickPillar(value: string) {
    if (value === NO_PILLAR) return onPillar('')
    if (value === NEW_PILLAR) {
      const name = window.prompt('Name of the new pillar:')?.trim()
      if (name) onPillar(name)
      return
    }
    if (value) onPillar(value)
  }

  return (
    <div className="bulk-bar" role="region" aria-label="Bulk actions">
      <span className="bulk-count">{count} selected</span>

      <select
        className="bulk-select"
        aria-label="Move selected to status"
        value=""
        onChange={(e) => e.target.value && onMove(e.target.value as ContentStatus)}
      >
        <option value="">Move to…</option>
        {STATUSES.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>

      <select
        className="bulk-select"
        aria-label="Set pillar for selected"
        value=""
        onChange={(e) => pickPillar(e.target.value)}
      >
        <option value="">Set pillar…</option>
        {pillars.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
        <option value={NEW_PILLAR}>+ New pillar…</option>
        <option value={NO_PILLAR}>Remove pillar</option>
      </select>

      <button type="button" className="bulk-btn" onClick={() => onHot(true)}>
        🔥 Mark hot
      </button>
      <button type="button" className="bulk-btn" onClick={() => onHot(false)}>
        Unmark hot
      </button>
      <button type="button" className="bulk-btn bulk-danger" onClick={onDelete}>
        Delete
      </button>
      <button type="button" className="bulk-btn bulk-clear" onClick={onClear}>
        Clear
      </button>
    </div>
  )
}
