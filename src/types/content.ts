export type ContentStatus =
  | 'idea'
  | 'script_ready'
  | 'recorded'
  | 'edited'
  | 'scheduled'
  | 'published'

export type Platform = 'Facebook' | 'TikTok' | 'YouTube' | 'Instagram'

/** Isang pagbabago sa content, para sa Activity page */
export interface ActivityEntry {
  at: string
  type: 'edited' | 'moved'
  /** Hal. "Idea → Recorded" o "Changed: script, caption" */
  detail: string
}

/** Naunang bersyon ng script, bago ito napalitan */
export interface ScriptVersion {
  script: string
  /** Kailan huling na-save ang bersyong ito */
  savedAt: string
}

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
  /** Caption para sa post (pareho sa lahat ng platform) */
  caption?: string
  /** Hal. "#life #mindset" */
  hashtags?: string
  /** Mga naunang bersyon ng script, pinakabago ang una */
  history?: ScriptVersion[]
  /** Mga pagbabago, pinakabago ang una */
  log?: ActivityEntry[]
  createdAt: string
  updatedAt: string
}

/** Ang mga field na galing sa form (walang id at timestamps) */
export type ContentInput = Omit<Content, 'id' | 'createdAt' | 'updatedAt' | 'history' | 'log'>