import { PLATFORMS, STATUSES } from '../../constants/workflow'
import type { Content, ContentStatus } from '../../types/content'

const STATUS_IDS = STATUSES.map((s) => s.id)

function str(v: unknown): string {
  return typeof v === 'string' ? v : ''
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