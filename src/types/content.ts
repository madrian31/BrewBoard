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
  targetDate: string
  notes: string
  hot?: boolean
  caption?: string
  hashtags?: string
  createdAt: string
  updatedAt: string
}

export type ContentInput = Omit<Content, 'id' | 'createdAt' | 'updatedAt'>