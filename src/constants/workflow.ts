import type { ContentInput, ContentStatus, Platform } from '../types/content'

export interface StatusMeta {
  id: ContentStatus
  label: string
  emoji: string
}

/** Ang pagkakasunod-sunod dito ang order ng mga column sa Board. */
export const STATUSES: StatusMeta[] = [
  { id: 'idea', label: 'Idea', emoji: '💡' },
  { id: 'script_ready', label: 'Script Ready', emoji: '✍️' },
  { id: 'recorded', label: 'Recorded', emoji: '🎙️' },
  { id: 'edited', label: 'Edited', emoji: '🎬' },
  { id: 'scheduled', label: 'Scheduled', emoji: '📅' },
  { id: 'published', label: 'Published', emoji: '🚀' },
]

export const STATUS_MAP = Object.fromEntries(
  STATUSES.map((s) => [s.id, s]),
) as Record<ContentStatus, StatusMeta>

export const PLATFORMS: Platform[] = ['Facebook', 'TikTok', 'YouTube', 'Instagram']

export const PILLAR_SUGGESTIONS = [
  'Life / Nostalgia',
  'Relationships',
  'Growth',
  'Reflection',
]

export function createEmptyInput(): ContentInput {
  return {
    title: '',
    quote: '',
    script: '',
    status: 'idea',
    pillar: '',
    platforms: [],
    targetDate: '',
    notes: '',
  }
}
