import type { Content } from '../../types/content'

/**
 * Ang lumang localStorage na gamit bago ang Firebase.
 * Binabasa na lang ito para mailipat ang lumang data sa account.
 */
const KEY = 'brewboard:content:v1'
const MIGRATED_KEY = 'brewboard:migrated-to-cloud:v1'

export function loadLegacyContent(): Content[] {
  try {
    if (localStorage.getItem(MIGRATED_KEY)) return []
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Content[]) : []
  } catch {
    return []
  }
}

export function markLegacyMigrated(): void {
  try {
    localStorage.setItem(MIGRATED_KEY, new Date().toISOString())
  } catch {
    /* hindi kritikal */
  }
}
