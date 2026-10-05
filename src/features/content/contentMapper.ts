import { PLATFORMS, STATUSES } from '../../constants/workflow'
import type { ActivityEntry, Content, ContentStatus, ScriptVersion } from '../../types/content'

const STATUS_IDS = STATUSES.map((s) => s.id)

function str(v: unknown): string {
  return typeof v === 'string' ? v : ''
}

/** Pinakamaraming naunang bersyon ng script na itatago kada content */
export const MAX_SCRIPT_VERSIONS = 20

/** Pinakamaraming activity entry na itatago kada content */
export const MAX_ACTIVITY_LOG = 30

function parseLog(v: unknown): ActivityEntry[] {
  if (!Array.isArray(v)) return []
  return v
    .flatMap((e): ActivityEntry[] => {
      if (!e || typeof e !== 'object') return []
      const o = e as Record<string, unknown>
      const type = o.type === 'moved' ? 'moved' : o.type === 'edited' ? 'edited' : null
      const at = str(o.at)
      return type && at ? [{ at, type, detail: str(o.detail) }] : []
    })
    .slice(0, MAX_ACTIVITY_LOG)
}

function parseHistory(v: unknown): ScriptVersion[] {
  if (!Array.isArray(v)) return []
  return v
    .flatMap((e): ScriptVersion[] => {
      if (!e || typeof e !== 'object') return []
      const o = e as Record<string, unknown>
      const script = str(o.script)
      return script ? [{ script, savedAt: str(o.savedAt) }] : []
    })
    .slice(0, MAX_SCRIPT_VERSIONS)
}

/** Firestore doc -> Content. Matibay laban sa kulang o maling fields. */
export function docToContent(id: string, data: Record<string, unknown>): Content {
  const status = STATUS_IDS.includes(data.status as ContentStatus)
    ? (data.status as ContentStatus)
    : 'idea'
  const rawPlatforms = Array.isArray(data.platforms) ? (data.platforms as unknown[]) : []
  const createdAt = str(data.createdAt) || new Date(0).toISOString()

  return {
    id,
    title: str(data.title),
    quote: str(data.quote),
    script: str(data.script),
    status,
    pillar: str(data.pillar),
    platforms: PLATFORMS.filter((p) => rawPlatforms.includes(p)),
    targetDate: str(data.targetDate),
    notes: str(data.notes),
    hot: data.hot === true,
    caption: str(data.caption),
    hashtags: str(data.hashtags),
    history: parseHistory(data.history),
    log: parseLog(data.log),
    createdAt,
    updatedAt: str(data.updatedAt) || createdAt,
  }
}

/** Ang id ay nasa doc path, hindi sa loob ng data. */
export function contentToDoc(c: Content): Omit<Content, 'id'> {
  const { id, ...rest } = c
  void id
  return rest
}

export function sortByUpdated(items: Content[]): Content[] {
  return [...items].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}