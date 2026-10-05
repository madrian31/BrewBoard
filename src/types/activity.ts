export const ACTIVITY_TYPES = ['added', 'edited', 'moved', 'deleted', 'bulk', 'imported'] as const
export type ActivityType = (typeof ACTIVITY_TYPES)[number]

/** Isang linya sa activity log. Hindi na ito nagbabago pagkatapos isulat. */
export interface ActivityEvent {
  id: string
  /** ISO timestamp */
  at: string
  type: ActivityType
  /** Wala sa bulk at import */
  contentId?: string
  /** Title noong nangyari ang event, kahit nabura na ang content */
  title?: string
  /** Hal. "Idea → Recorded" o "Changed: script, caption" */
  detail?: string
}
