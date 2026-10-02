export type ContentStatus =
  | 'idea'
  | 'script_ready'
  | 'recorded'
  | 'edited'
  | 'scheduled'
  | 'published'

export type Platform = 'Facebook' | 'TikTok' | 'YouTube' | 'Instagram'

export interface Content {
  id: string
  title: string
  quote: string
  script: string
  status: ContentStatus
  pillar: string
  platforms: Platform[]
  /** Format: YYYY-MM-DD, or '' kung wala pang target date */
  targetDate: string
  notes: string
  createdAt: string
  updatedAt: string
}

/** Ang mga field na galing sa form (walang id at timestamps) */
export type ContentInput = Omit<Content, 'id' | 'createdAt' | 'updatedAt'>
