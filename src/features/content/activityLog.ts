import { STATUSES } from '../../constants/workflow'
import type { ActivityEntry, Content, ContentInput, ContentStatus } from '../../types/content'

const FIELD_LABELS: Record<keyof ContentInput, string> = {
  title: 'title',
  quote: 'quote',
  script: 'script',
  status: 'status',
  pillar: 'pillar',
  platforms: 'platforms',
  targetDate: 'target date',
  notes: 'notes',
  hot: 'hot mark',
  caption: 'caption',
  hashtags: 'hashtags',
}

function statusLabel(id: ContentStatus): string {
  return STATUSES.find((s) => s.id === id)?.label ?? id
}

function norm(key: keyof ContentInput, value: unknown): string {
  if (key === 'hot') return JSON.stringify(!!value)
  return JSON.stringify(value ?? '')
}

function changedFields(current: Content, patch: Partial<ContentInput>): (keyof ContentInput)[] {
  return (Object.keys(patch) as (keyof ContentInput)[]).filter(
    (k) => norm(k, patch[k]) !== norm(k, current[k]),
  )
}

/** Ano ang nangyari sa isang content? null kung walang tunay na nagbago. */
export function describeUpdate(
  current: Content,
  patch: Partial<ContentInput>,
): Pick<ActivityEntry, 'type' | 'detail'> | null {
  const fields = changedFields(current, patch)
  if (fields.length === 0) return null
  if (fields.length === 1 && fields[0] === 'status') {
    return {
      type: 'moved',
      detail: `${statusLabel(current.status)} → ${statusLabel(patch.status as ContentStatus)}`,
    }
  }
  return { type: 'edited', detail: `Changed: ${fields.map((f) => FIELD_LABELS[f]).join(', ')}` }
}