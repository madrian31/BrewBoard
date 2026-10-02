import type { Content } from '../../types/content'

const KEY = 'brewboard:content:v1'
const CORRUPT_KEY = `${KEY}:corrupt`

/**
 * Tanging file na ito ang nakakaalam kung saan nakasave ang data.
 * Kapag lilipat sa Firestore, dito ang papalitan.
 */
export function loadContent(): Content[] {
  let raw: string | null = null
  try {
    raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) throw new Error('Hindi array ang naka-save')
    return parsed as Content[]
  } catch {
    // Huwag hayaang mabura ng susunod na save ang sirang data: itago muna ang kopya.
    if (raw) {
      try {
        localStorage.setItem(CORRUPT_KEY, raw)
      } catch {
        /* wala nang magagawa */
      }
    }
    return []
  }
}

// --- Status ng pag-save (para makita ng UI kapag puno na ang storage) ---
let saveFailed = false
const listeners = new Set<() => void>()

function setSaveFailed(next: boolean) {
  if (saveFailed === next) return
  saveFailed = next
  listeners.forEach((l) => l())
}

export function subscribeSaveStatus(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getSaveFailed(): boolean {
  return saveFailed
}

export function saveContent(items: Content[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(items))
    setSaveFailed(false)
  } catch (err) {
    console.error('Hindi na-save ang content', err)
    setSaveFailed(true)
  }
}
