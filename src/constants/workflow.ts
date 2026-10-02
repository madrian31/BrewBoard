import type { ContentInput, ContentStatus, Platform } from '../types/content'

export interface StatusMeta {
  id: ContentStatus
  label: string
}

/** Ang pagkakasunod-sunod dito ang order ng mga column sa Board. */
export const STATUSES: StatusMeta[] = [
  { id: 'idea', label: 'Idea' },
  { id: 'script_ready', label: 'Script Ready' },
  { id: 'recorded', label: 'Recorded' },
  { id: 'edited', label: 'Edited' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'published', label: 'Published' },
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
